// Propaga el preset global del hub (Classic / Signal Flow / Blueprint /
// Editorial) a las vistas de Archify. El visor Archify ya trae los 4
// presets nativos (`Archify.preset.apply`) y su CSS responde a
// html[data-preset] y svg[data-preset], pero solo lee `?theme=` de la URL.
// Este script inyecta un lector de `?preset=` en cada flow-report/archify/*.html.
// Idempotente (marcador data-gr-presets) y sin dependencias.
// Uso: node scripts/room-presets.js   (tras generar las vistas Archify)
const fs = require('node:fs');
const path = require('node:path');

const DIR = 'flow-report/archify';
const MARK = 'gr-presets';

// El hub nombra el preset "signal"; Archify lo llama "signal-flow".
const BOOTSTRAP =
  '<script data-' + MARK + '>(function(){' +
  'var M={classic:"classic",signal:"signal-flow","signal-flow":"signal-flow",blueprint:"blueprint",editorial:"editorial"};' +
  'function go(){try{' +
  'var p=M[new URLSearchParams(location.search).get("preset")];if(!p)return;' +
  'var h=document.documentElement;h.setAttribute("data-preset",p);' +
  'var svg=document.querySelector(".diagram-container svg");if(svg)svg.setAttribute("data-preset",p);' +
  'if(window.Archify&&Archify.preset&&typeof Archify.preset.apply==="function")Archify.preset.apply(p);' +
  '}catch(e){}}' +
  'go();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",go);' +
  '})();</script>';

function main() {
  if (!fs.existsSync(DIR)) {
    console.log('Sin vistas Archify en ' + DIR + ': genera primero con el CLI archify.');
    process.exit(1);
  }
  let n = 0;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.html'))) {
    const p = path.join(DIR, f);
    let html = fs.readFileSync(p, 'utf8');
    // Limpia inyecciones previas (idempotente).
    html = html.replace(new RegExp('<script data-' + MARK + '>[\\s\\S]*?</script>', 'g'), '');
    if (!html.includes('</body>')) continue;
    if (!html.includes('Archify.preset')) continue; // solo vistas del visor Archify
    html = html.replace('</body>', BOOTSTRAP + '</body>');
    fs.writeFileSync(p, html);
    n += 1;
  }
  console.log('Room presets OK: ' + n + ' vistas Archify -> ' + DIR);
}

main();
