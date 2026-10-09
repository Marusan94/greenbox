import { defineConfig, devices } from '@playwright/test';

// Config dedicada a la suite oficial Serenity/JS: registra el reporter de
// Serenity con su crew (archiva artefactos + JSON de Serenity BDD).
// La suite principal sigue intacta en playwright.config.ts.
export default defineConfig({
  testDir: './tests',
  testMatch: /serenity-.*\.spec\.ts/,
  timeout: 60_000,
  workers: 1,
  reporter: [
    ['list'],
    ['@serenity-js/playwright-test', {
      crew: [
        ['@serenity-js/core:ArtifactArchiver', { outputDirectory: './target/site/serenity' }],
        ['@serenity-js/serenity-bdd', { specDirectory: './tests' }],
      ],
    }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    trace: 'retain-on-failure',
  },
});
