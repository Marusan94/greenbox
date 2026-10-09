// Genera flow-report/index.html clonando el lenguaje visual de la pagina de
// arquitectura de Terramind (estilo blueprint claro): fondo lavanda, tarjetas
// blancas, planos con borde ambar punteado, nodos mono con borde de color,
// leyenda con conteos, barra de vistas guiadas con Play story funcional.
// Sin dependencias: todo inline (CSS + SVG + JS).
const fs = require('node:fs');
const path = require('node:path');

const IN = 'flow';
const OUT = 'flow-report';

// ---- tokens del diseño de referencia ----
const C = {
  bg1: '#f4f5fa',
  bg2: '#e8eaf3',
  card: '#ffffff',
  ink: '#111827',
  mute: '#6b7280',
  teal: '#0d9488',
  green: '#16a34a',
  purple: '#9333ea',
  amber: '#b45309',
  line: '#e2e5ee',
};

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

// Colapsa eventos (task start/end, question) en nodos dibujables.
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

// Tira de nodos estilo blueprint: tarjetas blancas con borde de color,
// flechas con etiquetas mono (ms / respuesta), plano ambar punteado.
function strip(nodes, uid) {
  const W = 900;
  const CW = 250;
  const CH = 78;
  const GAP = 60;
  const PER = 3;
  const rows = Math.max(1, Math.ceil(nodes.length / PER));
  const top = 64;
  const rowH = 150;
  const H = top + rows * rowH + 56;
  const pos = (i) => ({ x: 20 + (i % PER) * (CW + GAP), y: top + Math.floor(i / PER) * rowH });
  let s = `<defs><pattern id="dots${uid}" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#e3e6f0"/></pattern></defs>`;
  s += `<rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="url(#dots${uid})"/>`;
  // plano
  s += `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="10" fill="none" stroke="${C.amber}" stroke-width="1.5" stroke-dasharray="7,5" opacity="0.75"/>`;
  s += `<text x="24" y="34" font-family="ui-monospace,monospace" font-size="11" fill="${C.amber}" letter-spacing="1">TEST PLANE (SCREENPLAY)</text>`;
  const color = (k) => (k === 'task' ? C.teal : C.green);
  nodes.forEach((n, i) => {
    const { x, y } = pos(i);
    const c = color(n.kind);
    const lines = wrap2(n.name);
    s += `<g id="n${uid}_${i}" class="node">`;
    s += `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="10" fill="#fff" stroke="${c}" stroke-width="2"/>`;
    s += `<rect x="${x + 10}" y="${y + 10}" width="18" height="18" rx="4" fill="${c}"/>`;
    s += `<text x="${x + 19}" y="${y + 23}" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff">${n.kind === 'task' ? 'T' : '?'}</text>`;
    s += `<text x="${x + CW / 2 + 8}" y="${y + 26}" text-anchor="middle" font-size="12" font-weight="bold" fill="${C.ink}">${esc(trunc(lines[0], 26))}</text>`;
    if (lines[1])
      s += `<text x="${x + CW / 2 + 8}" y="${y + 42}" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace" fill="${C.mute}">${esc(trunc(lines[1], 28))}</text>`;
    const sub = n.kind === 'task' ? `✔ ${n.ms} ms` : `= ${trunc(n.answer, 24)}`;
    s += `<text x="${x + CW / 2}" y="${y + (lines[1] ? 60 : 56)}" text-anchor="middle" font-size="11" font-family="ui-monospace,monospace" fill="${n.kind === 'task' ? C.teal : C.purple}">${esc(sub)}</text>`;
    s += `</g>`;
    // flecha al siguiente
    if (i < nodes.length - 1) {
      const q = pos(i + 1);
      const sameRow = Math.floor(i / PER) === Math.floor((i + 1) / PER);
      const lbl = n.kind === 'task' ? `${n.ms} ms` : 'next';
      if (sameRow) {
        const x1 = x + CW;
        const x2 = q.x;
        const ym = y + CH / 2;
        s += `<line x1="${x1}" y1="${ym}" x2="${x2}" y2="${ym}" stroke="${C.teal}" stroke-width="2"/>`;
        s += `<polygon points="${x2 - 9},${ym - 4} ${x2},${ym} ${x2 - 9},${ym + 4}" fill="${C.teal}"/>`;
        s += `<text x="${(x1 + x2) / 2}" y="${ym - 8}" text-anchor="middle" font-size="10" font-family="ui-monospace,monospace" fill="#dc2626">${esc(lbl)}</text>`;
      } else {
        const x1 = x + CW / 2;
        const y1 = y + CH;
        const x2 = q.x + CW / 2;
        const y2 = q.y;
        const mid = y1 + (y2 - y1) / 2;
        s += `<polyline points="${x1},${y1} ${x1},${mid} ${x2},${mid} ${x2},${y2}" fill="none" stroke="${C.teal}" stroke-width="2"/>`;
        s += `<polygon points="${x2 - 4},${y2 - 9} ${x2},${y2} ${x2 + 4},${y2 - 9}" fill="${C.teal}"/>`;
        s += `<text x="${(x1 + x2) / 2}" y="${mid - 8}" text-anchor="middle" font-size="10" font-family="ui-monospace,monospace" fill="#dc2626">${esc(lbl)}</text>`;
      }
    }
  });
  // leyenda
  const ly = H - 34;
  const chip = (x, color, label) =>
    `<rect x="${x}" y="${ly - 14}" width="14" height="10" rx="3" fill="none" stroke="${color}" stroke-width="2"/><text x="${x + 20}" y="${ly - 4}" font-size="11" font-family="ui-monospace,monospace" fill="${C.mute}">${label}</text>`;
  s += `<text x="24" y="${ly - 22}" font-size="12" font-weight="bold" fill="${C.ink}">Legend</text>`;
  s += chip(24, C.teal, 'Tarea');
  s += chip(110, C.green, 'Pregunta');
  s += chip(220, C.purple, 'Respuesta');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">${s}</svg>`;
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
  const tests = files.map((f, i) => {
    const t = JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8'));
    const nodes = toNodes(t.events);
    const ms = nodes.reduce((a, n) => a + (n.ms || 0), 0);
    const tq = nodes.filter((n) => n.kind === 'task').length;
    const qq = nodes.filter((n) => n.kind === 'question').length;
    return { i, title: t.title, nodes, ms, tq, qq };
  });
  const totalT = tests.reduce((a, t) => a + t.tq, 0);
  const totalQ = tests.reduce((a, t) => a + t.qq, 0);
  const totalMs = tests.reduce((a, t) => a + t.ms, 0);
  const today = new Date().toISOString().slice(0, 10);

  const chapters = tests
    .map(
      (t) =>
        `<button class="chap" data-sec="sec${t.i}"><span class="n">0${t.i + 1}</span> ${esc(trunc(t.title.replace(/ @\w+/g, ''), 30))}</button>`,
    )
    .join('');

  const sections = tests
    .map(
      (t) => `<section class="canvas" id="sec${t.i}">
      <h2>${esc(t.title)}</h2>
      <p class="sub">Data flow: Actor → Tasks → Page · ${t.tq} tareas · ${t.qq} preguntas · ${t.ms} ms en pasos</p>
      ${strip(t.nodes, t.i)}
    </section>`,
    )
    .join('\n');

  const dots = ['#0d9488', '#16a34a', '#9333ea', '#b45309'];
  const cards = tests
    .map(
      (t, k) => `<div class="note"><p class="nt"><span class="dot" style="background:${dots[k % 4]}"></span>${esc(t.title)}</p>
      <ul><li>${t.tq} tareas trazadas con duración real</li><li>${t.qq} preguntas con respuesta visible</li><li>${t.ms} ms acumulados en pasos</li></ul></div>`,
    )
    .join('');

  // beats para Play story: cada nodo de cada test, en orden
  const beats = [];
  tests.forEach((t) => t.nodes.forEach((n, j) => beats.push({ sec: `sec${t.i}`, node: `n${t.i}_${j}`, label: `${t.title} — ${n.kind === 'task' ? '▶' : '?'} ${n.name}` })));

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Greenroom QA — Flow</title>
<style>
*{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(180deg,${C.bg1},${C.bg2});color:${C.ink};max-width:1060px;margin:0 auto;padding:28px 22px 60px}
.mono{font-family:ui-monospace,SFMono-Regular,monospace}
header.top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}
h1{font-size:30px;margin:6px 0 4px}.tdot{display:inline-block;width:12px;height:12px;border-radius:50%;background:${C.teal};margin-right:10px}
.signal{display:inline-block;border:1.5px solid ${C.teal};color:${C.teal};border-radius:999px;padding:3px 14px;font-size:11px;letter-spacing:2px;font-family:ui-monospace,monospace;margin-left:8px;vertical-align:middle}
.sub{color:${C.mute};font-family:ui-monospace,monospace;font-size:13px;margin:4px 0 0}
.pills{display:flex;gap:10px}.pill{background:#fff;border:1px solid ${C.line};border-radius:999px;padding:8px 16px;font-size:13px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.05)}.pill:hover{border-color:${C.teal}}.pill.live{border-color:${C.teal}}.pill .d{display:inline-block;width:8px;height:8px;border-radius:50%;background:${C.teal};margin-right:7px}
.guide{background:#fff;border:1px solid ${C.line};border-radius:14px;padding:14px 18px;margin:20px 0;display:flex;gap:18px;align-items:center;flex-wrap:wrap;box-shadow:0 1px 3px rgba(0,0,0,.05)}
.guide small{color:${C.teal};font-family:ui-monospace,monospace;letter-spacing:1px;font-size:11px}.guide b{font-size:15px}.play{color:${C.teal};font-weight:bold;border:none;background:none;font-size:14px;cursor:pointer}
.chaps{display:flex;gap:8px;flex-wrap:wrap}.chap{background:#f6f7fb;border:1px solid ${C.line};border-radius:999px;padding:6px 14px;font-size:12px;cursor:pointer}.chap .n{display:inline-block;border:1.5px solid ${C.teal};color:${C.teal};border-radius:50%;width:20px;height:20px;line-height:17px;text-align:center;font-size:10px;margin-right:6px}
#beat{font-family:ui-monospace,monospace;font-size:12px;color:${C.mute}}
.canvas{background:#fff;border:1px solid ${C.line};border-radius:18px;padding:22px;margin:22px 0;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.canvas h2{margin:0 0 2px;font-size:21px}.canvas .sub{margin-bottom:12px}
.notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin-top:8px}
.note{background:#fff;border:1px solid ${C.line};border-radius:14px;padding:14px 16px}.note .nt{font-weight:bold;font-size:14px;margin:0 0 8px}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}.note ul{margin:0;padding-left:18px;font-family:ui-monospace,monospace;font-size:12px;color:${C.mute}}.node{transition:opacity .3s}.node.dim{opacity:.25}.node.hot rect:first-child{stroke-width:4}
@media print{.pills,.guide{display:none}body{background:#fff}}
</style></head><body>
<header class="top"><div><h1><span class="tdot"></span>Greenroom QA — Flow<span class="signal">SCREENPLAY FLOW</span></h1>
<p class="sub">Data flow: Actor → Tasks → Page · ${tests.length} pruebas · ${today}</p></div>
<div class="pills"><button class="pill live"><span class="d"></span>Live</button><button class="pill" onclick="window.print()">⤓ Export</button></div></header>
<div class="guide"><div><small id="gcount">GUIDED TESTS 0 / ${tests.length}</small><br><b>Explore this run</b> <button class="play" id="playBtn">▶ Play story</button><div id="beat">Pulsa Play para recorrer cada paso.</div></div><div class="chaps">${chapters}</div></div>
${sections}
<div class="notes">${cards}</div>
<script>
const beats=${JSON.stringify(beats)};
let bi=-1,timer=null;
function clearHot(){document.querySelectorAll('.node.hot').forEach(e=>e.classList.remove('hot'));document.querySelectorAll('.node.dim').forEach(e=>e.classList.remove('dim'));}
function show(i){
  clearHot();bi=i;const b=beats[i];
  document.getElementById('sec'+b.sec.replace('sec','')).scrollIntoView({block:'center',behavior:'smooth'});
  const sec=document.getElementById(b.sec);
  sec.querySelectorAll('.node').forEach(e=>e.classList.add('dim'));
  const el=document.getElementById(b.node);el.classList.remove('dim');el.classList.add('hot');
  document.getElementById('beat').textContent='Beat '+(i+1)+' / '+beats.length+' — '+b.label;
  document.getElementById('gcount').textContent='GUIDED TESTS '+(i+1)+' / '+beats.length;
}
function stop(){if(timer){clearInterval(timer);timer=null;}document.getElementById('playBtn').textContent='▶ Play story';}
document.getElementById('playBtn').onclick=()=>{
  if(timer){stop();return;}
  document.getElementById('playBtn').textContent='⏸ Pause';
  let i=(bi+1)%beats.length;show(i);
  timer=setInterval(()=>{i=(i+1)%beats.length;show(i);},1600);
};
document.querySelectorAll('.chap').forEach(c=>c.onclick=()=>{stop();document.getElementById(c.dataset.sec).scrollIntoView({behavior:'smooth'});});
</script></body></html>`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'index.html'), html);
  console.log(`Flow OK: ${tests.length} pruebas, ${totalT} tareas, ${totalQ} preguntas -> ${OUT}/index.html`);
}

main();
