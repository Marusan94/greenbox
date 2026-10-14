# ✅ Greenbox — Automatización QA con Playwright + Screenplay sobre 4 proyectos reales

<p align="center">
  <a href="https://greenbox-portfolio.vercel.app">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-greenbox--portfolio.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
  <a href="https://greenbox-portfolio.vercel.app">
    <img src="https://img.shields.io/badge/🚀_Try_Now-Click_Here-25D366?style=for-the-badge&logo=rocket&logoColor=white" alt="Try Now">
  </a>
</p>

<p align="center">
  [![CI](https://github.com/Marusan94/greenbox/actions/workflows/ci.yml/badge.svg)](https://github.com/Marusan94/greenbox/actions)
  ![Playwright](https://img.shields.io/badge/Playwright-1.64-45ba4b)
  ![Serenity/JS](https://img.shields.io/badge/Serenity%2FJS-3.48-7c3aed)
  ![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6)
  ![Tests](https://img.shields.io/badge/tests-10_pass_%C2%B7_4_skip_%C2%B7_0_fail-brightgreen)
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT">
</p>

> **La caja verde: si todo está en verde, se publica.** Portafolio práctico de **Analista QA con automatización**: suites smoke y regresión con **Playwright** y el **patrón Screenplay**, ejecutadas contra 4 aplicaciones reales desplegadas de [Marusan94](https://github.com/Marusan94) (Terramind, Pulso GitHub, Query Lands/LAB.CORE y EDU.CORE). Todo lo afirmado aquí está ejecutado; lo pendiente está declarado como tal.

---

## 🎯 El proyecto en una frase

**Portafolio QA ejecutable** — 4 suites Screenplay + 1 suite oficial Serenity/JS, CI con matriz por proyecto, reporte visual Flow (secuencias Actor→Task→Page), y 3 defectos reales documentados con severidad. Listo para defender en entrevista.

| Problema | Solución | Resultado |
|----------|----------|-----------|
| Demostrar skills QA reales sin acceso a sistemas privados | Automatizas 4 apps públicas propias con patrones de la industria | Evidencia ejecutable: código, CI, reportes, defectos reales |

---

## 📸 Hub de reportes (generado localmente)

<video src="docs/img/tour.mp4" controls width="100%"></video>

`npm test && npm run flow:report && npm run flow:hub` genera `flow-report/hub.html`: barra lateral con el mapa del sistema, las historias Flow, las 9 secuencias del visor oficial y los reportes Playwright/Serenity. Los temas Dark/Light y los presets Classic/Signal/Blueprint/Editorial se conmutan desde el hub y aplican a todas las vistas.

| Vista | Captura |
|-------|---------|
| **Mapa del sistema en visor Archify** | ![System Map](docs/img/system.png) |
| **Historias Flow por prueba** | ![Flow Stories](docs/img/flow-light.png) |
| **Secuencia oficial de una prueba** | ![Sequence](docs/img/sequence.png) |

---

## 🎥 Demo en video

[![Greenbox Demo](docs/img/system.png)](docs/demo-greenbox.mp4)
*Recorrido 60s: hub → mapa sistema → historia Flow → secuencia → reportes Playwright/Serenity.*

> 🎬 Graba con el demo en vivo, guarda en `docs/demo-greenbox.mp4`, súbelo a YouTube/Loom y reemplaza este link.

---

## 1️⃣ Cobertura frente a una oferta real de Analista QA (Medellín/Bogotá)

| Requisito de la oferta | Evidencia en este repo | Estado |
|------------------------|------------------------|--------|
| Playwright (no negociable) | Suites E2E en Chromium, `playwright.config.ts` (projects por sitio, `trace: retain-on-failure`, reporte HTML, `workers: 1`) | ✅ Verificado |
| Patrón Screenplay (no negociable) | Núcleo `src/core/` reutilizado en 4 suites **+ suite oficial Serenity/JS** (`tests/serenity-pulso.spec.ts` con Actor/Tasks/Questions de la librería y reporte Serenity BDD) | ✅ Verificado |
| POM y otros patrones | Comparativa POM vs Screenplay con ejemplo real del repo (sección 4) | ✅ Verificado |
| Smoke + regresión | Tags `@smoke` / `@regression`; `npm run test:smoke` (push) y `test:regression` (cron nocturno en CI) | ✅ Verificado |
| Caja negra (equivalencia, límites) | Login válido/inválido (equivalencia), password < 6 caracteres (valor límite), tablas con conteo > 0 | ✅ Verificado |
| Gestión de defectos, métricas, riesgos | Sección 7: 3 defectos reales con severidad + métricas de ejecución | ✅ Verificado |
| Scrum / Kanban / híbrido | Entrega por iteraciones cortas con gates verificables (typecheck → tests → commit por avance) | ✅ Verificado |

---

## 2️⃣ Arquitectura

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

```mermaid
flowchart TD
    ACTOR[Actor: Santiago] --> TASK[Task: OpenApp / SearchFor / NavigateToTab]
    TASK --> ABILITY[Ability: BrowseTheWeb (Playwright Page)]
    ABILITY --> PAGE[Page Object / Selectors]
    TASK --> QUESTION[Question: PageTitle / IsVisible / CountOf]
    QUESTION --> ASSERT[Assert en Spec]
    SPEC[Spec: orquesta intención] --> RECORDER[Flow Recorder → flow/*.json]
    RECORDER --> FLOW_REPORT[flow-report/index.html: secuencias visuales]
```

**Flujo**: el *Actor* ejecuta *Tasks* con su *Ability* (`BrowseTheWeb` = la `Page` de Playwright) y comprueba *Questions*. Los specs solo orquestan intención de negocio; **ningún selector vive en la prueba**.

---

## 3️⃣ Módulo Flow: ver cada prueba como historia 🎬

¿Se puede *ver* el flujo de una prueba Screenplay? Sí: el `Actor` graba solo cada Task (con su duración real) y cada Question (con su respuesta) en `flow/<prueba>.json`, y `npm run flow:report` los dibuja como **diagramas de secuencia** en `flow-report/index.html` (autocontenido, sin dependencias): Santiago → Tareas → Página, con flechas, tiempos y respuestas, más tabla paso a paso.

```bash
npx playwright test          # graba el flujo de cada prueba en flow/
npm run flow:report          # dibuja flow-report/index.html
```

Úsalo para depurar ("¿qué paso tardó 20 s?"), para mostrarle a alguien no técnico qué hace la suite, y para defender el patrón en entrevista con evidencia visual.

---

## 4️⃣ Cómo se compone Screenplay (para defenderlo en entrevista)

| Componente | Qué es | Archivo |
|------------|--------|---------|
| **Actor** | Quién actúa | `src/core/actor.ts` → `Actor.named('Santiago', page)` |
| **Ability** | Con qué puede actuar | `BrowseTheWeb` = la `Page` de Playwright que recibe el actor |
| **Task** | Acción de negocio reutilizable | `src/core/tasks.ts` → `OpenApp`, `SearchFor`, `NavigateToTab` |
| **Question** | Lectura verificable | `src/core/questions.ts` → `PageTitle`, `IsVisible`, `CountOf` |

---

## 5️⃣ POM vs Screenplay, mismo escenario (Pulso: "la tabla muestra repositorios")

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

**Cuándo conviene cada uno:**
- **POM** → smoke simple de 1 página (menos código)
- **Screenplay** → cuando el flujo cruza pasos/pestañas y las Tasks se reutilizan entre suites — el spec queda legible para no-técnicos y el mantenimiento se concentra en un solo lugar.

---

## 6️⃣ Cómo ejecutar

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

---

## 7️⃣ Métricas reales (última ejecución: 2026-10-14)

| Proyecto | Resultado | Nota |
|----------|-----------|------|
| Pulso | 2 pasan, 1 skip | Sin buscador visible (esperado 15 s con reintento) |
| Terramind | 2 pasan, 1 skip | Copiloto en skip: panel RAG abre pero la página se cierra en headless (probado con `--disable-gpu`; verificado manual) |
| QueryLands | 3 pasan | — |
| EDU.CORE | 1 pasa, 2 skip | Nueva UI con login en camino (redeploy Render pendiente); selectores exactos ya listos |

**Reglas anti-flakiness aplicadas:**
- Esperas con reintento en vez de `count()` puntual (un `count()==0` confunde "lento" con "ausente")
- Nada de `sleep` fijos
- Validación de estructura y no de valores en datos en vivo (SIATA, GitHub API)
- `workers: 1` para no saturar capas gratuitas

---

## 8️⃣ Defectos reales encontrados (gestión de defectos)

| # | Defecto | Severidad | Evidencia | Estado |
|---|---------|-----------|-----------|--------|
| 1 | **Pulso: URL raíz devuelve 404** | Media | Screenshot + `curl 200` vs `goto('/')` al dominio | Mitigado en suite (navegación a URL completa). Recomendación: landing en `index.html` |
| 2 | **Terramind: panel RAG cierra la página en Chromium headless** | Media-baja (solo automatización) | Repro: abrir RAG + `waitFor` del textarea → `Target page has been closed`, incluso con `--disable-gpu`. En manual funciona | Skip documentado, pendiente estabilizar |
| 3 | **EDU.CORE: login nuevo sin desplegar** | Baja (proceso) | Push con la nueva UI comercial; Render seguía sirviendo la build vieja al verificar | Suite lista con selectores exactos, a la espera del redeploy |

---

## 9️⃣ Notas honestas

- `goto('/')` ignora la ruta de una `baseURL` que apunta a un archivo (Pulso): se navega a la URL completa.
- Reporte Serenity BDD oficial en `target/site/serenity` para la suite `serenity-pulso` (paquetes `@serenity-js/*@3.48.x` fijados; el HTML se genera con Java).
- Login válido de EDU.CORE requiere `EDUCORE_USER`/`EDUCORE_PASS` y queda en `skip` sin ellas.

---

## 🧪 Testing & Quality Gates

```bash
# Gates obligatorios antes de commit
npm run typecheck        # TypeScript strict
npm test                 # 10 pass · 4 skip · 0 fail
npx playwright test --project=chromium  # trace en fallos
```

CI pipeline (`.github/workflows/ci.yml`):
- Matriz 4 proyectos (terramind, pulso, educore, querylands)
- Smoke en push/manual | Regresión en cron nocturno (3:00 UTC)
- Artefactos: reporte HTML Playwright + trace por proyecto

---

## 🤝 Contribuir

1. Fork → branch (`feat/screenplay: ...` / `fix/flow: ...`)
2. `npm run typecheck && npm test` deben pasar
3. PR con descripción clara. Para cambios visuales, screenshots del hub Flow.

---

## 📄 Licencia

MIT — ver [LICENSE](LICENSE) (añadido en commit `230db4d`).

---

<p align="center">
  Built in Medellín, Colombia — by <a href="https://github.com/Marusan94">@Marusan94</a>
</p>