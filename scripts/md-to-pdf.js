// Convierte un Markdown a PDF A4 con estilo de documento.
// Uso: node scripts/md-to-pdf.js docs/SCREENPLAY_STANDARD.md docs/SCREENPLAY_STANDARD.pdf
const fs = require('node:fs');
const { chromium } = require('@playwright/test');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inCode = false;
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (/^```/.test(line)) {
      html += inCode ? '</pre>' : '<pre>';
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      html += esc(raw) + '\n';
      continue;
    }
    if (/^---+$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<hr>';
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h' + h[1].length + '>' + inline(h[2]) + '</h' + h[1].length + '>';
      continue;
    }
    if (/^>\s?/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<blockquote>' + inline(line.replace(/^>\s?/, '')) + '</blockquote>';
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + inline(line.replace(/^[-*]\s+/, '')) + '</li>';
      continue;
    }
    if (/^\s*$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    html += '<p>' + inline(line) + '</p>';
  }
  if (inList) html += '</ul>';
  if (inCode) html += '</pre>';
  return html;
}

(async () => {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) {
    console.log('Uso: node scripts/md-to-pdf.js <entrada.md> <salida.pdf>');
    process.exit(1);
  }
  const md = fs.readFileSync(input, 'utf8');
  const m = md.match(/^#\s+(.*)/m);
  const title = m ? m[1] : 'Documento';
  const body = mdToHtml(md);
  const doc =
    '<!doctype html><html lang="es"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
    '<style>@page{size:A4;margin:22mm 18mm}body{font-family:Georgia,"Times New Roman",serif;color:#111;line-height:1.65;font-size:11.5pt}' +
    'h1{font-size:22pt;border-bottom:2px solid #111;padding-bottom:6pt}h2{font-size:15pt;margin-top:26pt;color:#0d2137;page-break-before:auto}' +
    'h1,h2,h3{font-family:system-ui,-apple-system,sans-serif}' +
    'code{background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:10pt}' +
    'pre{background:#0f172a;color:#e5e7eb;padding:12pt;border-radius:8pt;font-size:9.5pt;overflow-x:auto;white-space:pre-wrap}' +
    'blockquote{border-left:3px solid #0d9488;margin:12pt 0;padding:6pt 12pt;color:#334155;background:#f0fdfa}' +
    'ul{padding-left:20pt}li{margin-bottom:4pt}hr{border:none;border-top:1px solid #cbd5e1;margin:18pt 0}' +
    'h2{page-break-before:always}h2:first-of-type{page-break-before:avoid}</style></head>' +
    '<body>' + body + '</body></html>';
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(doc, { waitUntil: 'load' });
  await p.pdf({ path: output, format: 'A4', printBackground: true });
  await b.close();
  const kb = Math.round(fs.statSync(output).size / 1024);
  console.log('PDF OK: ' + output + ' (' + kb + ' KB)');
})().catch((e) => {
  console.error(String(e).slice(0, 300));
  process.exit(1);
});
