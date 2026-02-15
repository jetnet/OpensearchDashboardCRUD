module.exports = {
  rootDir: './opensearch-crud-plugin',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  displayName: 'opensearch-crud-plugin',
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.test.tsx',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/tests/**/*.spec.tsx',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    '<rootDir>/server/**/*.ts',
    '<rootDir>/public/**/*.ts',
    '<rootDir>/public/**/*.tsx',
    '!<rootDir>/public/**/*.d.ts',
    '!<rootDir>/server/**/*.d.ts',
    '!<rootDir>/public/index.ts',
    '!<rootDir>/server/index.ts',
    '!<rootDir>/public/types/**',
    '!<rootDir>/server/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  
  // Module name mapper for path aliases
  moduleNameMapper: {
    // CSS/SCSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Static assets
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.ts',
    // Path aliases (adjust based on tsconfig paths)
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/target/',
    '/coverage/',
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],
  
  // Globals
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Timeout
  testTimeout: 10000,
};
