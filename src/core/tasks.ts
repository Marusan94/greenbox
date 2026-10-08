import type { Actor, Task } from './actor';

// OpenApp: abre la baseURL del project. Reutilizable en los 4 sitios.
export const OpenApp = {
  now: (): Task => ({
    async performAs(actor: Actor) {
      await actor.browse.goto('/');
    },
  }),
};

// SearchFor: escribe en el primer buscador visible y confirma con Enter.
// Si el sitio no tiene buscador, el spec debe cambiar el escenario (no inventar selectores).
export const SearchFor = {
  text: (value: string): Task => ({
    async performAs(actor: Actor) {
      const page = actor.browse;
      const box = page.getByRole('searchbox').or(page.getByPlaceholder(/buscar|search/i)).first();
      await box.fill(value);
      await box.press('Enter');
    },
  }),
};

// NavigateToTab: clica una pestaña/enlace por nombre accesible y espera que cargue.
export const NavigateToTab = {
  named: (label: string | RegExp): Task => ({
    async performAs(actor: Actor) {
      const page = actor.browse;
      // rol primero, nombre despues: Playwright exige rol literal, el regex va en hasText
      await page.locator('a, button, [role="tab"]', { hasText: label }).first().click();
      await page.waitForLoadState('domcontentloaded');
    },
  }),
};
