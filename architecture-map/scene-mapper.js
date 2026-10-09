// architecture-map/scene-mapper — IR + vistas guiadas -> escenas/beats.
// Las vistas guiadas de Archify YA son un guion: cada vista es una escena y
// cada mensaje enfocado es un beat. Este mapper extrae esa estructura en
// scenes.json para que el motor de screenplay (o flow-report) la consuma
// sin leer el HTML.
// Uso: node architecture-map/scene-mapper.js  (lee archify-sequences/, escribe flow-report/scenes.json)
const fs = require('node:fs');
const path = require('node:path');

const IN = 'archify-sequences';
const OUT = 'flow-report/scenes.json';

function main() {
  const files = fs.readdirSync(IN).filter((f) => f.endsWith('.sequence.json'));
  const scenes = files.map((f) => {
    const ir = JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8'));
    const beats = ir.messages.map((m) => ({ id: m.id || null, from: m.from, to: m.to, label: m.label, variant: m.variant || 'default' }));
    return {
      id: f.replace(/\.sequence\.json$/, ''),
      title: ir.meta.title,
      views: (ir.meta.views || []).map((v) => ({ id: v.id, label: v.label, focus: v.focus, note: v.note })),
      beats,
      messages: beats.length,
    };
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ scenes }, null, 2) + '\n');
  console.log('scene-mapper OK: ' + scenes.length + ' escenas, ' + scenes.reduce((a, s) => a + s.beats.length, 0) + ' beats -> ' + OUT);
}

if (require.main === module) main();
module.exports = {};
