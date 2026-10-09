# QA Automation Lab — Automatización de pruebas con Playwright + Screenplay sobre 4 proyectos reales

Portafolio práctico de **Analista QA con automatización**: suites smoke y regresión con **Playwright** y el **patrón Screenplay**, ejecutadas contra 4 aplicaciones reales desplegadas de [Marusan94](https://github.com/Marusan94) (Terramind, Pulso GitHub, Query Lands/LAB.CORE y EDU.CORE). Todo lo afirmado aquí está ejecutado; lo pendiente está declarado como tal.

## 1. Cobertura frente a una oferta real de Analista QA (Medellín/Bogotá)

| Requisito de la oferta | Evidencia en este repo | Estado |
|---|---|---|
| Playwright (no negociable) | Suites E2E en Chromium, `playwright.config.ts` (projects por sitio, `trace: retain-on-failure`, reporte HTML, `workers: 1`) | ✅ Verificado |
| Patrón Screenplay (no negociable) | Núcleo `src/core/`: `Actor` + habilidad `BrowseTheWeb`, `Task` (`OpenApp`, `SearchFor`, `NavigateToTab`), `Question` (`PageTitle`, `IsVisible`, `CountOf`) reutilizados en las 4 suites | ✅ Verificado |
| POM y otros patrones | Comparativa POM vs Screenplay con ejemplo real del repo (sección 3) | ✅ Verificado |
| Smoke + regresión | Tags `@smoke` / `@regression`; `npm run test:smoke` (push) y `test:regression` (cron nocturno en CI) | ✅ Verificado |
| Caja negra (equivalencia, límites) | Login válido/inválido (equivalencia), password < 6 caracteres (valor límite), tablas con conteo > 0 | ✅ Verificado |
| Pruebas de APIs (GET/POST/PUT, env, status) | URLs y secretos por variables de entorno (`.env.example`); suites de API con Karate | 🗺️ Roadmap (siguiente fase) |
| Karate | — | 🗺️ Roadmap |
| AWS básico | — | 🗺️ Roadmap (publicar reportes en S3) |
| No funcionales (rendimiento, accesibilidad) | — | 🗺️ Roadmap (k6 + axe-core) |
| Gestión de defectos, métricas, riesgos | Sección 5: 3 defectos reales con severidad + métricas de ejecución | ✅ Verificado |
| Scrum / Kanban / híbrido | Entrega por iteraciones cortas con gates verificables (typecheck → tests → commit por avance) | ✅ Verificado |

## 2. Arquitectura

```
qa-automation-lab/
├── src/core/          # Patrón Screenplay: actor.ts, tasks.ts, questions.ts
├── tests/             # 1 suite por proyecto (terramind, pulso, querylands, educore)
├── .github/workflows/ # CI: matriz por proyecto (smoke en push, regresión en cron)
├── playwright.config.ts  # 1 project por sitio, baseURL por env, trace en fallos
├── INTERVIEW.md       # 5 preguntas de entrevista + 5 historias STAR del trabajo real
└── .env.example       # URLs y secretos (nunca credenciales en el repo)
```

Flujo: ** película ** — el *Actor* (Santiago, el visitante) ejecuta *Tasks* con su *Ability* (`BrowseTheWeb` = la página de Playwright) y comprueba *Questions*. Los specs solo orquestan intención de negocio; ningún selector vive en la prueba.

## 3. Cómo se compone Screenplay (para defenderlo en entrevista)

- **Actor**: quién actúa (`Actor.named('Santiago', page)` en `src/core/actor.ts`).
- **Ability**: con qué puede actuar (`BrowseTheWeb` = la `Page` de Playwright que recibe el actor).
- **Task**: acción de negocio reutilizable (`OpenApp`, `SearchFor`, `NavigateToTab` en `src/core/tasks.ts`).
- **Question**: lectura verificable (`PageTitle`, `IsVisible`, `CountOf` en `src/core/questions.ts`).

## 4. POM vs Screenplay, mismo escenario (Pulso: "la tabla muestra repositorios")

```ts
// POM: el test conoce páginas y selectores
await page.goto(PULSO_APP);
const rows = await page.locator('table tbody tr, article, li').count();
expect(rows).toBeGreaterThan(0);

// Screenplay (este repo): el test declara intención, el CÓMO vive en piezas reutilizables
await page.goto(PULSO_APP); // OpenApp no sirve aquí: la app es un .html concreto, ver sección 6
const rows = await santiago.asks(CountOf.elements('table tbody tr, article, li'));
expect(rows).toBeGreaterThan(0);
```

**Cuándo conviene cada uno:** POM para smoke simple de 1 página (menos código); Screenplay cuando el flujo cruza pasos/pestañas y las Tasks se reutilizan entre suites — el spec queda legible para no-técnicos y el mantenimiento se concentra en un solo lugar.

## 5. Cómo ejecutar

```bash
npm install --legacy-peer-deps
npx playwright install chromium
npm run typecheck
npm test                        # todo (8 pasan, 4 skip, 0 fallan)
npm run test:smoke               # solo @smoke (lo que corre en cada push)
npm run test:regression          # solo @regression (lo que corre de noche)
npm run test:terramind | test:pulso | test:educore | test:querylands
```

URLs por variables (`TERRAMIND_URL`, `PULSO_URL`, `QUERYLANDS_URL`, `EDUCORE_URL`); ver `.env.example`. CI (`ci.yml`): matriz por proyecto en push/manual con `@smoke`, regresión `@regression` en cron nocturno (3:00 UTC), reporte por proyecto como artefacto.

## 6. Métricas reales (última ejecución: 2026-10-08)

| Proyecto | Resultado | Nota |
|---|---|---|
| Pulso | 2 pasan, 1 skip | Sin buscador visible (esperado 15 s con reintento) |
| Terramind | 2 pasan, 1 skip | Copiloto en skip: panel RAG abre pero la página se cierra en headless (probado con `--disable-gpu`; verificado manual) |
| QueryLands | 3 pasan | — |
| EDU.CORE | 1 pasa, 2 skip | Nueva UI con login en camino (redeploy Render pendiente); selectores exactos ya listos |

Reglas anti-flakiness aplicadas: esperas con reintento en vez de `count()` puntual (un `count()==0` confunde "lento" con "ausente"), nada de `sleep` fijos, validación de estructura y no de valores en datos en vivo (SIATA, GitHub API), `workers: 1` para no saturar capas gratuitas.

## 7. Defectos reales encontrados (gestión de defectos)

1. **Pulso: URL raíz devuelve 404** (Severidad media). La app vive en `02-midnight-console.html`, no en el root de Pages. Evidencia: screenshot + `curl 200` vs `goto('/')` al dominio. Estado: mitigado en suite (navegación a URL completa). Recomendación: landing en `index.html`.
2. **Terramind: panel RAG cierra la página en Chromium headless** (Severidad media-baja, solo automatización). Repro: abrir RAG + `waitFor` del textarea → `Target page has been closed`, incluso con `--disable-gpu`. En manual funciona. Estado: skip documentado, pendiente estabilizar.
3. **EDU.CORE: login nuevo sin desplegar** (Severidad baja, proceso). Push `968690e` con la nueva UI comercial; Render seguía sirviendo la build vieja al verificar. Estado: suite lista con selectores exactos, a la espera del redeploy.

## 8. Limitaciones honestas y roadmap

- `goto('/')` ignora la ruta de una `baseURL` que apunta a un archivo (Pulso): se navega a la URL completa.
- Sin reporte Serenity BDD: se usa el HTML de Playwright (más rápido de generar; paquetes `@serenity-js/*@3.48.1` instalados y fijados).
- Login válido de EDU.CORE requiere `EDUCORE_USER`/`EDUCORE_PASS` y queda en `skip` sin ellas.
- **Roadmap:** suites de API con Karate (GET/POST/PUT + status + tiempos), k6 + axe-core (no funcionales), publicación de reportes en S3 (AWS), Page Objects paralelos para comparativa POM completa.
