module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^opensearch-dashboards/server$': '<rootDir>/server/mocks.ts',
  },
};
