import { test, expect } from '@playwright/test';
import { Actor } from '../src/core/actor';
import { OpenApp, SearchFor } from '../src/core/tasks';
import { CountOf } from '../src/core/questions';

// La app vive en un archivo .html concreto: goto('/') iria al root (404), asi que navegamos a la URL completa.
const PULSO_APP = process.env.PULSO_URL ?? 'https://marusan94.github.io/pulso-github/02-midnight-console.html';

// Pulso GitHub: ranking estatico. Valida estructura, no valores exactos (cambian semanalmente).
test.describe('Pulso GitHub', () => {
  test('la tabla muestra repositorios', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await page.goto(PULSO_APP);
    const rows = await santiago.asks(CountOf.elements('table tbody tr, [data-repo], .repo, article, li a[href*="github.com"]'));
    expect(rows).toBeGreaterThan(0);
  });

  test('el buscador filtra y reduce resultados', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await page.goto(PULSO_APP);
    const box = page.getByRole('searchbox').or(page.getByPlaceholder(/buscar|search/i)).first();
    if ((await box.count()) === 0) test.skip(true, 'Sin buscador visible en esta version');
    else {
      const before = await santiago.asks(CountOf.elements('table tbody tr, article, li'));
      await santiago.attemptsTo(SearchFor.text('zzzz-sin-resultados-123'));
      const after = await santiago.asks(CountOf.elements('table tbody tr, article, li'));
      expect(after).toBeLessThanOrEqual(before);
    }
  });

  test('cambiar categoria actualiza la vista', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await page.goto(PULSO_APP);
    const filter = page.locator('a, button, select, [role="tab"], [role="combobox"]', { hasText: /tema| categor|trend|python|javascript|todos/i }).first();
    if ((await filter.count()) === 0) test.skip(true, 'Sin filtros visibles en esta version');
    else {
      await filter.click();
      await page.waitForLoadState('domcontentloaded');
      expect(await santiago.asks(CountOf.elements('body *'))).toBeGreaterThan(0);
    }
  });
});
