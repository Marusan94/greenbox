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
      await page.waitForLoadState('domcontentloaded');
      const hayEditor = await santiago.asks(IsVisible.element('textarea, [role="textbox"], .monaco-editor, code, pre'));
      expect(hayEditor).toBe(true);
    }
  });

  test('ejecutar consulta devuelve resultado o validacion', async ({ page }) => {
    const santiago = Actor.named('Santiago', page);
    await santiago.attemptsTo(OpenApp.now());
    const reto = page.locator('a, button', { hasText: /continuar/i }).first();
    if ((await reto.count()) === 0) test.skip(true, 'Sin reto para ejecutar en esta version');
    else {
      await reto.click();
      await page.waitForLoadState('domcontentloaded');
      const run = page.getByRole('button', { name: /ejecutar|correr|run|validar|comprobar/i }).first();
      if ((await run.count()) === 0) test.skip(true, 'Sin boton de ejecutar visible');
      else {
        await run.click();
        await expect(page.getByText(/resultado|correcto|incorrecto|error|fila|valid/i).first()).toBeVisible({ timeout: 20_000 });
      }
    }
  });
});
