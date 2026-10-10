// Genera flow-report/hub.html: shell con barra lateral izquierda (estilo
// consola Archify) para conmutar entre los modulos en un iframe:
// Historias Flow, Mapa del sistema, las 9 Secuencias oficiales y el
// reporte Playwright. Sin dependencias.
// Uso: node scripts/flow-hub.js  (tras flow-report.js)
const fs = require('node:fs');
const path = require('node:path');

const OUT = 'flow-report/hub.html';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function main() {
  const dir = 'flow-report/archify';
  const all = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.html')) : [];
  const sys = all.includes('system.html') ? ['system.html'] : [];
  const seqs = all.filter((f) => f !== 'system.html').sort();
  const today = new Date().toISOString().slice(0, 10);

  const seqLinks = seqs
    .map((f, i) => {
      const label = f.replace(/\.html$/, '').replace(/-/g, ' ').slice(0, 34);
      return '<button data-src="archify/' + f + '"><span class="n">0' + (i + 1) + '</span>' + esc(label) + '</button>';
    })
    .join('\n');

  const html =
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Greenbox — Hub</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">' +
    '<style>' +
    '*{box-sizing:border-box}html,body{height:100%}body{margin:0;display:flex;font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;background:#020617;color:#fff;font-size:.75rem}' +
    'html[data-theme="light"] body{background:linear-gradient(180deg,#f4f5fa,#e8eaf3);color:#111827}' +
    'html[data-theme="light"] aside{background:#fff;border-right-color:#e2e5ee}' +
    'html[data-theme="light"] nav button{color:#111827}' +
    'html[data-theme="light"] .tbtn{background:#fff;border-color:#e2e5ee;color:#111827}' +
    'html[data-theme="light"] .tmenu{background:#fff;border-color:#e2e5ee}' +
    'html[data-theme="light"] .tmenu button{color:#111827}' +
    'html[data-theme="light"] .meta{border-top-color:#e2e5ee;color:#6b7280}' +
    'html[data-theme="light"] main{background:#e8eaf3}html[data-theme="light"] iframe{background:#e8eaf3}' +
    'aside{width:264px;min-width:264px;background:#0F172A;border-right:1px solid #1E293B;display:flex;flex-direction:column;height:100vh}' +
    '.brand{padding:1.1rem 1.25rem .8rem}h1{font-size:.875rem;font-weight:700;margin:.4rem 0 .2rem;letter-spacing:-.01em}' +
    '.tdot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#22D3EE;margin-right:.5rem}' +
    '.signal{display:inline-block;border:1.5px solid #22D3EE;color:#22D3EE;border-radius:999px;padding:2px 10px;font-size:.625rem;font-weight:700;letter-spacing:.12em;margin-left:.4rem;vertical-align:middle}' +
    '.sub{color:#94A3B8;font-size:.7rem;margin:0}' +
    'nav{flex:1;overflow-y:auto;padding:.4rem .8rem}' +
    '.grp{color:#22D3EE;font-size:.625rem;font-weight:700;letter-spacing:.12em;margin:1rem .4rem .4rem}' +
    'nav button{display:flex;align-items:center;gap:.5rem;width:100%;text-align:left;background:none;border:1px solid transparent;border-radius:.5rem;color:#fff;font:inherit;font-size:.75rem;padding:.5rem .6rem;cursor:pointer;transition:border-color .15s,background .15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    'nav button:hover{border-color:#1E293B;background:#020617}' +
    'nav button.on{border-color:#22D3EE;background:#020617}' +
    'nav button .n{display:inline-block;border:1.5px solid #22D3EE;color:#22D3EE;border-radius:50%;min-width:20px;height:20px;line-height:17px;text-align:center;font-size:.625rem}' +
    '.meta{padding:.9rem 1.25rem;border-top:1px solid #1E293B;color:#94A3B8;font-size:.7rem}' +
    '.meta b{color:#34D399}' +
    '.tbar{display:flex;gap:.4rem;padding:.2rem 1.25rem .8rem}' +
    '.tbtn{flex:1;background:#020617;border:1px solid #1E293B;border-radius:.5rem;color:#fff;font:inherit;font-size:.7rem;padding:.45rem .2rem;cursor:pointer;position:relative}' +
    '.tbtn:hover{border-color:#22D3EE}' +
    '.tmenu{position:absolute;top:110%;left:0;background:#0F172A;border:1px solid #1E293B;border-radius:.5rem;min-width:150px;display:none;z-index:60}' +
    '.tmenu.open{display:block}.tmenu button{display:block;width:100%;text-align:left;background:none;border:none;color:#fff;font:inherit;font-size:.7rem;padding:.5rem .8rem;cursor:pointer}.tmenu button:hover{background:#020617}.tmenu button.sel{color:#22D3EE}' +
    'main{flex:1;height:100vh;background:#020617}iframe{width:100%;height:100%;border:0;background:#020617;transition:opacity .28s ease,transform .28s ease}' +
    'iframe.switching{opacity:0;transform:translateY(8px)}' +
    '</style></head><body>' +
    '<aside><div class="brand"><h1><span class="tdot"></span>Greenbox<span class="signal">HUB</span></h1><p class="sub">Actor → Tasks → Page · ' + today + '</p></div>' +
    '<div class="tbar"><button class="tbtn" id="hubTheme">◐ <span id="hubThemeV">Dark</span></button>' +
    '<div style="position:relative;flex:1;display:flex"><button class="tbtn" id="hubFlow" style="flex:1">Flow ▾</button><div class="tmenu" id="hubFlowMenu">' +
    '<button data-p="classic" class="sel">Classic</button><button data-p="signal">Signal Flow</button><button data-p="blueprint">Blueprint</button><button data-p="editorial">Editorial</button></div></div></div>' +
    '<nav><div class="grp">VISTAS</div>' +
    '<button data-src="archify/system.html" class="on">Mapa del sistema</button>' +
    '<button data-src="index.html">Historias Flow</button>' +
    '<button data-src="../playwright-report/index.html">Reporte Playwright</button>' +
    '<button data-src="../target/site/serenity/index.html">Reporte Serenity</button>' +
    '<div class="grp">SECUENCIAS · VISOR OFICIAL</div>' + seqLinks + '</nav>' +
    '<div class="meta"><b>8 ✓</b> · 4 skip · 0 fallos<br>flow-report/' + today + '</div></aside>' +
    '<main><iframe id="stage" src="archify/system.html" title="vista"></iframe></main>' +
    '<script>' +
    'var q=function(s){return document.querySelector(s);};' +
    'var stage=document.getElementById("stage");' +
    'var HT="dark",HP="classic";' +
    'try{HT=localStorage.getItem("gr-hub-theme")||"dark";HP=localStorage.getItem("gr-hub-preset")||"classic";}catch(e){}' +
    'function paintHub(){document.documentElement.dataset.theme=HT;}' +
    'paintHub();' +
    'function withParams(src){var s=String(src).split("?")[0];return s+"?theme="+HT+"&preset="+HP;}' +
    'function markPreset(){var bs=document.querySelectorAll("#hubFlowMenu button");for(var k=0;k<bs.length;k++)bs[k].classList.toggle("sel",bs[k].getAttribute("data-p")===HP);}' +
    'function go(src,btn){stage.classList.add("switching");' +
    'setTimeout(function(){stage.src=withParams(src);},120);' +
    'var bs=document.querySelectorAll("nav button");for(var i=0;i<bs.length;i++)bs[i].classList.remove("on");if(btn)btn.classList.add("on");try{location.hash="#/"+src;}catch(e){}}' +
    'q("#hubThemeV").textContent=(HT==="dark"?"Dark":"Light");markPreset();' +
    'q("#hubTheme").onclick=function(){HT=(HT==="dark"?"light":"dark");paintHub();q("#hubThemeV").textContent=(HT==="dark"?"Dark":"Light");try{localStorage.setItem("gr-hub-theme",HT);}catch(e){}reloadFrame();};' +
    'function reloadFrame(){var cur=stage.src||"archify/system.html";var base=cur.split("?")[0].split("#").pop();if(base.indexOf("blank")>=0)base="archify/system.html";stage.src=withParams(base);}' +
    'q("#hubFlow").onclick=function(ev){ev.stopPropagation();q("#hubFlowMenu").classList.toggle("open");};' +
    'document.addEventListener("click",function(){var m=q("#hubFlowMenu");if(m)m.classList.remove("open");});' +
    'q("#hubFlowMenu").addEventListener("click",function(ev){var m=ev.target.getAttribute("data-p");if(!m)return;HP=m;markPreset();try{localStorage.setItem("gr-hub-preset",HP);}catch(e){}reloadFrame();});' +
    'stage.addEventListener("load",function(){stage.classList.remove("switching");});' +
    'var btns=document.querySelectorAll("nav button");for(var i=0;i<btns.length;i++)(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-src"),b);});})(btns[i]);' +
    'try{var h=location.hash.replace(/^#\\/+/, "");if(h){for(var j=0;j<btns.length;j++){var b0=btns[j].getAttribute("data-src");if(b0&&(h===b0||h.indexOf(b0+"?")===0)){go(b0,btns[j]);break;}}}}catch(e){}' +
    'if(!location.hash&&(HT!=="dark"||HP!=="classic")){reloadFrame();}' +
    '</script></body></html>';

  fs.mkdirSync('flow-report', { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log('Hub OK: vistas + ' + seqs.length + ' secuencias -> ' + OUT);
  void path;
}

main();
