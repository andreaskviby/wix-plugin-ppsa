require('@testing-library/jest-dom');

// Mock analytics functions
window.gtag = jest.fn();
window.fbq = jest.fn();
window.dataLayer = [];

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};