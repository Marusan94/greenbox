// architecture-map/adapter — Adaptador sobre el CLI oficial de Archify.
// NO copia el renderer: delega en `archify validate|deliver --json` para que
// Archify se actualice sin tocar este codigo. Generar IR (evidencia grabada,
// determinista) esta separado de renderizar (determinista).
// Uso desde Node: const { validate, deliver } = require('./adapter');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const run = promisify(execFile);
// Ruta al CLI del skill oficial (fuera del repo; no se versiona el motor).
const CLI = process.env.ARCHIFY_CLI || 'C:\\Users\\USUARIO\\.agents\\skills\\archify\\bin\\archify.mjs';

function parse(out) {
  try {
    return JSON.parse(out);
  } catch {
    return { ok: false, raw: String(out).slice(0, 500) };
  }
}

// validator: archify validate <tipo> ir.json --quality showcase --json
async function validate(type, irPath) {
  try {
    const { stdout } = await run('node', [CLI, 'validate', type, irPath, '--quality', 'showcase', '--json']);
    return parse(stdout);
  } catch (e) {
    return { ok: false, diagnostics: parse(e.stdout || '{}').diagnostics };
  }
}

// renderer: archify deliver <tipo> ir.json out.html [--open]
// deliver congela los bytes exactos del IR en un snapshot y reporta SHA-256.
async function deliver(type, irPath, outHtml, open = false) {
  const args = [CLI, 'deliver', type, irPath, outHtml, '--quality', 'showcase', '--json'];
  if (open) args.push('--open');
  try {
    const { stdout } = await run('node', args, { maxBuffer: 8 * 1024 * 1024 });
    return parse(stdout);
  } catch (e) {
    return { ok: false, diagnostics: parse(e.stdout || '{}').diagnostics };
  }
}

// exporter: re-expone el HTML entregado + su receipt (el visor trae su propio
// Export PNG/SVG/print; este modulo no reimplementa exportacion).
async function receipt(irPath) {
  const r = await validate('sequence', irPath);
  return { ir: irPath, ok: r.ok, checks: (r.checks || []).length };
}

module.exports = { validate, deliver, receipt, CLI };
