module.exports = {
  query: jest.fn(() => ({
    eq: jest.fn().mockReturnThis(),
    ge: jest.fn().mockReturnThis(),
    le: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
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
    _id: 'test-id',
    createdAt: new Date()
  })),
  remove: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve())
};