# Módulo `architecture-map` — Archify dentro del generador de screenplay

## 1. Qué es Archify (lo relevante)

- Skill para agentes (no librería) + CLI Node (`archify validate|deliver`) que convierte un **JSON tipado (IR)** en HTML autocontenido.
- Tipos: `architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`. Aquí se usa **`sequence`**.
- Trae vistas guiadas, modo presentación y exportación. Licencia MIT.
- Motor oficial en `ARCHIFY_CLI` (defecto: skill instalado); **este módulo es un adaptador, no una copia**.

## 2. Cómo encaja con greenbox

Las vistas guiadas ya son un guion: cada vista es una **escena** y cada mensaje un **beat**.

```
flow/<prueba>.json (evidencia grabada del Actor)
  ──► scripts/flow-to-archify.js (analyzer determinista) ──► archify-sequences/*.sequence.json (IR versionado)
  ──► architecture-map/adapter.validate ──┬─► OK ──► adapter.deliver ──► flow-report/archify/*.html
                                          └─► diagnostics[] ──► reparar IR y repetir (máx 2 rondas)
  ──► architecture-map/scene-mapper ──► flow-report/scenes.json ──► escenas/beats del screenplay
```

Diferencia con la espec original: el **analyzer no usa LLM** — el IR nace de eventos reales grabados por `src/flow/recorder.ts` (nombre + ms + respuesta de cada Task/Question). Más barato y sin alucinaciones; el bucle validar→reparar aplica igual.

## 3. Estructura

```
architecture-map/
├── adapter.js       # validator + renderer + exporter sobre el CLI oficial
├── scene-mapper.js  # IR + vistas guiadas → flow-report/scenes.json
└── README.md        # este archivo
```

## 4. Decisiones de diseño

- **Adaptador sobre el CLI**, no copia del renderer. Archify se actualiza sin tocar este código.
- **Separar generar IR de renderizar** (ambos deterministas aquí). El IR vive versionado en `archify-sequences/` para iterar sin re-correr pruebas.
- **Bucle de reparación:** `validate/deliver --json` devuelven `diagnostics[]` con códigos (`viewer/viewport-overflow`, …) y `supportedFixes`; se corrige el IR (ej: viewBox 1080, bandas `segments`, notas ≤36) y se repite.
- **Idioma — veredicto verificado:** `meta.translations` **no existe** en los esquemas (`grep translations schemas/*.json` vacío; `additionalProperties: false` lo rechazaría). Decisión: se omite `meta.locale`; el contenido authored va en español (el renderer nunca traduce contenido) y el chrome del visor cae a inglés (declarado aquí y en el README principal).

## 5. Respuesta a §9 (stack del programa actual)

- **Stack:** Node + TypeScript (Playwright) para suites; scripts Node sin dependencias para reportes.
- **Cómo se genera hoy el screenplay:** núcleo hand-authored (`src/core`: Actor/Tasks/Questions) + **evidencia grabada en runtime** (`src/flow/recorder.ts` → `flow/*.json`). La interfaz del módulo es `flow/*.json → IR → artefacto + receipt`, sin LLM en el camino.

## 6. Comandos

```bash
npm run archify:report   # IR → validate → deliver → scenes (todo el pipeline)
npm run archify:validate # solo validación showcase de los 9 IR
node architecture-map/scene-mapper.js
```
