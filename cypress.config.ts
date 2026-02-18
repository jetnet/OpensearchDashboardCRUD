import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5601',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    env: {
      username: 'admin',
      password: 'admin',
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
