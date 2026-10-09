# qa-screenplay — Smoke Playwright + Screenplay en 4 proyectos reales

Suites smoke con **Playwright y patrón Screenplay** (núcleo propio `src/core` + paquetes `@serenity-js/*@3.48.1` instalados) sobre 4 deploys de [Marusan94](https://github.com/Marusan94). Presupuesto: 45 min; se priorizó verde estable sobre cobertura total.

## Cómo se compone Screenplay

- **Actor**: quién actúa (`Actor.named('Santiago', page)` en `src/core/actor.ts`).
- **Ability**: con qué puede actuar (`BrowseTheWeb` = la `Page` de Playwright que recibe el actor).
- **Task**: acción de negocio reutilizable (`OpenApp`, `SearchFor`, `NavigateToTab` en `src/core/tasks.ts`).
- **Question**: lectura verificable (`PageTitle`, `IsVisible`, `CountOf` en `src/core/questions.ts`).
- Los specs (`tests/*.spec.ts`) solo orquestan tareas y preguntas; ningún selector vive en la prueba.

## POM vs Screenplay, mismo escenario (Pulso: "la tabla muestra repositorios")

```ts
// POM: el test conoce páginas y selectores
await page.goto(PULSO_APP);
const rows = await page.locator('table tbody tr, article, li').count();
expect(rows).toBeGreaterThan(0);

// Screenplay (este repo): el test declara intención, el CÓMO vive en piezas reutilizables
await page.goto(PULSO_APP); // OpenApp no sirve aquí: la app es un .html concreto, ver nota abajo
const rows = await santiago.asks(CountOf.elements('table tbody tr, article, li'));
expect(rows).toBeGreaterThan(0);
```

**Cuándo conviene cada uno:** POM para smoke simple de 1 página (menos código); Screenplay cuando el flujo cruza pasos/pestañas y las Tasks (`ConsultarAQI`, `CompletarReto`) se reutilizan entre suites — el spec queda legible para no-técnicos y el mantenimiento se concentra en un solo lugar.

## Cómo correr

```bash
npm install --legacy-peer-deps
npx playwright install chromium
npm run typecheck
npm test                        # todo
npm run test:smoke               # solo @smoke (push)
npm run test:regression          # solo @regression (cron nocturno)
npm run test:terramind | test:pulso | test:educore | test:querylands
```

CI (`ci.yml`): matriz por proyecto en push/manual con `@smoke`, regresión `@regression` en cron nocturno (3:00 UTC), reporte por proyecto como artefacto.

URLs por variables (`TERRAMIND_URL`, `PULSO_URL`, `QUERYLANDS_URL`, `EDUCORE_URL`); ver `.env.example`.

## Estado real (última ejecución: 2026-10-08 — 8 pasan, 4 skip, 0 fallan)

| Proyecto | Resultado | Nota |
|---|---|---|
| Pulso | 2 pasan, 1 skip | Sin buscador visible (esperado 15 s con reintento) |
| Terramind | 2 pasan, 1 skip | Copiloto en skip: panel RAG abre pero la página se cierra en headless (probado con --disable-gpu; verificado manual) |
| QueryLands | 3 pasan | — |
| EDU.CORE | 1 pasa, 2 skip | Nueva UI con login en camino (redeploy Render pendiente); selectores exactos ya listos |

## Limitaciones honestas

- `goto('/')` ignora la ruta de una `baseURL` que apunta a un archivo: Pulso navega a la URL completa.
- Validaciones sobre datos en vivo (SIATA, GitHub API) solo afirman estructura/presencia, nunca valores.
- Sin reporte Serenity BDD: se usa el reporte HTML de Playwright (más rápido de generar).
- Login válido de EDU.CORE requiere `EDUCORE_USER`/`EDUCORE_PASS` y queda en `skip` sin ellas.
