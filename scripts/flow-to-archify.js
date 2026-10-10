// Convierte flow/<prueba>.json (eventos Actor->Task/Question) en candidatos
// Archify sequence listos para `validate` + `deliver`. Sin inventar: cada
// mensaje sale de un evento real grabado (nombre + ms + respuesta).
// Uso: node scripts/flow-to-archify.js
const fs = require('node:fs');
const path = require('node:path');

const IN = 'flow';
const OUT = 'archify-sequences';

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const cut = (s, n) => {
  const t = String(s ?? '');
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

function build(flow) {
  const messages = [];
  const STEP = 40;
  let y = 170;
  let n = 0;
  const tasks = [];
  const questions = [];
  let taskTop = 0;
  let taskBottom = 0;
  let qTop = 0;
  for (const e of flow.events) {
    if (e.kind === 'task' && e.phase === 'end') {
      n += 1;
      tasks.push(e);
      if (!taskTop) taskTop = y;
      taskBottom = y;
      messages.push({ id: 'm' + n, from: 'actor', to: 'web', y, label: cut(e.name, 60), variant: 'emphasis' });
      y += STEP;
    } else if (e.kind === 'question') {
      n += 1;
      questions.push(e);
      if (!qTop) qTop = y;
      messages.push({ id: 'm' + n, from: 'actor', to: 'web', y, label: '? ' + cut(e.name, 52), variant: 'default', note: cut(e.answer, 36) });
      y += STEP;
      n += 1;
      messages.push({ id: 'm' + n, from: 'web', to: 'actor', y, label: '= ' + cut(e.answer, 28), variant: 'return' });
      y += STEP;
    }
  }
  const totalMs = tasks.reduce((a, e) => a + (e.ms || 0), 0);
  const lastY = messages.length ? messages[messages.length - 1].y : 170;
  const segments = [];
  if (tasks.length) segments.push({ from: 150, to: taskBottom + 22, label: 'Tareas' });
  if (questions.length) segments.push({ from: (qTop || 170) - 20, to: lastY + 22, label: 'Preguntas' });
  return {
    schema_version: 1,
    diagram_type: 'sequence',
    meta: {
      title: cut(flow.title.replace(/ @\w+/g, ''), 80),
      output: 'flow-report/archify/' + slug(flow.title) + '.html',
      quality_profile: 'showcase',
      viewBox: [1080, Math.max(480, lastY + 120)],
      views: [
        { id: 'recorrido', label: 'Recorrido completo', focus: ['actor', 'web'], note: tasks.length + ' tareas y ' + questions.length + ' preguntas ejecutadas contra la página real.' },
      ],
    },
    participants: [
      { id: 'actor', type: 'external', label: 'Santiago', sublabel: 'actor de prueba' },
      { id: 'web', type: 'frontend', label: 'Página web', sublabel: 'bajo prueba' },
    ],
    activations: [{ participant: 'web', from: 174, to: lastY + 8, type: 'frontend' }],
    segments,
    messages,
    cards: [
      { dot: 'cyan', title: 'Recorrido verificado', items: [tasks.length + ' tareas ejecutadas (' + totalMs + ' ms en pasos)', questions.length + ' preguntas con respuesta visible', 'Tres reintentos: sin sleeps fijos en el codigo'] },
      { dot: 'emerald', title: 'Evidencia real', items: questions.slice(0, 3).map((q) => q.name + ' = ' + cut(q.answer, 40)) },
    ],
  };
}

function main() {
  const files = fs.readdirSync(IN).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.log('Sin datos en flow/. Corre antes "npx playwright test".');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of files) {
    const flow = JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8'));
    const cand = build(flow);
    const out = path.join(OUT, slug(flow.title) + '.sequence.json');
    fs.writeFileSync(out, JSON.stringify(cand, null, 2) + '\n');
    console.log('OK ' + out + ' (' + cand.messages.length + ' mensajes)');
  }
}

main();
