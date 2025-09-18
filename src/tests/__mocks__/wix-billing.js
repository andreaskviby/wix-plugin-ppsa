module.exports = {
  getCurrentPlan: jest.fn(() => Promise.resolve({ planId: 'free' }))
};