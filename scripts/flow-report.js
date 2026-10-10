// Genera flow-report/index.html clonando al 99% el visor Archify de referencia
// (screenshot dark + DESIGN.md oficial): consola midnight, JetBrains Mono unica,
// vocabulario semantico fijo, pildoras Dark/Flow/Still/Present/Export, cadena de
// capitulos, tarjeta de capitulo con glow cyan, chips negros bajo nodos, planos
// ambar punteados, leyenda, zoom con %, overview global conmutable
// (run plane <-> project planes). Sin dependencias: todo inline.
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

const trunc = (s, n) => {
  const t = String(s ?? '');
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

function projectOf(title) {
  const t = title.toLowerCase();
  if (/mapa|seccion|copiloto/.test(t)) return 'terramind';
  if (/repositorio|buscador|categoria|pulso/.test(t)) return 'pulso';
  if (/reto|consulta|isla|sql/.test(t)) return 'querylands';
  if (/login|educore|sesion/.test(t)) return 'educore';
  return 'otro';
}
const PCOLOR = { terramind: 'task', pulso: 'ext', querylands: 'db', educore: 'q', otro: 'ext' };

function toNodes(events) {
  const nodes = [];
  for (const e of events) {
    if (e.kind === 'task' && e.phase === 'end')
      nodes.push({ kind: 'task', name: e.name, ms: e.ms || 0 });
    else if (e.kind === 'question')
      nodes.push({ kind: 'question', name: e.name, answer: e.answer || '', ms: e.ms || 0 });
  }
  return nodes;
}

function wrap2(name) {
  const words = String(name).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 24 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  lines.push(cur.trim());
  return lines.slice(0, 2);
}

// Chip negro bajo el nodo (como "loadValleyData()"): ms de la tarea o respuesta.
function mchip(x, y, text, uid) {
  const w = Math.min(210, 20 + text.length * 7);
  return '<g class="mchip"><rect x="' + (x - w / 2) + '" y="' + y + '" width="' + w + '" height="20" rx="6"/>' +
    '<text x="' + x + '" y="' + (y + 14) + '" text-anchor="middle">' + esc(trunc(text, 28)) + '</text></g>';
}

// Tira de nodos de un test: tarjetas con borde semantico + chip negro debajo.
function strip(nodes, uid) {
  const W = 900;
  const CW = 250;
  const CH = 62;
  const GAP = 60;
  const PER = 3;
  const rows = Math.max(1, Math.ceil(nodes.length / PER));
  const top = 58;
  const rowH = 132;
  const H = top + rows * rowH + 58;
  const pos = (i) => ({ x: 20 + (i % PER) * (CW + GAP), y: top + Math.floor(i / PER) * rowH });
  let s = '<defs><pattern id="dots' + uid + '" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" class="dotgrid"/></pattern></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="14" fill="url(#dots' + uid + ')"/>';
  s += '<rect x="10" y="10" width="' + (W - 20) + '" height="' + (H - 20) + '" rx="10" class="plane"/>';
  s += '<text x="24" y="34" class="plabel">TEST PLANE (SCREENPLAY)</text>';
  nodes.forEach((n, i) => {
    const p = pos(i);
    const x = p.x;
    const y = p.y;
    const cls = n.kind === 'task' ? 'nt' : 'nq';
    const lines = wrap2(n.name);
    s += '<g id="n' + uid + '_' + i + '" class="node" data-k="' + n.kind + '">';
    s += '<rect x="' + x + '" y="' + y + '" width="' + CW + '" height="' + CH + '" rx="10" class="card ' + cls + '"/>';
    s += '<rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="18" height="18" rx="4" class="badge ' + cls + '"/>';
    s += '<text x="' + (x + 19) + '" y="' + (y + 23) + '" text-anchor="middle" class="badgeT">' + (n.kind === 'task' ? 'T' : '?') + '</text>';
    s += '<text x="' + (x + CW / 2 + 8) + '" y="' + (y + 26) + '" text-anchor="middle" class="ct">' + esc(trunc(lines[0], 24)) + '</text>';
    if (lines[1])
      s += '<text x="' + (x + CW / 2 + 8) + '" y="' + (y + 42) + '" text-anchor="middle" class="cs">' + esc(trunc(lines[1], 26)) + '</text>';
    s += '</g>';
    s += mchip(x + CW / 2, y + CH - 4, n.kind === 'task' ? '✔ ' + n.ms + ' ms' : '= ' + n.answer, uid);
    if (i < nodes.length - 1) {
      const q = pos(i + 1);
      if (Math.floor(i / PER) === Math.floor((i + 1) / PER)) {
        const ym = y + CH / 2;
        s += '<line x1="' + (x + CW) + '" y1="' + ym + '" x2="' + q.x + '" y2="' + ym + '" class="edge"/>';
        s += '<polygon points="' + (q.x - 9) + ',' + (ym - 4) + ' ' + q.x + ',' + ym + ' ' + (q.x - 9) + ',' + (ym + 4) + '" class="ehead"/>';
      } else {
        const x1 = x + CW / 2;
        const y1 = y + CH + 16;
        const x2 = q.x + CW / 2;
        const y2 = q.y;
        const mid = y1 + (y2 - y1) / 2;
        s += '<polyline points="' + x1 + ',' + y1 + ' ' + x1 + ',' + mid + ' ' + x2 + ',' + mid + ' ' + x2 + ',' + y2 + '" class="edgep"/>';
        s += '<polygon points="' + (x2 - 4) + ',' + (y2 - 9) + ' ' + x2 + ',' + y2 + ' ' + (x2 + 4) + ',' + (y2 - 9) + '" class="ehead"/>';
      }
    }
  });
  const ly = H - 30;
  s += '<text x="24" y="' + (ly - 20) + '" class="lt">Legend</text>';
  const chip = (x, cls, label) =>
    '<rect x="' + x + '" y="' + (ly - 12) + '" width="14" height="10" rx="3" class="chip ' + cls + '"/><text x="' + (x + 20) + '" y="' + (ly - 2) + '" class="chipT">' + label + '</text>';
  s += chip(24, 'nt', 'Tarea') + chip(110, 'nq', 'Pregunta') + chip(220, 'na', 'Respuesta');
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img">' + s + '</svg>';
}

// Tarjeta de nodo del overview: titulo + linea mono proyecto/metricas.
function ovCard(x, y, t, cls) {
  const CW = 250;
  const CH = 64;
  let s = '<g class="ovnode" data-sec="sec' + t.i + '">';
  s += '<rect x="' + x + '" y="' + y + '" width="' + CW + '" height="' + CH + '" rx="10" class="card ' + cls + '"/>';
  s += '<text x="' + (x + CW / 2) + '" y="' + (y + 26) + '" text-anchor="middle" class="ct">' + esc(trunc(t.short, 26)) + '</text>';
  s += '<text x="' + (x + CW / 2) + '" y="' + (y + 46) + '" text-anchor="middle" class="cs">' + t.proj + ' · ' + t.tq + 'T ' + t.qq + 'Q · ' + t.ms + ' ms</text>';
  s += '</g>';
  return s;
}

// Overview modo run: las 9 pruebas en un plano, en orden de corrida.
function overviewRun(tests) {
  const W = 900;
  const CW = 250;
  const CH = 64;
  const GAP = 60;
  const PER = 3;
  const rows = Math.ceil(tests.length / PER);
  const top = 58;
  const rowH = 112;
  const H = top + rows * rowH + 56;
  const pos = (i) => ({ x: 20 + (i % PER) * (CW + GAP), y: top + Math.floor(i / PER) * rowH });
  let s = '<defs><pattern id="dotsov" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" class="dotgrid"/></pattern></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="14" fill="url(#dotsov)"/>';
  s += '<rect x="10" y="10" width="' + (W - 20) + '" height="' + (H - 20) + '" rx="10" class="plane"/>';
  s += '<text x="24" y="34" class="plabel">RUN PLANE (ALL TESTS)</text>';
  tests.forEach((t, i) => {
    const p = pos(i);
    s += ovCard(p.x, p.y, t, PCOLOR[t.proj] || 'ext');
    if (i < tests.length - 1) {
      const q = pos(i + 1);
      if (Math.floor(i / PER) === Math.floor((i + 1) / PER)) {
        const ym = p.y + CH / 2;
        s += '<line x1="' + (p.x + CW) + '" y1="' + ym + '" x2="' + q.x + '" y2="' + ym + '" class="edge dim"/>';
        s += '<polygon points="' + (q.x - 9) + ',' + (ym - 4) + ' ' + q.x + ',' + ym + ' ' + (q.x - 9) + ',' + (ym + 4) + '" class="ehead"/>';
      }
    }
  });
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img">' + s + '</svg>';
}

// Overview modo project: un plano ambar por proyecto.
function overviewProj(tests) {
  const W = 900;
  const CW = 250;
  const CH = 64;
  const GAP = 60;
  const PER = 3;
  const order = ['terramind', 'pulso', 'querylands', 'educore', 'otro'];
  const groups = order.map((g) => ({ g, ts: tests.filter((t) => t.proj === g) })).filter((x) => x.ts.length);
  let y = 58;
  let s = '';
  let totalH = 0;
  const parts = groups.map((gr) => {
    const rows = Math.ceil(gr.ts.length / PER);
    const ph = 46 + rows * 96 + 24;
    let g = '<rect x="10" y="' + y + '" width="' + (W - 20) + '" height="' + ph + '" rx="10" class="plane"/>';
    g += '<text x="24" y="' + (y + 24) + '" class="plabel">' + gr.g.toUpperCase() + ' PLANE</text>';
    gr.ts.forEach((t, j) => {
      const x = 20 + (j % PER) * (CW + GAP);
      const yy = y + 46 + Math.floor(j / PER) * 96;
      g += ovCard(x, yy, t, PCOLOR[t.proj] || 'ext');
    });
    y += ph + 16;
    return g;
  });
  totalH = y + 40;
  s = '<defs><pattern id="dotsop" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" class="dotgrid"/></pattern></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + totalH + '" rx="14" fill="url(#dotsop)"/>';
  s += parts.join('');
  return '<svg viewBox="0 0 ' + W + ' ' + totalH + '" width="100%" role="img">' + s + '</svg>';
}

function main() {
  if (!fs.existsSync(IN)) {
    console.log('Sin datos: corre primero "npx playwright test".');
    process.exit(1);
  }
  const files = fs.readdirSync(IN).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.log('Sin datos en flow/.');
    process.exit(1);
  }
  const tests = files.map((f, i) => {
    const t = JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8'));
    const nodes = toNodes(t.events);
    const ms = nodes.reduce((a, n) => a + (n.ms || 0), 0);
    return {
      i,
      title: t.title,
      short: t.title.replace(/ @\w+/g, ''),
      proj: projectOf(t.title),
      nodes,
      ms,
      tq: nodes.filter((n) => n.kind === 'task').length,
      qq: nodes.filter((n) => n.kind === 'question').length,
    };
  });
  const totalT = tests.reduce((a, t) => a + t.tq, 0);
  const totalQ = tests.reduce((a, t) => a + t.qq, 0);
  const totalMs = tests.reduce((a, t) => a + t.ms, 0);
  const totalBeats = tests.reduce((a, t) => a + t.nodes.length, 0);
  const today = new Date().toISOString().slice(0, 10);

  const chain = tests
    .map(
      (t, k) =>
        (k > 0 ? '<span class="arr">→</span>' : '') +
        '<button class="chap" data-sec="sec' + t.i + '" data-title="' + esc(t.short) + '" data-stops="' + t.nodes.length + '"><span class="n">0' + (t.i + 1) + '</span> ' + esc(trunc(t.short, 20)) + '</button>',
    )
    .join('');

  const sections = tests
    .map(
      (t, k) =>
        '<details class="canvas" id="sec' + t.i + '"' + (k === 0 ? ' open' : '') + '><summary><h2>' + esc(t.title) + '</h2>' +
        '<p class="sub">Data flow: Actor → Tasks → Page · ' + t.tq + ' tareas · ' + t.qq + ' preguntas · ' + t.ms + ' ms en pasos</p>' +
        '<span class="hint">▸ VER DIAGRAMA</span></summary>' +
        '<div class="zoomable">' + strip(t.nodes, t.i) + '</div></details>',
    )
    .join('\n');

  const dots = ['task', 'q', 'db', 'ext'];
  const cards = tests
    .map(
      (t, k) =>
        '<div class="note"><p class="nt"><span class="dot ' + dots[k % 4] + '"></span>' + esc(t.title) + '</p>' +
        '<ul><li>' + t.tq + ' tareas trazadas con duración real</li><li>' + t.qq + ' preguntas con respuesta visible</li><li>' + t.ms + ' ms acumulados en pasos</li>' +
        '<li><a class="link" href="archify/' + slug(t.title) + '.html">Ver en visor Archify →</a></li></ul></div>',
    )
    .join('');

  const beats = [];
  tests.forEach((t) =>
    t.nodes.forEach((n, j) =>
      beats.push({ sec: 'sec' + t.i, node: 'n' + t.i + '_' + j, label: t.short + ' — ' + (n.kind === 'task' ? '▶' : '?') + ' ' + n.name }),
    ),
  );

  const html = '<!doctype html><html lang="es" data-theme="dark" data-preset="classic"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Greenbox — Flow</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">' +
    '<style>' +
    ':root{--bg1:#f4f5fa;--bg2:#e8eaf3;--panel:#ffffff;--ink:#111827;--muted:#6b7280;--dim:#9ca3af;--border:#e2e5ee;--teal:#0d9488;--green:#16a34a;--violet:#9333ea;--amber:#b45309;--slate:#64748b;--red:#dc2626;--dots:#e3e6f0;--chipbg:#111827;}' +
    '[data-theme="dark"]{--bg1:#020617;--bg2:#020617;--panel:#0F172A;--ink:#FFFFFF;--muted:#94A3B8;--dim:#475569;--border:#1E293B;--teal:#22D3EE;--green:#34D399;--violet:#A78BFA;--amber:#FBBF24;--slate:#94A3B8;--red:#FB7185;--dots:#1E293B;--chipbg:#000000;}' +
    '*{box-sizing:border-box}body{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:linear-gradient(180deg,var(--bg1),var(--bg2));color:var(--ink);max-width:1060px;margin:0 auto;padding:2rem 1.25rem 4rem;font-size:.75rem;line-height:1.55}' +
    'h1{font-size:1.5rem;font-weight:700;letter-spacing:-.025em;margin:.5rem 0 .25rem}' +
    '.tdot{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--teal);margin-right:.6rem}' +
    '.signal{display:inline-block;border:1.5px solid var(--teal);color:var(--teal);border-radius:999px;padding:3px 14px;font-size:.625rem;font-weight:700;letter-spacing:.12em;margin-left:.6rem;vertical-align:middle}' +
    '.sub{color:var(--muted);font-size:.75rem;margin:.25rem 0 0}' +
    'header.top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}' +
    '.pills{display:flex;gap:.6rem;position:relative;flex-wrap:wrap}' +
    '.pill{background:var(--panel);border:1px solid var(--border);border-radius:.5rem;padding:.5rem .875rem;font:inherit;font-size:.75rem;color:var(--ink);cursor:pointer;transition:border-color .15s,background .15s}' +
    '.pill:hover{border-color:var(--teal)}.pill:focus-visible{outline:2px solid var(--teal);outline-offset:2px}' +
    '.pill .d{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--teal);margin-right:7px}' +
    '.pill .d.off{background:var(--dim)}' +
    '.pill.on{border-color:var(--teal)}' +
    '.pop{position:relative}' +
    '.menu{position:absolute;top:110%;right:0;background:var(--panel);border:1px solid var(--border);border-radius:.5rem;min-width:240px;display:none;z-index:50}' +
    '.menu.open{display:block}.menu button{display:block;width:100%;text-align:left;background:none;border:none;color:var(--ink);font:inherit;font-size:.75rem;padding:.6rem .9rem;cursor:pointer}.menu button:hover{background:var(--border)}.menu button.sel{color:var(--teal)}' +
    '.guide{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:1rem 1.25rem;margin:1.25rem 0}' +
    '.guide small{color:var(--teal);font-size:.625rem;font-weight:700;letter-spacing:.12em}.guide b{font-size:.875rem;font-weight:600}' +
    '.ghead{display:flex;gap:1.25rem;align-items:center;flex-wrap:wrap}' +
    '.chain{display:flex;gap:.35rem;align-items:center;overflow-x:auto;padding:.6rem 0;white-space:nowrap}' +
    '.chain .arr{color:var(--dim)}' +
    '.chap{background:transparent;border:1px solid var(--border);border-radius:999px;padding:.35rem .8rem;font:inherit;font-size:.75rem;color:var(--ink);cursor:pointer;transition:border-color .15s;white-space:nowrap}' +
    '.chap:hover{border-color:var(--teal)}.chap .n{display:inline-block;border:1.5px solid var(--teal);color:var(--teal);border-radius:50%;width:20px;height:20px;line-height:17px;text-align:center;font-size:.625rem;margin-right:6px}' +
    '.gact{display:flex;gap:1rem;align-items:center;margin-top:.4rem;flex-wrap:wrap}' +
    '.play{color:var(--teal);font-weight:700;border:none;background:none;font:inherit;font-size:.75rem;cursor:pointer}' +
    '.link{background:none;border:none;color:var(--muted);font:inherit;font-size:.75rem;cursor:pointer}.link:hover{color:var(--teal)}' +
    'a.link{text-decoration:none}' +
    '.counts{margin-left:auto;color:var(--muted);font-size:.75rem}.counts b{color:var(--teal)}' +
    '#beat{font-size:.75rem;color:var(--muted);width:100%}' +
    '.chapcard{border:1.5px solid var(--teal);border-radius:1rem;padding:.9rem 1.25rem;margin:0 0 1.25rem;box-shadow:0 0 12px rgba(34,211,238,.35);display:flex;justify-content:space-between;align-items:center;gap:1rem}' +
    '.chapcard b{font-size:.875rem}.chapcard .stops{color:var(--muted);font-size:.75rem;white-space:nowrap}' +
    '.canvas{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin:1.25rem 0}' +
    '.canvas h2{margin:0 0 .25rem;font-size:.875rem;font-weight:600}.canvas .sub{margin-bottom:.75rem}' +
    'svg text{font-family:"JetBrains Mono",ui-monospace,monospace}' +
    '.dotgrid{fill:var(--dots)}[data-theme="dark"] .dotgrid{opacity:.6}' +
    '.plane{fill:none;stroke:var(--amber);stroke-width:1.5;stroke-dasharray:7,5;opacity:.75}[data-theme="dark"] .plane{opacity:.5}' +
    '.plabel{font-size:11px;font-weight:700;letter-spacing:.12em;fill:var(--amber)}' +
    '.card{fill:var(--panel);stroke-width:2}[data-theme="dark"] .card{stroke-width:1.5}' +
    '.card.nt,.card.task{stroke:var(--teal)}.card.nq,.card.q{stroke:var(--green)}.card.db{stroke:var(--violet)}.card.ext{stroke:var(--slate)}' +
    '.badge.nt,.badge.task{fill:var(--teal)}.badge.nq,.badge.q{fill:var(--green)}' +
    '.badgeT{font-size:11px;font-weight:700;fill:#fff}[data-theme="dark"] .badgeT{fill:#020617}' +
    '.ct{font-size:12px;font-weight:600;fill:var(--ink)}.cs{font-size:11px;fill:var(--muted)}' +
    '.mchip rect{fill:var(--chipbg);stroke:var(--border);stroke-width:1}.mchip text{font-size:10px;fill:#fff}' +
    '.edge{stroke:var(--teal);stroke-width:2}.edge.dim{stroke:var(--dim)}.edgep{fill:none;stroke:var(--teal);stroke-width:2}.ehead{fill:var(--teal)}' +
    '.lt{font-size:12px;font-weight:700;fill:var(--ink)}.chip{fill:none;stroke-width:2}.chip.nt{stroke:var(--teal)}.chip.nq{stroke:var(--green)}.chip.na{stroke:var(--violet)}' +
    '.chipT{font-size:11px;fill:var(--muted)}' +
    '.node{transition:opacity .18s}.node.dim{opacity:.25}.node.hot .card{stroke-width:3;filter:drop-shadow(0 0 7px var(--teal))}' +
    '.ovnode{cursor:pointer}.ovnode:hover .card{stroke-width:3}' +
    '.notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.875rem;margin-top:.5rem}' +
    '.note{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:.875rem 1rem}' +
    '.note .nt{font-weight:600;font-size:.75rem;margin:0 0 .5rem}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}' +
    '.dot.task{background:var(--teal)}.dot.q{background:var(--green)}.dot.db{background:var(--violet)}.dot.ext{background:var(--slate)}' +
    '.note ul{margin:0;padding-left:1.1rem;font-size:.75rem;color:var(--muted)}' +
    '.zoombar{position:fixed;bottom:1.25rem;right:1.25rem;background:var(--panel);border:1px solid var(--border);border-radius:999px;display:flex;gap:.25rem;align-items:center;padding:.35rem .7rem;z-index:40}' +
    '.zoombar button{background:none;border:none;color:var(--ink);font:inherit;font-size:.75rem;cursor:pointer;padding:.3rem .55rem;border-radius:.5rem}.zoombar button:hover{color:var(--teal)}' +
    'html[data-preset="signal"] body{background-color:#030711;background-image:radial-gradient(circle at 18% -8%,rgba(34,211,238,.28),transparent 55rem),radial-gradient(circle at 92% 12%,rgba(139,92,246,.22),transparent 50rem);background-attachment:fixed}' +
    'html[data-preset="signal"] .canvas{box-shadow:0 28px 80px rgba(34,211,238,.25)}' +
    'html[data-preset="signal"] .note{background:rgba(6,14,28,.88);border-color:#1d3350}' +
    'html[data-preset="signal"] .pill,html[data-preset="signal"] .chap{border-color:#1d3350}' +
    'html[data-theme="light"][data-preset="signal"] body{background-color:#f4f9fc;background-image:radial-gradient(circle at 18% -8%,rgba(6,182,212,.20),transparent 55rem),radial-gradient(circle at 92% 12%,rgba(139,92,246,.14),transparent 50rem)}' +
    'html[data-theme="light"][data-preset="signal"] .note{background:rgba(255,255,255,.92);border-color:#bfd5e2}' +
    'html[data-preset="blueprint"] body{background-color:#06131f;background-image:linear-gradient(#17425a 1px,transparent 1px),linear-gradient(90deg,#17425a 1px,transparent 1px);background-size:32px 32px;background-position:-1px -1px;background-attachment:fixed}' +
    'html[data-preset="blueprint"] .canvas,html[data-preset="blueprint"] .guide,html[data-preset="blueprint"] .note,html[data-preset="blueprint"] .chapcard{border-radius:0}' +
    'html[data-preset="blueprint"] .pill,html[data-preset="blueprint"] .chap,html[data-preset="blueprint"] .zoombar{border-radius:0}' +
    'html[data-preset="blueprint"] *{box-shadow:none!important}' +
    'html[data-preset="blueprint"] .node.hot .card{filter:none}' +
    'html[data-preset="blueprint"] .note{background:rgba(7,27,43,.95);border-color:#27627f}' +
    'html[data-preset="blueprint"] .pill,html[data-preset="blueprint"] .chap{border-color:#27627f}' +
    'html[data-theme="light"][data-preset="blueprint"] body{background-color:#edf7fa;background-image:linear-gradient(#b5d5e1 1px,transparent 1px),linear-gradient(90deg,#b5d5e1 1px,transparent 1px)}' +
    'html[data-theme="light"][data-preset="blueprint"] .note{background:rgba(249,253,255,.95);border-color:#78aabd}' +
    'html[data-preset="editorial"] body{max-width:860px;background-color:#181611;background-image:linear-gradient(90deg,transparent 0,transparent 5.4rem,rgba(221,107,61,.22) 5.4rem,rgba(221,107,61,.22) calc(5.4rem + 1px),transparent calc(5.4rem + 1px)),repeating-linear-gradient(0deg,transparent 0,transparent 31px,rgba(98,90,74,.40) 31px,rgba(98,90,74,.40) 32px);background-attachment:fixed}' +
    'html[data-preset="editorial"] h1,html[data-preset="editorial"] h2{font-family:Georgia,"Times New Roman",serif;font-size:2rem}' +
    'html[data-preset="editorial"] .canvas{padding:2.5rem;box-shadow:0 8px 24px rgba(0,0,0,.06)}' +
    'html[data-preset="editorial"] .notes{grid-template-columns:1fr}' +
    'html[data-preset="editorial"] .note{background:rgba(35,31,24,.96);border-color:#625a4a}' +
    'html[data-preset="editorial"] .pill,html[data-preset="editorial"] .chap{border-color:#625a4a}' +
    'html[data-theme="light"][data-preset="editorial"] body{background-color:#f2eee5;background-image:linear-gradient(90deg,transparent 0,transparent 5.4rem,rgba(187,76,35,.18) 5.4rem,rgba(187,76,35,.18) calc(5.4rem + 1px),transparent calc(5.4rem + 1px)),repeating-linear-gradient(0deg,transparent 0,transparent 31px,rgba(216,208,194,.55) 31px,rgba(216,208,194,.55) 32px)}' +
    'html[data-theme="light"][data-preset="editorial"] .note{background:rgba(251,248,241,.97);border-color:#c4b9a6}' +
    /* Variables del SVG: cambian los colores del diagrama por preset */
    'html[data-theme="dark"][data-preset="signal"]{--bg1:#030711;--bg2:#030711;--panel:rgba(6,14,28,.88);--ink:#f5fbff;--muted:#9eb0c7;--dim:#52667f;--border:#1d3350;--teal:#22d3ee;--dots:#1d3350;--chipbg:#0a1628}' +
    'html[data-theme="dark"][data-preset="blueprint"]{--bg1:#06131f;--bg2:#06131f;--panel:rgba(7,27,43,.95);--ink:#e3f6ff;--muted:#91b8ca;--dim:#557e92;--border:#27627f;--teal:#66d9ef;--dots:#17425a;--chipbg:#0a2031}' +
    'html[data-theme="dark"][data-preset="editorial"]{--bg1:#181611;--bg2:#181611;--panel:rgba(35,31,24,.96);--ink:#f4eddf;--muted:#b9ae9b;--dim:#776e60;--border:#625a4a;--teal:#dd6b3d;--dots:#39342a;--chipbg:#231f18}' +
    'html[data-theme="light"][data-preset="signal"]{--bg1:#f4f9fc;--bg2:#f4f9fc;--panel:rgba(255,255,255,.92);--ink:#102638;--muted:#587287;--dim:#8aa2b4;--border:#bfd5e2;--teal:#0d9488;--dots:#bfd5e2;--chipbg:#e8f3f8}' +
    'html[data-theme="light"][data-preset="blueprint"]{--bg1:#edf7fa;--bg2:#edf7fa;--panel:rgba(249,253,255,.95);--ink:#123344;--muted:#4e7486;--dim:#86a6b4;--border:#78aabd;--teal:#087f9c;--dots:#b5d5e1;--chipbg:#f9fdff}' +
    'html[data-theme="light"][data-preset="editorial"]{--bg1:#f2eee5;--bg2:#f2eee5;--panel:rgba(251,248,241,.97);--ink:#242018;--muted:#6f6658;--dim:#a09788;--border:#c4b9a6;--teal:#bb4c23;--dots:#d8d0c2;--chipbg:#fbf8f1}' +
    '#zpct{min-width:3.2em;text-align:center;color:var(--muted)}' +
    'details.canvas summary{cursor:pointer;list-style:none}details.canvas summary::-webkit-details-marker{display:none}' +
    'details.canvas summary .hint{color:var(--teal);font-size:.625rem;font-weight:700;letter-spacing:.12em}' +
    'body.present header.top,body.present .guide,body.present .notes,body.present .zoombar,body.present .overview,body.present .chapcard{display:none}' +
    'body.present{max-width:1400px}' +
    '@media print{.pills,.guide,.zoombar,.overview,.chapcard{display:none}body{background:#fff}}' +
    '</style></head><body>' +
    '<header class="top"><div><h1><span class="tdot"></span>Greenbox — Flow<span class="signal">SCREENPLAY FLOW</span></h1>' +
    '<p class="sub">Data flow: Actor → Tasks → Page · ' + tests.length + ' pruebas · ' + totalT + ' tareas · ' + totalQ + ' preguntas · ' + today + '</p></div>' +
    '<div class="pills"><button class="pill" id="themeBtn">◐ Theme</button>' +
    '<div class="pop"><button class="pill" id="flowBtn"><span class="d"></span>Flow ▾</button><div class="menu" id="flowMenu">' +
    '<button data-p="classic" class="sel">Classic</button><button data-p="signal">Signal Flow</button><button data-p="blueprint">Blueprint</button><button data-p="editorial">Editorial</button></div></div>' +
    '<button class="pill" id="stillBtn"><span class="d off" id="stillDot"></span>Still</button>' +
    '<button class="pill" id="presentBtn">⛶ Present</button>' +
    '<div class="pop"><button class="pill" id="exportBtn">⤓ Export ▾</button><div class="menu" id="exportMenu">' +
    '<button data-x="svg">Descargar SVG (diagrama visible)</button><button data-x="copy">Copiar SVG (portapapeles)</button><button data-x="print">Imprimir / PDF</button></div></div><a class="pill" href="archify/system.html" style="text-decoration:none">Mapa del sistema</a></div></header>' +
    '<div class="guide"><div class="ghead"><a class="link" id="backBtn" title="Atrás">←</a><div><small id="gcount">GUIDED VIEWS 1 / 1</small><div class="track"><div id="bar"></div></div><b>Overview</b> <span class="sub">' + totalBeats + ' selected nodes</span></div></div>' +
    '<div class="chain">' + chain + '</div>' +
    '<div class="gact"><button class="play" id="playBtn">▶ Play story</button><button class="link" id="copyBtn"># Copy moment</button><button class="link" id="showAll">Show all</button>' +
    '<span class="counts">=' + tests.length + ' <b>+' + totalBeats + '</b></span><div id="beat">Pulsa Play para recorrer cada paso.</div></div></div>' +
    '<div class="chapcard" id="chapcard"><b><span class="n" style="display:inline-block;border:1.5px solid var(--teal);color:var(--teal);border-radius:50%;width:22px;height:22px;line-height:19px;text-align:center;font-size:.625rem;margin-right:8px">01</span><span id="chapTitle">Run overview</span></b><span class="stops" id="chapStops">' + tests.length + ' stops</span></div>' +
    '<section class="canvas overview"><h2>Run overview</h2><p class="sub">Todas las pruebas en un plano — clic para saltar · <button class="link" id="ovhint">Show all</button> · <button class="link" id="ovmode">Project planes ⇄</button></p><div class="zoomable" id="ovwrap">' + overviewRun(tests) + '</div></section>' +
    sections +
    '<div class="notes">' + cards + '</div>' +
    '<div class="zoombar"><button id="zout">−</button><span id="zpct">100%</span><button id="zin">＋</button><button id="zall">Show all</button></div>' +
    '<script>' +
    'var beats=' + JSON.stringify(beats) + ';' +
    'var STOPS=' + JSON.stringify(Object.fromEntries(tests.map((t) => ['sec' + t.i, { title: t.short, stops: t.nodes.length }]))) + ';' +
    'var OVRUN=' + JSON.stringify(overviewRun(tests)).replace(/</g, '\\u003c') + ';' +
    'var OVPROJ=' + JSON.stringify(overviewProj(tests)).replace(/</g, '\\u003c') + ';' +
    'var bi=-1,timer=null,z=100,still=false,chap="Run overview",stops=' + tests.length + ';' +
    'function ready(fn){if(document.readyState!=="loading")fn();else document.addEventListener("DOMContentLoaded",fn);}' +
    'ready(function(){' +
    'var q=function(s){return document.querySelector(s);},qa=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};' +
    'try{var u=new URLSearchParams(location.search);if(u.get("theme")==="dark"||u.get("theme")==="light"){document.documentElement.dataset.theme=u.get("theme");}else if(localStorage.getItem("gr-theme")){document.documentElement.dataset.theme=localStorage.getItem("gr-theme");}}catch(e){}' +
    'try{var u2=new URLSearchParams(location.search);var pr=u2.get("preset")||localStorage.getItem("gr-preset");if(pr==="classic"||pr==="signal"||pr==="blueprint"||pr==="editorial"){document.documentElement.dataset.preset=pr;qa("#flowMenu button").forEach(function(b){b.classList.toggle("sel",b.getAttribute("data-p")===pr);});}}catch(e){}' +
    'q("#themeBtn").onclick=function(){var h=document.documentElement;h.dataset.theme=h.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem("gr-theme",h.dataset.theme);}catch(e){}};' +
    'q("#presentBtn").onclick=function(){if(!document.fullscreenElement){document.documentElement.requestFullscreen().catch(function(){});}else{document.exitFullscreen();}document.body.classList.add("present");};' +
    'document.addEventListener("fullscreenchange",function(){if(!document.fullscreenElement)document.body.classList.remove("present");});' +
    'function menu(btn,el){q(btn).onclick=function(ev){ev.stopPropagation();qa(".menu").forEach(function(m){if(m!==q(el))m.classList.remove("open");});q(el).classList.toggle("open");};}' +
    'menu("#exportBtn","#exportMenu");menu("#flowBtn","#flowMenu");' +
    'document.addEventListener("click",function(){qa(".menu").forEach(function(m){m.classList.remove("open");});});' +
    'q("#flowMenu").addEventListener("click",function(ev){var m=ev.target.getAttribute("data-p");if(!m)return;' +
    'qa("#flowMenu button").forEach(function(b){b.classList.remove("sel");});ev.target.classList.add("sel");setPreset(m);});' +
    'function setPreset(m){document.documentElement.dataset.preset=m;try{localStorage.setItem("gr-preset",m);}catch(e){}}' +
    'var ovmode="run";q("#ovmode").onclick=function(){ovmode=(ovmode==="run"?"proj":"run");q("#ovwrap").innerHTML=(ovmode==="proj"?OVPROJ:OVRUN);bindOv();q("#ovmode").textContent=(ovmode==="run"?"Project planes ⇄":"Run plane ⇄");};' +
    'q("#stillBtn").onclick=function(){still=!still;q("#stillDot").classList.toggle("off",!still);q("#stillBtn").classList.toggle("on",still);if(still&&timer){clearInterval(timer);timer=null;q("#playBtn").textContent="▶ Play story";}};' +
    'function firstSvg(){var secs=qa("details.canvas");for(var i=0;i<secs.length;i++){if(!secs[i].open)continue;var r=secs[i].getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)return secs[i].querySelector("svg");}return document.querySelector("#ovwrap svg");}' +
    'function dl(name,blob){var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);}' +
    'q("#exportMenu").addEventListener("click",function(ev){var k=ev.target.getAttribute("data-x");if(!k)return;' +
    'if(k==="print"){window.print();return;}' +
    'var s=firstSvg();if(!s)return;var xml=new XMLSerializer().serializeToString(s);' +
    'if(k==="svg"){dl("flow-diagram.svg",new Blob([xml],{type:"image/svg+xml"}));return;}' +
    'if(k==="copy"&&navigator.clipboard){navigator.clipboard.writeText(xml);}});' +
    'function setZ(n){z=Math.min(200,Math.max(50,n));q("#zpct").textContent=z+"%";qa(".zoomable").forEach(function(el){el.style.zoom=z+"%";});}' +
    'q("#zin").onclick=function(){setZ(z+25);};q("#zout").onclick=function(){setZ(z-25);};' +
    'function showAll(){setZ(100);window.scrollTo({top:0,behavior:"smooth"});}' +
    'q("#zall").onclick=showAll;q("#showAll").onclick=showAll;q("#ovhint").onclick=showAll;' +
    'q("#backBtn").onclick=function(){history.back();};' +
    'function setChap(t,s){q("#chapTitle").textContent=t;q("#chapStops").textContent=s+" stops";}' +
    'function openSec(id){var s=document.getElementById(id);if(s&&s.open===false)s.open=true;return s;}' +
    'function bindOv(){qa(".ovnode").forEach(function(g){g.addEventListener("click",function(){stop();var s=openSec(g.getAttribute("data-sec"));if(s)s.scrollIntoView({behavior:"smooth",block:"center"});});});}' +
    'bindOv();' +
    'function clearHot(){qa(".node.hot").forEach(function(e){e.classList.remove("hot");});qa(".node.dim").forEach(function(e){e.classList.remove("dim");});}' +
    'function show(i){clearHot();bi=i;var b=beats[i];var sec=openSec(b.sec);if(sec)sec.scrollIntoView({block:"center",behavior:"smooth"});' +
    'if(sec)sec.querySelectorAll(".node").forEach(function(e){e.classList.add("dim");});' +
    'var el=document.getElementById(b.node);if(el){el.classList.remove("dim");el.classList.add("hot");}' +
    'q("#beat").textContent="Beat "+(i+1)+" / "+beats.length+" — "+b.label;' +
    'q("#gcount").textContent="GUIDED VIEWS 1 / 1";var st=STOPS[b.sec];if(st)setChap(st.title,st.stops);}' +
    'function stop(){if(timer){clearInterval(timer);timer=null;}q("#playBtn").textContent="▶ Play story";}' +
    'q("#playBtn").onclick=function(){if(timer){stop();return;}' +
    'if(still){var i=(bi+1)%beats.length;show(i);return;}' +
    'q("#playBtn").textContent="⏸ Pause";var i2=(bi+1)%beats.length;show(i2);' +
    'timer=setInterval(function(){i2=(i2+1)%beats.length;show(i2);},1600);};' +
    'q("#copyBtn").onclick=function(){var t=bi>=0?beats[bi].label:chap;var s="Greenbox — "+t+" · "+location.href.split("?")[0];if(navigator.clipboard)navigator.clipboard.writeText(s);q("#beat").textContent="Momento copiado: "+t;};' +
    'qa(".chap").forEach(function(c){c.addEventListener("click",function(){stop();var s=openSec(c.getAttribute("data-sec"));if(s)s.scrollIntoView({behavior:"smooth",block:"center"});' +
    'setChap(c.getAttribute("data-title"),c.getAttribute("data-stops"));});});' +
    '});</script></body></html>';

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log('Flow OK: ' + tests.length + ' pruebas, ' + totalT + ' tareas, ' + totalQ + ' preguntas -> ' + OUT + '/index.html');
}

main();
