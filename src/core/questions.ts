import type { Actor, Question } from './actor';

// PageTitle: titulo de la pestaña. Sirve para afirmar que el sitio correcto cargo.
export const PageTitle = {
  value: (): Question<string> => ({
    label: 'PageTitle',
    answeredBy: async (actor: Actor) => actor.browse.title(),
  }),
};

// IsVisible: ¿hay al menos un elemento visible con ese localizador? (pasar locator como string css o rol).
export const IsVisible = {
  // selector: texto, rol o css simple. Ej: 'h1', 'table', 'canvas'
  element: (selector: string): Question<boolean> => ({
    label: `IsVisible ${selector}`,
    answeredBy: async (actor: Actor) =>
      actor.browse.locator(selector).first().isVisible().catch(() => false),
  }),
};

// CountOf: cuantos elementos coinciden (tablas, tarjetas, retos). >0 = hay datos.
export const CountOf = {
  elements: (selector: string): Question<number> => ({
    label: `CountOf ${selector}`,
    answeredBy: async (actor: Actor) => actor.browse.locator(selector).count(),
  }),
};
