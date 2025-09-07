import { saveResponse, getAnalytics, responseExists } from '../src/backend/responses.jsw';
import { getPlan, hasFeature } from '../src/backend/plan.jsw';
import { exportToCSV } from '../src/backend/export.jsw';

// Mock Wix Data for testing
jest.mock('wix-data', () => ({
  query: jest.fn(() => ({
    eq: jest.fn().mockReturnThis(),
    ge: jest.fn().mockReturnThis(),
    le: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    descending: jest.fn().mockReturnThis(),
    find: jest.fn(() => Promise.resolve({
      items: [],
      totalCount: 0,
      hasNext: () => false
    })),
    count: jest.fn(() => Promise.resolve(0))
  })),
  insert: jest.fn(() => Promise.resolve({
    id: 'test-id',
    createdAt: new Date()
  }))
}));

describe('Post-Purchase Survey Backend Functions', () => {
  
  describe('saveResponse', () => {
    it('should save a valid response', async () => {
      const responseData = {
        orderId: 'order-123',
        channel: 'Instagram',
        clientHints: { deviceType: 'mobile' }
      };

      const result = await saveResponse(responseData);
      
      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(false);
    });

    it('should reject duplicate responses', async () => {
      const responseData = {
        orderId: 'order-123',
        channel: 'Instagram'
      };

      // Mock existing response
      require('wix-data').query().find.mockResolvedValueOnce({
        items: [{ id: 'existing', orderId: 'order-123' }],
        totalCount: 1
      });

      const result = await saveResponse(responseData);
      
      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
    });

    it('should validate required fields', async () => {
      const result = await saveResponse({});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('orderId and channel are required');
    });
  });

  describe('getAnalytics', () => {
    it('should calculate channel distribution correctly', async () => {
      const mockResponses = [
        { channel: 'Instagram', orderValue: 100 },
        { channel: 'Instagram', orderValue: 50 },
        { channel: 'Facebook', orderValue: 75 }
      ];

      require('wix-data').query().find.mockResolvedValueOnce({
        items: mockResponses,
        totalCount: 3
      });

      const result = await getAnalytics();
      
      expect(result.success).toBe(true);
      expect(result.data.topChannels).toHaveLength(2);
      expect(result.data.topChannels[0].channel).toBe('Instagram');
      expect(result.data.totals.responses).toBe(3);
    });
  });

  describe('getPlan', () => {
    it('should return default free plan', async () => {
      const plan = await getPlan();
      
      expect(plan.planId).toBe('free');
      expect(plan.limits.responses).toBe(100);
    });
  });

  describe('hasFeature', () => {
    it('should correctly check feature availability', async () => {
      const unlimitedResponses = await hasFeature('unlimited_responses');
      const serverEvents = await hasFeature('server_events');
      
      // Free plan should not have these features
      expect(unlimitedResponses).toBe(false);
      expect(serverEvents).toBe(false);
    });
  });

  describe('exportToCSV', () => {
    it('should export responses to CSV format', async () => {
      const mockResponses = [
        {
          id: '1',
          createdAt: new Date('2024-01-01'),
          orderId: 'order-123',
          channel: 'Instagram',
          orderValue: 100,
          currency: 'USD'
        }
      ];

      require('wix-data').query().find.mockResolvedValueOnce({
        items: mockResponses,
        totalCount: 1
      });

      const result = await exportToCSV();
      
      expect(result.success).toBe(true);
      expect(result.data).toContain('Created At,Order ID');
      expect(result.filename).toContain('.csv');
    });

    it('should handle empty data gracefully', async () => {
      require('wix-data').query().find.mockResolvedValueOnce({
        items: [],
        totalCount: 0
      });

      const result = await exportToCSV();
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('No data available');
    });
  });

  describe('responseExists', () => {
    it('should check if response exists for order', async () => {
      require('wix-data').query().find.mockResolvedValueOnce({
        items: [{ orderId: 'order-123' }],
        totalCount: 1
      });

      const exists = await responseExists('order-123');
      expect(exists).toBe(true);
    });

    it('should return false for non-existing response', async () => {
      require('wix-data').query().find.mockResolvedValueOnce({
        items: [],
        totalCount: 0
      });

      const exists = await responseExists('order-999');
      expect(exists).toBe(false);
    });
  });
});

describe('Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    require('wix-data').query().find.mockRejectedValueOnce(new Error('Database error'));

    const result = await saveResponse({
      orderId: 'order-123',
      channel: 'Instagram'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database error');
  });
});

describe('Plan Limits', () => {
  it('should enforce free plan response limits', async () => {
    // Mock monthly count to exceed free limit
    require('wix-data').query().count.mockResolvedValueOnce(101);

    const result = await saveResponse({
      orderId: 'order-124',
      channel: 'Instagram'
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Monthly response limit exceeded');
  });
});