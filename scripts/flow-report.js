// Genera flow-report/index.html: cada test dibujado como diagrama de secuencia
// Santiago -> Tareas -> Pagina, con duraciones y respuestas. Sin dependencias.
const fs = require('node:fs');
const path = require('node:path');

const IN = 'flow';
const OUT = 'flow-report';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const short = (s, n) => {
  const t = String(s ?? '');
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

// Dibuja un diagrama de secuencia SVG autocontenido para un test.
function sequence(title, events) {
  const W = 780;
  const rowH = 40;
  const H = 110 + events.length * rowH;
  const ax = 110; // Santiago
  const bx = 400; // Tareas
  const cx = 660; // Pagina
  let y = 90;
  let body = '';
  const line = (x1, x2, dashed, label) => {
    const style = dashed ? 'stroke-dasharray="6,4"' : '';
    body += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#8b5cf6" stroke-width="2" ${style}/>`;
    body += `<polygon points="${x2 - 8},${y - 4} ${x2},${y} ${x2 - 8},${y + 4}" fill="#8b5cf6"/>`;
    body += `<text x="${(x1 + x2) / 2}" y="${y - 8}" text-anchor="middle" font-size="12" fill="#e5e7eb">${esc(short(label, 44))}</text>`;
    y += rowH;
  };
  for (const e of events) {
    if (e.kind === 'task' && e.phase === 'start') line(ax, bx, false, `▶ ${e.name}`);
    else if (e.kind === 'task') line(bx, ax, true, `✔ ${e.ms} ms`);
    else if (e.kind === 'question') {
      line(ax, cx, false, `? ${e.name}`);
      body += `<rect x="${cx - 130}" y="${y - 6}" width="230" height="24" rx="6" fill="#1f2937" stroke="#374151"/>`;
      body += `<text x="${cx - 15}" y="${y + 11}" text-anchor="middle" font-size="11" fill="#a7f3d0">= ${esc(short(e.answer, 34))} (${e.ms} ms)</text>`;
      y += rowH;
    }
  }
  const bottom = y + 20;
  const lifeline = (x, who) =>
    `<line x1="${x}" y1="60" x2="${x}" y2="${bottom}" stroke="#374151" stroke-dasharray="4,4"/><rect x="${x - 62}" y="18" width="124" height="30" rx="8" fill="#111827" stroke="#8b5cf6"/><text x="${x}" y="38" text-anchor="middle" font-size="13" fill="#fff">${who}</text>`;
  return `<svg viewBox="0 0 ${W} ${bottom}" width="100%" style="background:#0b1220;border-radius:12px">${lifeline(ax, 'Santiago')}${lifeline(bx, 'Tareas')}${lifeline(cx, 'Página')}${body}</svg>`;
}

function main() {
  if (!fs.existsSync(IN)) {
    console.log(`Sin datos: corre primero "npx playwright test" (carpeta ${IN}/ ausente).`);
    process.exit(1);
  }
  const files = fs.readdirSync(IN).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.log(`Sin datos en ${IN}/.`);
    process.exit(1);
  }
  let totalTasks = 0;
  let totalQuestions = 0;
  let totalMs = 0;
  const sections = files
    .map((f) => JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8')))
    .map((t) => {
      const tasks = t.events.filter((e) => e.kind === 'task' && e.phase === 'end');
      const questions = t.events.filter((e) => e.kind === 'question');
      const ms = tasks.reduce((a, e) => a + (e.ms || 0), 0);
      totalTasks += tasks.length;
      totalQuestions += questions.length;
      totalMs += ms;
      const rows = t.events
        .map(
          (e) =>
            `<tr><td>${e.seq}</td><td>${e.kind === 'task' ? '🛠️ tarea' : '❓ pregunta'}</td><td>${esc(e.phase || '')}</td><td>${esc(e.name)}</td><td>${esc(e.answer ?? '')}</td><td>${e.ms ?? ''}</td></tr>`,
        )
        .join('');
      return `<section style="margin:28px 0"><h2>${esc(t.title)}</h2><p>${tasks.length} tareas · ${questions.length} preguntas · ${ms} ms en pasos</p>${sequence(t.title, t.events)}<table><thead><tr><th>#</th><th>tipo</th><th>fase</th><th>nombre</th><th>respuesta</th><th>ms</th></tr></thead><tbody>${rows}</tbody></table></section>`;
    })
    .join('\n');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Greenroom QA — Flow</title><style>body{font-family:system-ui;background:#0b1220;color:#e5e7eb;max-width:900px;margin:0 auto;padding:24px}h1{color:#c4b5fd}.cards{display:flex;gap:12px}.card{background:#111827;border:1px solid #8b5cf6;border-radius:12px;padding:12px 18px}table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}th,td{border:1px solid #374151;padding:6px 8px;text-align:left}th{background:#111827}</style></head><body><h1>🎭 Greenroom QA — el flujo de cada prueba</h1><p>Cada ensayo dibujado como historia: Santiago pide tareas y hace preguntas; la página responde.</p><div class="cards"><div class="card"><b>${files.length}</b> pruebas</div><div class="card"><b>${totalTasks}</b> tareas</div><div class="card"><b>${totalQuestions}</b> preguntas</div><div class="card"><b>${totalMs}</b> ms en pasos</div></div>${sections}</body></html>`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log(`Flow OK: ${files.length} pruebas, ${totalTasks} tareas, ${totalQuestions} preguntas -> ${OUT}/index.html`);
}

main();
