// Genera flow-report/index.html con el sistema de diseno exacto de Archify
// (DESIGN.md oficial): JetBrains Mono unico, variables dark-first, vocabulario
// semantico fijo, radios 0.5/1/999px, chrome compacto, transiciones 140-200ms.
// Incluye: temas dark/light (?theme=), zoom con %, Present, Export (SVG/print),
// vistas guiadas con Play story, overview global y leyenda. Sin dependencias.
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

// Proyecto inferido del titulo (para el color del overview). Documentado y acotado.
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
    if ((cur + ' ' + w).trim().length > 26 && cur) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  lines.push(cur.trim());
  return lines.slice(0, 2);
}

// Tira de nodos: tarjetas blancas/mask con borde semantico, flechas con
// etiquetas mono, plano ambar punteado, leyenda. Clases CSS (no colores fijos)
// para que los temas dark/light apliquen dentro del SVG.
function strip(nodes, uid) {
  const W = 900;
  const CW = 250;
  const CH = 78;
  const GAP = 60;
  const PER = 3;
  const rows = Math.max(1, Math.ceil(nodes.length / PER));
  const top = 64;
  const rowH = 150;
  const H = top + rows * rowH + 60;
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
    s += '<g id="n' + uid + '_' + i + '" class="node">';
    s += '<rect x="' + x + '" y="' + y + '" width="' + CW + '" height="' + CH + '" rx="10" class="card ' + cls + '"/>';
    s += '<rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="18" height="18" rx="4" class="badge ' + cls + '"/>';
    s += '<text x="' + (x + 19) + '" y="' + (y + 23) + '" text-anchor="middle" class="badgeT">' + (n.kind === 'task' ? 'T' : '?') + '</text>';
    s += '<text x="' + (x + CW / 2 + 8) + '" y="' + (y + 26) + '" text-anchor="middle" class="ct">' + esc(trunc(lines[0], 26)) + '</text>';
    if (lines[1])
      s += '<text x="' + (x + CW / 2 + 8) + '" y="' + (y + 42) + '" text-anchor="middle" class="cs">' + esc(trunc(lines[1], 28)) + '</text>';
    const sub = n.kind === 'task' ? '✔ ' + n.ms + ' ms' : '= ' + trunc(n.answer, 24);
    s += '<text x="' + (x + CW / 2) + '" y="' + (y + (lines[1] ? 60 : 56)) + '" text-anchor="middle" class="csub ' + cls + '">' + esc(sub) + '</text>';
    s += '</g>';
    if (i < nodes.length - 1) {
      const q = pos(i + 1);
      const sameRow = Math.floor(i / PER) === Math.floor((i + 1) / PER);
      const lbl = n.kind === 'task' ? n.ms + ' ms' : 'next';
      if (sameRow) {
        const x1 = x + CW;
        const x2 = q.x;
        const ym = y + CH / 2;
        s += '<line x1="' + x1 + '" y1="' + ym + '" x2="' + x2 + '" y2="' + ym + '" class="edge"/>';
        s += '<polygon points="' + (x2 - 9) + ',' + (ym - 4) + ' ' + x2 + ',' + ym + ' ' + (x2 - 9) + ',' + (ym + 4) + '" class="ehead"/>';
        s += '<text x="' + (x1 + x2) / 2 + '" y="' + (ym - 8) + '" text-anchor="middle" class="elabel">' + esc(lbl) + '</text>';
      } else {
        const x1 = x + CW / 2;
        const y1 = y + CH;
        const x2 = q.x + CW / 2;
        const y2 = q.y;
        const mid = y1 + (y2 - y1) / 2;
        s += '<polyline points="' + x1 + ',' + y1 + ' ' + x1 + ',' + mid + ' ' + x2 + ',' + mid + ' ' + x2 + ',' + y2 + '" class="edgep"/>';
        s += '<polygon points="' + (x2 - 4) + ',' + (y2 - 9) + ' ' + x2 + ',' + y2 + ' ' + (x2 + 4) + ',' + (y2 - 9) + '" class="ehead"/>';
        s += '<text x="' + (x1 + x2) / 2 + '" y="' + (mid - 8) + '" text-anchor="middle" class="elabel">' + esc(lbl) + '</text>';
      }
    }
  });
  const ly = H - 30;
  s += '<text x="24" y="' + (ly - 22) + '" class="lt">Legend</text>';
  const chip = (x, cls, label) =>
    '<rect x="' + x + '" y="' + (ly - 14) + '" width="14" height="10" rx="3" class="chip ' + cls + '"/><text x="' + (x + 20) + '" y="' + (ly - 4) + '" class="chipT">' + label + '</text>';
  s += chip(24, 'nt', 'Tarea') + chip(110, 'nq', 'Pregunta') + chip(220, 'na', 'Respuesta');
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img">' + s + '</svg>';
}

