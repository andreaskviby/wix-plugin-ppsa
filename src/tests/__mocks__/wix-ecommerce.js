module.exports = {
  orders: {
    getOrder: jest.fn(() => Promise.resolve(null))
  },
  onOrderCreated: jest.fn(),
  onOrderUpdated: jest.fn()
};