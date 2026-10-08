# INTERVIEW.md — 5 preguntas probables sobre Screenplay (respuestas de 2 frases, basadas en este repo)

1. **¿Qué es el patrón Screenplay y qué problema resuelve?**
   Separa quién actúa (Actor), qué hace (Task) y qué verifica (Question); en este repo evitó duplicar selectores en 4 suites porque `OpenApp` o `CountOf` se reutilizan. Resuelve el POM gigante donde cada Page Object repite localizadores y esperas.

2. **¿Qué es una Ability como BrowseTheWeb?**
   Es la capacidad que el Actor necesita para actuar; aquí es la `Page` de Playwright que recibe `Actor.named('Santiago', page)`. Sin habilidad, el Actor no puede ejecutar Tasks ni responder Questions.

3. **¿Task vs Interaction vs Question con un ejemplo del repo?**
   Task es acción de negocio (`NavigateToTab`), Interaction sería el click suelto dentro de ella, y Question es lectura verificable (`IsVisible.element('canvas')` en Terramind). Los specs solo orquestan Tasks/Questions, nunca localizadores.

4. **¿Cuándo prefieres POM sobre Screenplay?**
   En smoke de una sola página como Pulso, donde POM es menos código y no hay flujos que reutilizar. Screenplay paga cuando hay multi-paso (Terramind: mapa → RAG → respuesta) o las mismas Tasks sirven en varios proyectos.

5. **¿Cómo mantienes estables pruebas sobre datos en vivo?**
   Afirmando estructura y presencia, no valores: `CountOf > 0` en el ranking de Pulso o AQI de Terramind en vez del número exacto. Y con `test.skip` justificado cuando la UI aún no existe (login EDU.CORE antes del redeploy).

## 5 historias STAR (del trabajo real)

- **S1 — Selector inventado que no existía:** Pulso falló porque `goto('/')` con baseURL-archivo resuelve al root (404); lo probé con curl (200 en el .html) y navegué a la URL completa → 2 verdes.
- **S2 — Test que solo pasaba en mi cabeza:** el copiloto Terramind existe en manual pero cierra la página en headless; tras 3 intentos (fill, teclado, --disable-gpu) lo dejé en skip documentado en vez de maquillarlo.
- **S3 — Deploy que no llegaba:** EDU.CORE quedó en skip porque Render seguía sirviendo la build vieja; dejé los selectores exactos de la nueva UI listos para el redeploy.
- **S4 — Commit con 6249 archivos basura:** el primer commit incluía `node_modules`; lo limpié con `.gitignore` + `rm --cached` + amend hasta 15 archivos.
- **S5 — Presupuesto de 45 min:** prioricé 7 verdes estables + skips honestos sobre 12 a medias; cada skip dice qué falta y por qué.