// Overview global: las 9 pruebas como nodos en un plano, en orden de corrida.
function overview(tests) {
  const W = 900;
  const CW = 250;
  const CH = 64;
  const GAP = 60;
  const PER = 3;
  const rows = Math.ceil(tests.length / PER);
  const top = 64;
  const rowH = 128;
  const H = top + rows * rowH + 60;
  const pos = (i) => ({ x: 20 + (i % PER) * (CW + GAP), y: top + Math.floor(i / PER) * rowH });
  let s = '<defs><pattern id="dotsov" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" class="dotgrid"/></pattern></defs>';
  s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" rx="14" fill="url(#dotsov)"/>';
  s += '<rect x="10" y="10" width="' + (W - 20) + '" height="' + (H - 20) + '" rx="10" class="plane"/>';
  s += '<text x="24" y="34" class="plabel">RUN PLANE (ALL TESTS)</text>';
  tests.forEach((t, i) => {
    const p = pos(i);
    const cls = PCOLOR[t.proj] || 'ext';
    s += '<g class="ovnode" data-sec="sec' + t.i + '">';
    s += '<rect x="' + p.x + '" y="' + p.y + '" width="' + CW + '" height="' + CH + '" rx="10" class="card ' + cls + '"/>';
    s += '<text x="' + (p.x + CW / 2) + '" y="' + (p.y + 26) + '" text-anchor="middle" class="ct">' + esc(trunc(t.short, 26)) + '</text>';
    s += '<text x="' + (p.x + CW / 2) + '" y="' + (p.y + 46) + '" text-anchor="middle" class="cs">' + t.proj + ' · ' + t.tq + 'T ' + t.qq + 'Q · ' + t.ms + ' ms</text>';
    s += '</g>';
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
  const today = new Date().toISOString().slice(0, 10);

  const chapters = tests
    .map((t) => '<button class="chap" data-sec="sec' + t.i + '"><span class="n">0' + (t.i + 1) + '</span> ' + esc(trunc(t.short, 28)) + '</button>')
    .join('');

  const sections = tests
    .map(
      (t) =>
        '<section class="canvas" id="sec' + t.i + '"><h2>' + esc(t.title) + '</h2>' +
        '<p class="sub">Data flow: Actor → Tasks → Page · ' + t.tq + ' tareas · ' + t.qq + ' preguntas · ' + t.ms + ' ms en pasos</p>' +
        '<div class="zoomable">' + strip(t.nodes, t.i) + '</div></section>',
    )
    .join('\n');

  const dots = ['task', 'q', 'db', 'ext'];
  const cards = tests
    .map(
      (t, k) =>
        '<div class="note"><p class="nt"><span class="dot ' + dots[k % 4] + '"></span>' + esc(t.title) + '</p>' +
        '<ul><li>' + t.tq + ' tareas trazadas con duración real</li><li>' + t.qq + ' preguntas con respuesta visible</li><li>' + t.ms + ' ms acumulados en pasos</li></ul></div>',
    )
    .join('');

  const beats = [];
  tests.forEach((t) =>
    t.nodes.forEach((n, j) =>
      beats.push({ sec: 'sec' + t.i, node: 'n' + t.i + '_' + j, label: t.title + ' — ' + (n.kind === 'task' ? '▶' : '?') + ' ' + n.name }),
    ),
  );

  const html = '<!doctype html><html lang="es" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Greenroom QA — Flow</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">' +
    '<style>' +
    ':root{--bg1:#f4f5fa;--bg2:#e8eaf3;--panel:#ffffff;--ink:#111827;--muted:#6b7280;--dim:#9ca3af;--border:#e2e5ee;--teal:#0d9488;--green:#16a34a;--violet:#9333ea;--amber:#b45309;--slate:#64748b;--red:#dc2626;--dots:#e3e6f0;--shadow:0 2px 8px rgba(0,0,0,.05);}' +
    '[data-theme="dark"]{--bg1:#020617;--bg2:#020617;--panel:#0F172A;--ink:#FFFFFF;--muted:#94A3B8;--dim:#475569;--border:#1E293B;--teal:#22D3EE;--green:#34D399;--violet:#A78BFA;--amber:#FBBF24;--slate:#94A3B8;--red:#FB7185;--dots:#1E293B;--shadow:none;}' +
    '*{box-sizing:border-box}body{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:linear-gradient(180deg,var(--bg1),var(--bg2));color:var(--ink);max-width:1060px;margin:0 auto;padding:2rem 1.25rem 4rem;font-size:.75rem;line-height:1.55}' +
    'h1{font-size:1.5rem;font-weight:700;letter-spacing:-.025em;margin:.5rem 0 .25rem}' +
    '.tdot{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--teal);margin-right:.6rem}' +
    '.signal{display:inline-block;border:1.5px solid var(--teal);color:var(--teal);border-radius:999px;padding:3px 14px;font-size:.625rem;font-weight:700;letter-spacing:.12em;margin-left:.6rem;vertical-align:middle}' +
    '.sub{color:var(--muted);font-size:.75rem;margin:.25rem 0 0}' +
    'header.top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}' +
    '.pills{display:flex;gap:.6rem;position:relative}' +
    '.pill{background:var(--panel);border:1px solid var(--border);border-radius:.5rem;padding:.5rem .875rem;font:inherit;font-size:.75rem;color:var(--ink);cursor:pointer;transition:border-color .15s,background .15s}' +
    '.pill:hover{border-color:var(--teal)}.pill:focus-visible{outline:2px solid var(--teal);outline-offset:2px}' +
    '.pill .d{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--teal);margin-right:7px}' +
    '.menu{position:absolute;top:110%;right:0;background:var(--panel);border:1px solid var(--border);border-radius:.5rem;min-width:220px;display:none;z-index:50;box-shadow:0 18px 48px rgba(0,0,0,.3)}' +
    '.menu.open{display:block}.menu button{display:block;width:100%;text-align:left;background:none;border:none;color:var(--ink);font:inherit;font-size:.75rem;padding:.6rem .9rem;cursor:pointer}.menu button:hover{background:var(--border)}' +
    '.guide{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:1rem 1.25rem;margin:1.25rem 0;display:flex;gap:1.25rem;align-items:center;flex-wrap:wrap}' +
    '.guide small{color:var(--teal);font-size:.625rem;font-weight:700;letter-spacing:.12em}.guide b{font-size:.875rem;font-weight:600}' +
    '.play{color:var(--teal);font-weight:700;border:none;background:none;font:inherit;font-size:.75rem;cursor:pointer}' +
    '.chaps{display:flex;gap:.5rem;flex-wrap:wrap}' +
    '.chap{background:var(--panel);border:1px solid var(--border);border-radius:999px;padding:.4rem .9rem;font:inherit;font-size:.75rem;color:var(--ink);cursor:pointer;transition:border-color .15s}' +
    '.chap:hover{border-color:var(--teal)}.chap .n{display:inline-block;border:1.5px solid var(--teal);color:var(--teal);border-radius:50%;width:20px;height:20px;line-height:17px;text-align:center;font-size:.625rem;margin-right:6px}' +
    '#beat{font-size:.75rem;color:var(--muted)}' +
    '.canvas{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:1.5rem;margin:1.25rem 0}' +
    '.canvas h2{margin:0 0 .25rem;font-size:.875rem;font-weight:600}.canvas .sub{margin-bottom:.75rem}' +
    'svg text{font-family:"JetBrains Mono",ui-monospace,monospace}' +
    '.dotgrid{fill:var(--dots)}.plane{fill:none;stroke:var(--amber);stroke-width:1.5;stroke-dasharray:7,5;opacity:.75}' +
    '.plabel{font-size:11px;font-weight:700;letter-spacing:.12em;fill:var(--amber)}' +
    '.card{fill:var(--panel);stroke-width:2}.card.nt{stroke:var(--teal)}.card.nq{stroke:var(--green)}.card.task{stroke:var(--teal)}.card.q{stroke:var(--green)}.card.db{stroke:var(--violet)}.card.ext{stroke:var(--slate)}' +
    '.badge.nt,.badge.task{fill:var(--teal)}.badge.nq,.badge.q{fill:var(--green)}' +
    '.badgeT{font-size:11px;font-weight:700;fill:#fff}' +
    '[data-theme="dark"] .badgeT{fill:#020617}' +
    '.ct{font-size:12px;font-weight:600;fill:var(--ink)}.cs{font-size:11px;fill:var(--muted)}' +
    '.csub{font-size:11px}.csub.nt{fill:var(--teal)}.csub.nq{fill:var(--violet)}' +
    '.edge{stroke:var(--teal);stroke-width:2}.edge.dim{stroke:var(--dim)}.edgep{fill:none;stroke:var(--teal);stroke-width:2}.ehead{fill:var(--teal)}' +
    '.elabel{font-size:10px;fill:var(--red)}' +
    '.lt{font-size:12px;font-weight:700;fill:var(--ink)}.chip{fill:none;stroke-width:2}.chip.nt{stroke:var(--teal)}.chip.nq{stroke:var(--green)}.chip.na{stroke:var(--violet)}' +
    '.chipT{font-size:11px;fill:var(--muted)}' +
    '.node{transition:opacity .18s}.node.dim{opacity:.25}.node.hot .card{stroke-width:4}' +
    '.ovnode{cursor:pointer}.ovnode:hover .card{stroke-width:3}' +
    '.notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.875rem;margin-top:.5rem}' +
    '.note{background:var(--panel);border:1px solid var(--border);border-radius:1rem;padding:.875rem 1rem}' +
    '.note .nt{font-weight:600;font-size:.75rem;margin:0 0 .5rem}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}' +
    '.dot.task{background:var(--teal)}.dot.q{background:var(--green)}.dot.db{background:var(--violet)}.dot.ext{background:var(--slate)}' +
    '.note ul{margin:0;padding-left:1.1rem;font-size:.75rem;color:var(--muted)}' +
    '.zoombar{position:fixed;bottom:1.25rem;right:1.25rem;background:var(--panel);border:1px solid var(--border);border-radius:999px;display:flex;gap:.25rem;align-items:center;padding:.35rem .7rem;box-shadow:0 18px 48px rgba(0,0,0,.3);z-index:40}' +
    '.zoombar button{background:none;border:none;color:var(--ink);font:inherit;font-size:.75rem;cursor:pointer;padding:.3rem .55rem;border-radius:.5rem}.zoombar button:hover{border:1px solid var(--teal);padding:calc(.3rem - 1px) calc(.55rem - 1px)}' +
    '#zpct{min-width:3.2em;text-align:center;color:var(--muted)}' +
    'body.present header.top,body.present .guide,body.present .notes,body.present .zoombar,body.present .overview{display:none}' +
    'body.present{max-width:1400px}' +
    '@media print{.pills,.guide,.zoombar,.overview{display:none}body{background:#fff}}' +
    '</style></head><body>' +
    '<header class="top"><div><h1><span class="tdot"></span>Greenroom QA — Flow<span class="signal">SCREENPLAY FLOW</span></h1>' +
    '<p class="sub">Data flow: Actor → Tasks → Page · ' + tests.length + ' pruebas · ' + totalT + ' tareas · ' + totalQ + ' preguntas · ' + today + '</p></div>' +
    '<div class="pills"><button class="pill" id="themeBtn">◐ Theme</button><button class="pill" id="presentBtn">⛶ Present</button>' +
    '<div style="position:relative"><button class="pill" id="exportBtn">⤓ Export ▾</button><div class="menu" id="exportMenu">' +
    '<button data-x="svg">Descargar SVG (diagramas)</button><button data-x="copy">Copiar SVG (portapapeles)</button><button data-x="print">Imprimir / PDF</button></div></div></div></header>' +
    '<div class="guide"><div><small id="gcount">GUIDED TESTS 0 / ' + tests.length + '</small><br><b>Explore this run</b> <button class="play" id="playBtn">▶ Play story</button><div id="beat">Pulsa Play para recorrer cada paso.</div></div>' +
    '<div class="chaps">' + chapters + '</div></div>' +
    '<section class="canvas overview"><h2>Run overview</h2><p class="sub">Todas las pruebas en un plano — clic para saltar · <span id="ovhint">Show all</span></p><div class="zoomable">' + overview(tests) + '</div></section>' +
    sections +
    '<div class="notes">' + cards + '</div>' +
    '<div class="zoombar"><button id="zout">−</button><span id="zpct">100%</span><button id="zin">＋</button><button id="zall">Show all</button></div>' +
    '<script>' +
    'var beats=' + JSON.stringify(beats) + ';' +
    'var bi=-1,timer=null,z=100;' +
    'function ready(fn){if(document.readyState!=="loading")fn();else document.addEventListener("DOMContentLoaded",fn);}' +
    'ready(function(){' +
    'var q=function(s){return document.querySelector(s);},qa=function(s){return Array.prototype.slice.call(document.querySelectorAll(s));};' +
    'try{var u=new URLSearchParams(location.search);if(u.get("theme")==="dark"||u.get("theme")==="light"){document.documentElement.dataset.theme=u.get("theme");}else if(localStorage.getItem("gr-theme")){document.documentElement.dataset.theme=localStorage.getItem("gr-theme");}}catch(e){}' +
    'q("#themeBtn").onclick=function(){var h=document.documentElement;h.dataset.theme=h.dataset.theme==="dark"?"light":"dark";try{localStorage.setItem("gr-theme",h.dataset.theme);}catch(e){}};' +
    'q("#presentBtn").onclick=function(){if(!document.fullscreenElement){document.documentElement.requestFullscreen().catch(function(){});}else{document.exitFullscreen();}document.body.classList.add("present");};' +
    'document.addEventListener("fullscreenchange",function(){if(!document.fullscreenElement)document.body.classList.remove("present");});' +
    'var menu=q("#exportMenu");q("#exportBtn").onclick=function(ev){ev.stopPropagation();menu.classList.toggle("open");};' +
    'document.addEventListener("click",function(){menu.classList.remove("open");});' +
    'function firstSvg(){var secs=qa(".canvas");for(var i=0;i<secs.length;i++){var r=secs[i].getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)return secs[i].querySelector("svg");}return document.querySelector(".canvas svg");}' +
    'function dl(name,blob){var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);}' +
    'menu.addEventListener("click",function(ev){var k=ev.target.getAttribute("data-x");if(!k)return;menu.classList.remove("open");' +
    'if(k==="print"){window.print();return;}' +
    'var s=firstSvg();var xml=new XMLSerializer().serializeToString(s);' +
    'if(k==="svg"){dl("flow-diagram.svg",new Blob([xml],{type:"image/svg+xml"}));return;}' +
    'if(k==="copy"){if(navigator.clipboard)navigator.clipboard.writeText(xml);}});' +
    'function setZ(n){z=Math.min(200,Math.max(50,n));q("#zpct").textContent=z+"%";qa(".zoomable").forEach(function(el){el.style.zoom=z+"%";});}' +
    'q("#zin").onclick=function(){setZ(z+25);};q("#zout").onclick=function(){setZ(z-25);};' +
    'q("#zall").onclick=function(){setZ(100);window.scrollTo({top:0,behavior:"smooth"});};' +
    'q("#ovhint").onclick=function(){setZ(100);window.scrollTo({top:0,behavior:"smooth"});};' +
    'qa(".ovnode").forEach(function(g){g.addEventListener("click",function(){stop();document.getElementById(g.getAttribute("data-sec")).scrollIntoView({behavior:"smooth",block:"center"});});});' +
    'function clearHot(){qa(".node.hot").forEach(function(e){e.classList.remove("hot");});qa(".node.dim").forEach(function(e){e.classList.remove("dim");});}' +
    'function show(i){clearHot();bi=i;var b=beats[i];var sec=document.getElementById(b.sec);' +
    'sec.scrollIntoView({block:"center",behavior:"smooth"});' +
    'sec.querySelectorAll(".node").forEach(function(e){e.classList.add("dim");});' +
    'var el=document.getElementById(b.node);if(el){el.classList.remove("dim");el.classList.add("hot");}' +
    'q("#beat").textContent="Beat "+(i+1)+" / "+beats.length+" — "+b.label;' +
    'q("#gcount").textContent="GUIDED TESTS "+(i+1)+" / "+beats.length;}' +
    'function stop(){if(timer){clearInterval(timer);timer=null;}q("#playBtn").textContent="▶ Play story";}' +
    'q("#playBtn").onclick=function(){if(timer){stop();return;}q("#playBtn").textContent="⏸ Pause";var i=(bi+1)%beats.length;show(i);timer=setInterval(function(){i=(i+1)%beats.length;show(i);},1600);};' +
    'qa(".chap").forEach(function(c){c.addEventListener("click",function(){stop();document.getElementById(c.getAttribute("data-sec")).scrollIntoView({behavior:"smooth",block:"center"});});});' +
    '});</script></body></html>';

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log('Flow OK: ' + tests.length + ' pruebas, ' + totalT + ' tareas, ' + totalQ + ' preguntas -> ' + OUT + '/index.html');
}

main();
