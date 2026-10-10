// Servidor estático del hub + proxy de chat IA (Gemini).
// Uso: node server.js  → abrir http://localhost:3000/flow-report/hub.html
// Lee GEMINI_API_KEY de ~/.env
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

function readKey() {
  try {
    const env = fs.readFileSync(path.join(require('node:os').homedir(), '.env'), 'utf8');
    const m = env.match(/^GEMINI_API_KEY=(.+)$/m);
    return m ? m[1].trim() : '';
  } catch (e) { return ''; }
}

function geminiChat(messages) {
  const key = readKey();
  if (!key) return Promise.resolve({ error: 'GEMINI_API_KEY no encontrada en ~/.env' });
  const body = JSON.stringify({ contents: messages });
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
  ).then((r) => r.json());
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/chat' && req.method === 'POST') {
    let buf = '';
    req.on('data', (c) => { buf += c; });
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(buf);
        if (!Array.isArray(messages) || !messages.length) throw new Error('messages requerido');
        geminiChat(messages).then((j) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(j));
        }).catch((e) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Gemini: ' + e.message }));
        });
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  let p = decodeURIComponent(url.pathname);
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  const file = path.join(ROOT, path.normalize(p).replace(/^([/\\])+/, ''));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('No encontrado'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Hub: http://localhost:${PORT}/flow-report/hub.html`);
  console.log(`IA:   POST /api/chat  (GEMINI_API_KEY ${readKey() ? 'OK' : 'FALTA'})`);
});
