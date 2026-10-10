// Inyecta assets/serenity-skin.css (+ JetBrains Mono) en cada HTML del
// reporte Serenity BDD. Idempotente (marcador gr-skin). Se corre tras
// `serenity-bdd run` via `npm run test:serenity:report`.
const fs = require('node:fs');
const path = require('node:path');

const DIR = 'target/site/serenity';
const CSS = 'serenity-skin.css';
const MARK = 'gr-skin';
const FONT =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">';

function main() {
  if (!fs.existsSync(DIR)) {
    console.log('Sin reporte: corre antes test:serenity + serenity-bdd run.');
    process.exit(1);
  }
  fs.copyFileSync(path.join('assets', CSS), path.join(DIR, CSS));
  // Lee de la URL el tema (?theme=) y el preset global del hub (?preset=),
  // que Serenity hereda para paridad visual con el resto de salas.
  const themeInit =
    '<script data-gr-theme>try{var __q=new URLSearchParams(location.search),' +
    '__t=__q.get("theme"),__p=__q.get("preset");' +
    'document.documentElement.dataset.theme=(__t==="light"?"light":"dark");' +
    'if(__p==="classic"||__p==="signal"||__p==="blueprint"||__p==="editorial")' +
    'document.documentElement.dataset.preset=__p;}catch(e){}</script>';
  const tag = FONT + themeInit + '<link rel="stylesheet" href="' + CSS + '" data-' + MARK + '>';
  let n = 0;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.html'))) {
    const p = path.join(DIR, f);
    let html = fs.readFileSync(p, 'utf8');
    // Limpia inyecciones previas y aplica el bundle fresco (css + tema + preset).
    html = html.replace(/<link[^>]*data-gr-skin[^>]*>/g, '');
    html = html.replace(/<script data-gr-theme>[\s\S]*?<\/script>/g, '');
    if (!html.includes('</head>')) continue;
    html = html.replace('</head>', tag + '</head>');
    fs.writeFileSync(p, html);
    n += 1;
  }
  console.log('Skin OK: ' + n + ' HTML vestidos -> ' + DIR + '/' + CSS);
}

main();
