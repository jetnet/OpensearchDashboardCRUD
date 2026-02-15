/**
 * Jest Setup File
 * This file is run before each test file and sets up the testing environment.
 */

import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend({});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn((...args: unknown[]) => {
    // Filter out React warnings that are expected in tests
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Warning:') || message.includes('act(...)'))
    ) {
      return;
    }
    originalConsoleError(...args);
  });

  console.warn = jest.fn((...args: unknown[]) => {
    // Filter out expected warnings
    const message = args[0];
    if (typeof message === 'string' && message.includes('componentWillReceiveProps')) {
      return;
    }
    originalConsoleWarn(...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
