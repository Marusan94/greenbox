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
  const tag = FONT + '<link rel="stylesheet" href="' + CSS + '" data-' + MARK + '>';
  let n = 0;
  for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.html'))) {
    const p = path.join(DIR, f);
    let html = fs.readFileSync(p, 'utf8');
    if (html.includes('data-' + MARK)) continue;
    if (!html.includes('</head>')) continue;
    html = html.replace('</head>', tag + '</head>');
    fs.writeFileSync(p, html);
    n += 1;
  }
  console.log('Skin OK: ' + n + ' HTML vestidos -> ' + DIR + '/' + CSS);
}

main();
