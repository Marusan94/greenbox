import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

// Un project por sitio: asi se corre cada suite por separado.
// trace solo en fallo + reporte HTML (rapido y barato).
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  // Sitios en capa gratuita (Vercel/Render/Pages): en serie para no saturarlos ni falsear tiempos.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    // Terramind usa mapa 3D WebGL: --disable-gpu evita cierres de pagina en headless/CI.
    { name: 'terramind', testMatch: /terramind\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: process.env.TERRAMIND_URL ?? 'https://terramind-mu.vercel.app', launchOptions: { args: ['--disable-gpu'] } } },
    { name: 'pulso', testMatch: /pulso\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: process.env.PULSO_URL ?? 'https://marusan94.github.io/pulso-github/02-midnight-console.html' } },
    { name: 'querylands', testMatch: /querylands\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: process.env.QUERYLANDS_URL ?? 'https://tech-interview-lab.vercel.app/' } },
    { name: 'educore', testMatch: /educore\.spec\.ts/, use: { ...devices['Desktop Chrome'], baseURL: process.env.EDUCORE_URL ?? 'https://educore-frontend-co5c.onrender.com/' } },
  ],
});
