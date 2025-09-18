module.exports = {
  getSecret: jest.fn(() => Promise.resolve('mock-secret'))
};