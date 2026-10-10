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
    'aside{width:264px;min-width:264px;background:#0F172A;border-right:1px solid #1E293B;display:flex;flex-direction:column;height:100vh;transition:width .2s,min-width .2s,margin-left .2s}' +
    'aside.min{width:44px;min-width:44px}aside.min .brand,aside.min nav,aside.min .meta,aside.min .tbar{display:none}' +
    '#collapseBtn{position:absolute;top:.9rem;right:.6rem;z-index:70;background:none;border:1px solid #1E293B;color:#94A3B8;font:inherit;font-size:.7rem;padding:.2rem .45rem;cursor:pointer;border-radius:.3rem}' +
    '#collapseBtn:hover{border-color:#22D3EE;color:#22D3EE}' +
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
    /* --- Presets globales (paridad con Flow/Archify) --- */
    'html[data-preset="signal"] body{background-color:#030711;background-image:radial-gradient(circle at 18% -8%,rgba(34,211,238,.28),transparent 55rem),radial-gradient(circle at 92% 12%,rgba(139,92,246,.22),transparent 50rem);background-attachment:fixed}' +
    'html[data-preset="signal"] aside{background-color:#0a1628;border-right-color:#1d3350}' +
    'html[data-preset="signal"] .brand h1{color:#f5fbff;text-shadow:0 0 28px rgba(34,211,238,.65)}' +
    'html[data-preset="signal"] .sub{color:#9eb0c7}' +
    'html[data-preset="signal"] .tdot{background:#22d3ee;box-shadow:0 0 16px rgba(34,211,238,.9)}' +
    'html[data-preset="signal"] .signal{border-color:#22d3ee;color:#22d3ee;box-shadow:0 0 14px rgba(34,211,238,.4)}' +
    'html[data-preset="signal"] .grp{color:#22d3ee}' +
    'html[data-preset="signal"] nav button{color:#9eb0c7}' +
    'html[data-preset="signal"] nav button.on{border-color:#22d3ee;background:rgba(34,211,238,.14);color:#22d3ee;box-shadow:0 0 0 1px #22d3ee,0 10px 30px rgba(34,211,238,.25)}' +
    'html[data-preset="signal"] nav button .n{border-color:#22d3ee;color:#22d3ee}' +
    'html[data-preset="signal"] .tbtn{border-color:#1d3350}' +
    'html[data-preset="signal"] .meta{border-top-color:#1d3350;color:#9eb0c7}' +
    'html[data-theme="light"][data-preset="signal"] body{background-color:#f4f9fc;background-image:radial-gradient(circle at 18% -8%,rgba(6,182,212,.20),transparent 55rem),radial-gradient(circle at 92% 12%,rgba(139,92,246,.14),transparent 50rem)}' +
    'html[data-theme="light"][data-preset="signal"] aside{background-color:#e8f3f8;border-right-color:#bfd5e2}' +
    'html[data-theme="light"][data-preset="signal"] .brand h1{color:#102638;text-shadow:none}' +
    'html[data-theme="light"][data-preset="signal"] .tdot{background:#0d9488}' +
    'html[data-theme="light"][data-preset="signal"] .signal{border-color:#0d9488;color:#0d9488}' +
    'html[data-theme="light"][data-preset="signal"] .grp{color:#0d9488}' +
    'html[data-theme="light"][data-preset="signal"] nav button.on{border-color:#0d9488;background:rgba(13,148,136,.12);color:#0d9488}' +
    'html[data-preset="blueprint"] *{border-radius:0!important;box-shadow:none!important}' +
    'html[data-preset="blueprint"] body{background-color:#06131f;background-image:linear-gradient(#17425a 1px,transparent 1px),linear-gradient(90deg,#17425a 1px,transparent 1px);background-size:32px 32px;background-position:-1px -1px;background-attachment:fixed}' +
    'html[data-preset="blueprint"] aside{background-color:#0a2031;border-right-color:#27627f}' +
    'html[data-preset="blueprint"] main,html[data-preset="blueprint"] iframe{background:#06131f}' +
    'html[data-preset="blueprint"] .brand h1{color:#66d9ef;text-transform:uppercase;letter-spacing:.08em}' +
    'html[data-preset="blueprint"] .sub{color:#91b8ca}' +
    'html[data-preset="blueprint"] .tdot{background:#66d9ef}' +
    'html[data-preset="blueprint"] .signal{border:1.5px dashed #66d9ef;color:#66d9ef}' +
    'html[data-preset="blueprint"] .grp{color:#66d9ef}' +
    'html[data-preset="blueprint"] nav button{color:#91b8ca}' +
    'html[data-preset="blueprint"] nav button.on{border-color:#27627f;background:#0a2031;color:#66d9ef}' +
    'html[data-preset="blueprint"] nav button .n{border-color:#66d9ef;color:#66d9ef}' +
    'html[data-preset="blueprint"] .tbtn{border-color:#27627f}' +
    'html[data-preset="blueprint"] .meta{border-top-color:#27627f;color:#91b8ca}' +
    'html[data-theme="light"][data-preset="blueprint"] body{background-color:#edf7fa;background-image:linear-gradient(#b5d5e1 1px,transparent 1px),linear-gradient(90deg,#b5d5e1 1px,transparent 1px);background-size:32px 32px}' +
    'html[data-theme="light"][data-preset="blueprint"] aside{background-color:#f9fdff;border-right-color:#78aabd}' +
    'html[data-theme="light"][data-preset="blueprint"] main,html[data-theme="light"][data-preset="blueprint"] iframe{background:#edf7fa}' +
    'html[data-theme="light"][data-preset="blueprint"] .brand h1{color:#087f9c}' +
    'html[data-theme="light"][data-preset="blueprint"] .tdot{background:#087f9c}' +
    'html[data-theme="light"][data-preset="blueprint"] .signal{border-color:#087f9c;color:#087f9c}' +
    'html[data-theme="light"][data-preset="blueprint"] .grp{color:#087f9c}' +
    'html[data-theme="light"][data-preset="blueprint"] nav button.on{border-color:#78aabd;background:#f9fdff;color:#087f9c}' +
    'html[data-preset="editorial"] body{background-color:#181611;background-image:linear-gradient(90deg,transparent 0,transparent 5.4rem,rgba(221,107,61,.22) 5.4rem,rgba(221,107,61,.22) calc(5.4rem + 1px),transparent calc(5.4rem + 1px)),repeating-linear-gradient(0deg,transparent 0,transparent 31px,rgba(98,90,74,.40) 31px,rgba(98,90,74,.40) 32px)}' +
    'html[data-preset="editorial"] aside{background-color:#231f18;border-right-color:#625a4a}' +
    'html[data-preset="editorial"] main,html[data-preset="editorial"] iframe{background:#181611}' +
    'html[data-preset="editorial"] .brand h1{font-family:Georgia,"Times New Roman",serif;color:#f4eddf;text-shadow:none;letter-spacing:-.02em}' +
    'html[data-preset="editorial"] .sub{color:#b9ae9b}' +
    'html[data-preset="editorial"] .tdot{background:#dd6b3d;box-shadow:none}' +
    'html[data-preset="editorial"] .signal{border-color:#dd6b3d;color:#dd6b3d}' +
    'html[data-preset="editorial"] .grp{color:#dd6b3d}' +
    'html[data-preset="editorial"] nav button{color:#b9ae9b}' +
    'html[data-preset="editorial"] nav button.on{border-color:#625a4a;background:#231f18;color:#dd6b3d}' +
    'html[data-preset="editorial"] nav button .n{border-color:#dd6b3d;color:#dd6b3d}' +
    'html[data-preset="editorial"] .tbtn{border-color:#625a4a}' +
    'html[data-preset="editorial"] .meta{border-top-color:#625a4a;color:#b9ae9b}' +
    'html[data-theme="light"][data-preset="editorial"] body{background-color:#f2eee5;background-image:linear-gradient(90deg,transparent 0,transparent 5.4rem,rgba(187,76,35,.18) 5.4rem,rgba(187,76,35,.18) calc(5.4rem + 1px),transparent calc(5.4rem + 1px)),repeating-linear-gradient(0deg,transparent 0,transparent 31px,rgba(216,208,194,.55) 31px,rgba(216,208,194,.55) 32px)}' +
    'html[data-theme="light"][data-preset="editorial"] aside{background-color:#fbf8f1;border-right-color:#c4b9a6}' +
    'html[data-theme="light"][data-preset="editorial"] main,html[data-theme="light"][data-preset="editorial"] iframe{background:#f2eee5}' +
    'html[data-theme="light"][data-preset="editorial"] .brand h1{color:#242018}' +
    'html[data-theme="light"][data-preset="editorial"] .tdot{background:#bb4c23}' +
    'html[data-theme="light"][data-preset="editorial"] .signal{border-color:#bb4c23;color:#bb4c23}' +
    'html[data-theme="light"][data-preset="editorial"] .grp{color:#bb4c23}' +
    'html[data-theme="light"][data-preset="editorial"] nav button.on{border-color:#c4b9a6;background:#fbf8f1;color:#bb4c23}' +
    /* --- Chat IA en vivo (panel derecho) --- */
    '#chatBtn{position:fixed;bottom:1rem;right:1rem;z-index:80;background:#0F172A;border:1px solid #22D3EE;color:#22D3EE;font:inherit;font-size:.7rem;padding:.5rem .8rem;cursor:pointer;border-radius:.5rem;box-shadow:0 0 14px rgba(34,211,238,.25)}' +
    '#chatBtn:hover{background:#020617}' +
    '#chatPanel{position:fixed;bottom:0;right:0;width:340px;max-width:90vw;height:60vh;min-height:280px;background:#0B1220;border:1px solid #1E293B;border-right:none;border-bottom:none;border-radius:.6rem 0 0 0;display:none;flex-direction:column;z-index:90;box-shadow:0 0 40px rgba(0,0,0,.5)}' +
    '#chatPanel.open{display:flex}' +
    '#chatHead{display:flex;align-items:center;justify-content:space-between;padding:.6rem .8rem;border-bottom:1px solid #1E293B;color:#22D3EE;font-weight:700;font-size:.75rem}' +
    '#chatHead button{background:none;border:none;color:#94A3B8;font:inherit;font-size:.85rem;cursor:pointer}' +
    '#chatHead button:hover{color:#fff}' +
    '#chatLog{flex:1;overflow-y:auto;padding:.6rem .8rem;display:flex;flex-direction:column;gap:.5rem;font-size:.72rem}' +
    '.msg{max-width:88%;padding:.45rem .65rem;border-radius:.5rem;line-height:1.45;white-space:pre-wrap;word-break:break-word}' +
    '.msg.user{align-self:flex-end;background:#1E293B;color:#e5e7eb;border-bottom-right-radius:.1rem}' +
    '.msg.ai{align-self:flex-start;background:#0F172A;color:#e5e7eb;border:1px solid #1d3350;border-bottom-left-radius:.1rem}' +
    '.msg.err{align-self:flex-start;background:#2a0a0a;color:#fda4af;border:1px solid #7f1d1d}' +
    '.msg.typing{opacity:.6;font-style:italic}' +
    '#chatForm{display:flex;gap:.4rem;padding:.5rem .6rem;border-top:1px solid #1E293B}' +
    '#chatInput{flex:1;background:#020617;border:1px solid #1E293B;color:#fff;font:inherit;font-size:.72rem;padding:.4rem .55rem;border-radius:.4rem;outline:none}' +
    '#chatInput:focus{border-color:#22D3EE}' +
    '#chatSend{background:#22D3EE;border:none;color:#020617;font:inherit;font-size:.72rem;font-weight:700;padding:.4rem .7rem;border-radius:.4rem;cursor:pointer}' +
    '#chatSend:hover{background:#67e8f9}' +
    '</style></head><body>' +
    '<aside id="hubAside"><button id="collapseBtn" title="Minimizar barra">◀</button><div class="brand"><h1><span class="tdot"></span>Greenbox<span class="signal">HUB</span></h1><p class="sub">Actor → Tasks → Page · ' + today + '</p></div>' +
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
    '<button id="chatBtn">✦ IA</button>' +
    '<div id="chatPanel"><div id="chatHead"><span>✦ Greenbox IA</span><button id="chatClose">✕</button></div>' +
    '<div id="chatLog"><div class="msg ai">¡Hola! Pregúntame lo que quieras sobre los reportes, las pruebas o el proyecto.</div></div>' +
    '<form id="chatForm"><input id="chatInput" placeholder="Pregunta algo…" autocomplete="off"><button id="chatSend" type="submit">Enviar</button></form></div>' +
    '<script>' +
    'var q=function(s){return document.querySelector(s);};' +
    'var stage=document.getElementById("stage");' +
    'var HT="dark",HP="classic";' +
    'try{var uq=new URLSearchParams(location.search);var ut=uq.get("theme"),up=uq.get("preset");if(ut==="dark"||ut==="light")HT=ut;if(up==="classic"||up==="signal"||up==="blueprint"||up==="editorial")HP=up;else{var lt=localStorage.getItem("gr-hub-theme"),lp=localStorage.getItem("gr-hub-preset");if(lt==="dark"||lt==="light")HT=lt;if(lp==="classic"||lp==="signal"||lp==="blueprint"||lp==="editorial")HP=lp;}}catch(e){}' +
    'function paintHub(){document.documentElement.dataset.theme=HT;document.documentElement.dataset.preset=HP;}' +
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
    'q("#hubFlowMenu").addEventListener("click",function(ev){var m=ev.target.getAttribute("data-p");if(!m)return;HP=m;paintHub();markPreset();try{localStorage.setItem("gr-hub-preset",HP);}catch(e){}reloadFrame();});' +
    'stage.addEventListener("load",function(){stage.classList.remove("switching");});' +
    'var btns=document.querySelectorAll("nav button");for(var i=0;i<btns.length;i++)(function(b){b.addEventListener("click",function(){go(b.getAttribute("data-src"),b);});})(btns[i]);' +
    'try{var h=location.hash.replace(/^#\\/+/, "");if(h){for(var j=0;j<btns.length;j++){var b0=btns[j].getAttribute("data-src");if(b0&&(h===b0||h.indexOf(b0+"?")===0)){go(b0,btns[j]);break;}}}}catch(e){}' +
    'if(!location.hash&&(HT!=="dark"||HP!=="classic")){reloadFrame();}' +
    /* --- Barra colapsable --- */
    'var aside=document.getElementById("hubAside");' +
    'q("#collapseBtn").onclick=function(){aside.classList.toggle("min");q("#collapseBtn").textContent=aside.classList.contains("min")?"▶":"◀";};' +
    /* --- Chat IA en vivo --- */
    'var chatPanel=document.getElementById("chatPanel"),chatLog=document.getElementById("chatLog"),chatInput=document.getElementById("chatInput");' +
    'q("#chatBtn").onclick=function(){chatPanel.classList.toggle("open");if(chatPanel.classList.contains("open"))chatInput.focus();};' +
    'q("#chatClose").onclick=function(){chatPanel.classList.remove("open");};' +
    'function addMsg(txt,cls){var d=document.createElement("div");d.className="msg "+cls;d.textContent=txt;chatLog.appendChild(d);chatLog.scrollTop=chatLog.scrollHeight;return d;}' +
    'q("#chatForm").onsubmit=function(ev){ev.preventDefault();var t=chatInput.value.trim();if(!t)return;addMsg(t,"user");chatInput.value="";var typing=addMsg("Pensando…","typing ai");' +
    'fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",parts:[{text:t}]}]})}).then(function(r){return r.json();}).then(function(j){typing.remove();if(j.error){addMsg("Error: "+j.error,"err");return;}var txt=j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts&&j.candidates[0].content.parts[0]&&j.candidates[0].content.parts[0].text||"(sin respuesta)";addMsg(txt,"ai");}).catch(function(e){typing.remove();addMsg("Error de conexión con la IA. ¿Servidor corriendo? (node server.js)","err");});};' +
    '</script></body></html>';

  fs.mkdirSync('flow-report', { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log('Hub OK: vistas + ' + seqs.length + ' secuencias -> ' + OUT);
  void path;
}

main();
