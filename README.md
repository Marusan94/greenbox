# ✅ Greenbox — Automatización de pruebas con Playwright + Screenplay sobre 4 proyectos reales

**Demo en vivo:** https://greenbox-portfolio.vercel.app

[![CI](https://github.com/Marusan94/greenbox/actions/workflows/ci.yml/badge.svg)](https://github.com/Marusan94/greenbox/actions)
![Playwright](https://img.shields.io/badge/Playwright-1.64-45ba4b)
![Serenity/JS](https://img.shields.io/badge/Serenity%2FJS-3.48-7c3aed)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6)
![Tests](https://img.shields.io/badge/tests-10%20verdes%20%C2%B7%204%20skip%20%C2%B7%200%20fallos-brightgreen)

*La caja verde: si todo está en verde, se publica.* Portafolio práctico de **Analista QA con automatización**: suites smoke y regresión con **Playwright** y el **patrón Screenplay**, ejecutadas contra 4 aplicaciones reales desplegadas de [Marusan94](https://github.com/Marusan94) (Terramind, Pulso GitHub, Query Lands/LAB.CORE y EDU.CORE). Todo lo afirmado aquí está ejecutado; lo pendiente está declarado como tal.

## Hub de reportes (generados localmente)

<video src="docs/img/tour.mp4" controls width="100%"></video>

`npm test && npm run flow:report && npm run flow:hub` genera `flow-report/hub.html`: barra lateral con el mapa del sistema, las historias Flow, las 9 secuencias del visor oficial y los reportes Playwright/Serenity. Los temas Dark/Light y los presets Classic/Signal/Blueprint/Editorial se conmutan desde el hub y aplican a todas las vistas.

![Mapa del sistema en visor Archify](docs/img/system.png)

![Historias Flow por prueba](docs/img/flow-light.png)

![Secuencia oficial de una prueba](docs/img/sequence.png)

## 1. Cobertura frente a una oferta real de Analista QA (Medellín/Bogotá)

| Requisito de la oferta | Evidencia en este repo | Estado |
|---|---|---|
| Playwright (no negociable) | Suites E2E en Chromium, `playwright.config.ts` (projects por sitio, `trace: retain-on-failure`, reporte HTML, `workers: 1`) | ✅ Verificado |
| Patrón Screenplay (no negociable) | Núcleo `src/core/` reutilizado en 4 suites **+ suite oficial Serenity/JS** (`tests/serenity-pulso.spec.ts` con Actor/Tasks/Questions de la librería y reporte Serenity BDD) | ✅ Verificado |
| POM y otros patrones | Comparativa POM vs Screenplay con ejemplo real del repo (sección 4) | ✅ Verificado |
| Smoke + regresión | Tags `@smoke` / `@regression`; `npm run test:smoke` (push) y `test:regression` (cron nocturno en CI) | ✅ Verificado |
| Caja negra (equivalencia, límites) | Login válido/inválido (equivalencia), password < 6 caracteres (valor límite), tablas con conteo > 0 | ✅ Verificado |
| Gestión de defectos, métricas, riesgos | Sección 7: 3 defectos reales con severidad + métricas de ejecución | ✅ Verificado |
| Scrum / Kanban / híbrido | Entrega por iteraciones cortas con gates verificables (typecheck → tests → commit por avance) | ✅ Verificado |

## 2. Arquitectura

```
greenbox/
├── src/core/          # Patrón Screenplay: actor.ts, tasks.ts, questions.ts
├── src/flow/          # Módulo Flow: recorder.ts (graba cada paso Actor->Task->Página)
├── scripts/           # flow-report.js (dibuja el flujo como historia visual)
├── tests/             # 1 suite por proyecto (terramind, pulso, querylands, educore)
├── .github/workflows/ # CI: matriz por proyecto (smoke en push, regresión en cron)
├── playwright.config.ts  # 1 project por sitio, baseURL por env, trace en fallos
├── INTERVIEW.md       # 5 preguntas de entrevista + 5 historias STAR del trabajo real
└── .env.example       # URLs y secretos (nunca credenciales en el repo)
```

Flujo: el *Actor* (Santiago, el visitante) ejecuta *Tasks* con su *Ability* (`BrowseTheWeb` = la página de Playwright) y comprueba *Questions*. Los specs solo orquestan intención de negocio; ningún selector vive en la prueba.

## 3. Módulo Flow: ver cada prueba como historia 🎬

¿Se puede *ver* el flujo de una prueba Screenplay? Sí: el `Actor` graba solo cada Task (con su duración real) y cada Question (con su respuesta) en `flow/<prueba>.json`, y `npm run flow:report` los dibuja como **diagramas de secuencia** en `flow-report/index.html` (autocontenido, sin dependencias): Santiago → Tareas → Página, con flechas, tiempos y respuestas, más tabla paso a paso.

```bash
npx playwright test          # graba el flujo de cada prueba en flow/
npm run flow:report          # dibuja flow-report/index.html
```

Úsalo para depurar ("¿qué paso tardó 20 s?"), para mostrarle a alguien no técnico qué hace la suite, y para defender el patrón en entrevista con evidencia visual.

## 4. Cómo se compone Screenplay (para defenderlo en entrevista)

- **Actor**: quién actúa (`Actor.named('Santiago', page)` en `src/core/actor.ts`).
- **Ability**: con qué puede actuar (`BrowseTheWeb` = la `Page` de Playwright que recibe el actor).
- **Task**: acción de negocio reutilizable (`OpenApp`, `SearchFor`, `NavigateToTab` en `src/core/tasks.ts`).
- **Question**: lectura verificable (`PageTitle`, `IsVisible`, `CountOf` en `src/core/questions.ts`).

## 5. POM vs Screenplay, mismo escenario (Pulso: "la tabla muestra repositorios")

```ts
// POM: el test conoce páginas y selectores
await page.goto(PULSO_APP);
const rows = await page.locator('table tbody tr, article, li').count();
expect(rows).toBeGreaterThan(0);

// Screenplay (este repo): el test declara intención, el CÓMO vive en piezas reutilizables
await page.goto(PULSO_APP); // OpenApp no sirve aquí: la app es un .html concreto, ver sección 8
const rows = await santiago.asks(CountOf.elements('table tbody tr, article, li'));
expect(rows).toBeGreaterThan(0);
```

**Cuándo conviene cada uno:** POM para smoke simple de 1 página (menos código); Screenplay cuando el flujo cruza pasos/pestañas y las Tasks se reutilizan entre suites — el spec queda legible para no-técnicos y el mantenimiento se concentra en un solo lugar.

## 6. Cómo ejecutar

```bash
npm install --legacy-peer-deps
npx playwright install chromium
npm run typecheck
npm test                        # todo (10 pasan, 4 skip, 0 fallan)
npm run test:smoke               # solo @smoke (lo que corre en cada push)
npm run test:regression          # solo @regression (lo que corre de noche)
npm run test:serenity               # suite oficial Serenity/JS (Pulso, runner + actor de la librería)
npm run test:serenity:report        # genera el HTML de Serenity BDD en target/site/serenity (requiere Java)
npm run test:terramind | test:pulso | test:educore | test:querylands
npm run flow:report              # dibuja el flujo visual de la última corrida
```

URLs por variables (`TERRAMIND_URL`, `PULSO_URL`, `QUERYLANDS_URL`, `EDUCORE_URL`); ver `.env.example`. CI (`ci.yml`): matriz por proyecto en push/manual con `@smoke`, regresión `@regression` en cron nocturno (3:00 UTC), reporte por proyecto como artefacto.

## 7. Métricas reales (última ejecución: 2026-10-08)

| Proyecto | Resultado | Nota |
|---|---|---|
| Pulso | 2 pasan, 1 skip | Sin buscador visible (esperado 15 s con reintento) |
| Terramind | 2 pasan, 1 skip | Copiloto en skip: panel RAG abre pero la página se cierra en headless (probado con `--disable-gpu`; verificado manual) |
| QueryLands | 3 pasan | — |
| EDU.CORE | 1 pasa, 2 skip | Nueva UI con login en camino (redeploy Render pendiente); selectores exactos ya listos |

Reglas anti-flakiness aplicadas: esperas con reintento en vez de `count()` puntual (un `count()==0` confunde "lento" con "ausente"), nada de `sleep` fijos, validación de estructura y no de valores en datos en vivo (SIATA, GitHub API), `workers: 1` para no saturar capas gratuitas.

## 8. Defectos reales encontrados (gestión de defectos)

1. **Pulso: URL raíz devuelve 404** (Severidad media). La app vive en `02-midnight-console.html`, no en el root de Pages. Evidencia: screenshot + `curl 200` vs `goto('/')` al dominio. Estado: mitigado en suite (navegación a URL completa). Recomendación: landing en `index.html`.
2. **Terramind: panel RAG cierra la página en Chromium headless** (Severidad media-baja, solo automatización). Repro: abrir RAG + `waitFor` del textarea → `Target page has been closed`, incluso con `--disable-gpu`. En manual funciona. Estado: skip documentado, pendiente estabilizar.
3. **EDU.CORE: login nuevo sin desplegar** (Severidad baja, proceso). Push con la nueva UI comercial; Render seguía sirviendo la build vieja al verificar. Estado: suite lista con selectores exactos, a la espera del redeploy.

## 9. Notas honestas

- `goto('/')` ignora la ruta de una `baseURL` que apunta a un archivo (Pulso): se navega a la URL completa.
- Reporte Serenity BDD oficial en `target/site/serenity` para la suite `serenity-pulso` (paquetes `@serenity-js/*@3.48.x` fijados; el HTML se genera con Java).
- Login válido de EDU.CORE requiere `EDUCORE_USER`/`EDUCORE_PASS` y queda en `skip` sin ellas.
