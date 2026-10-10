// Serverless function: /api/chat — proxy a Gemini
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

function readKey() {
  try {
    const env = fs.readFileSync(path.join(os.homedir(), '.env'), 'utf8');
    const m = env.match(/^GEMINI_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch (e) {}
  return process.env.GEMINI_API_KEY || '';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const key = readKey();
  if (!key) {
    res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    return;
  }
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      res.status(400).json({ error: 'messages requerido' });
      return;
    }
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: messages }) }
    );
    const j = await r.json();
    res.status(200).json(j);
  } catch (e) {
    res.status(502).json({ error: 'Gemini: ' + e.message });
  }
}
