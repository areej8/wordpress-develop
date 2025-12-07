// tests/cypress/cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8889',
    supportFile: 'tests/cypress/support/e2e.js',
    specPattern: 'tests/cypress/e2e/**/*.cy.js',
    videosFolder: 'tests/cypress/videos',
    screenshotsFolder: 'tests/cypress/screenshots',
    downloadsFolder: 'tests/cypress/downloads',
    fixturesFolder: 'tests/cypress/fixtures',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config
    },
  },
  
  // Test configuration
  video: true,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
  
  // Environment variables
  env: {
    wpAdminUser: 'admin',
    wpAdminPass: 'password',
    wpAdminEmail: 'admin@example.com'
  }
})
