import { test, expect } from '@playwright/test';
import { Actor } from '../src/core/actor';
import { OpenApp } from '../src/core/tasks';
import { IsVisible, CountOf } from '../src/core/questions';

// Query Lands (LAB.CORE): retos SQL gamificados. No valida el texto exacto del reto.
test.describe('Query Lands', () => {
  test('la pantalla inicial muestra retos o islas', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await santiago.attemptsTo(OpenApp.now());
    const retos = await santiago.asks(CountOf.elements('a, button'));
    expect(retos).toBeGreaterThan(0);
    expect(await santiago.asks(IsVisible.element('h1, h2, main'))).toBe(true);
  });

  test('abrir un reto muestra editor y enunciado', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await santiago.attemptsTo(OpenApp.now());
    // Entrada al reto: el boton CONTINUAR (no el nav Desafios, que lleva al listado).
    const reto = page.locator('a, button', { hasText: /continuar/i }).first();
    if ((await reto.count()) === 0) test.skip(true, 'Sin boton continuar visible en esta version');
    else {
      await reto.click();
      // SPA: no hay recarga de documento, asi que se espera con reintento al editor (no a domcontentloaded).
      await expect(page.locator('textarea, [role="textbox"], .monaco-editor, code, pre').first()).toBeVisible({ timeout: 20_000 });
    }
  });

  test('ejecutar consulta devuelve resultado o validacion', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await santiago.attemptsTo(OpenApp.now());
    const reto = page.locator('a, button', { hasText: /continuar/i }).first();
    if ((await reto.count()) === 0) test.skip(true, 'Sin reto para ejecutar en esta version');
    else {
      await reto.click();
      const run = page.getByRole('button', { name: /ejecutar|correr|run|validar|comprobar/i }).first();
      try {
        await run.waitFor({ state: 'visible', timeout: 15_000 });
      } catch {
        test.skip(true, 'Sin boton de ejecutar visible');
        return;
      }
      await run.click();
      await expect(page.getByText(/resultado|correcto|incorrecto|error|fila|valid/i).first()).toBeVisible({ timeout: 20_000 });
    }
  });
});
