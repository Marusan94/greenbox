import { test } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// FLOW: graba cada paso Actor -> Task/Question -> Pagina en un JSON por test.
// Es el "camerino con espejo": ves el ensayo completo sin abrir el codigo.
// Cero cambios en los specs: Actor.attemptsTo/asks emiten aqui solos.

export type FlowEvent =
  | { seq: number; kind: 'task'; phase: 'start' | 'end'; name: string; ms?: number }
  | { seq: number; kind: 'question'; name: string; answer: string; ms: number };

interface Session {
  title: string;
  seq: number;
  events: FlowEvent[];
}

const DIR = 'flow';
const sessions = new Map<string, Session>();

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function current(): Session {
  const title = test.info().title; // funciona porque Actor solo se usa dentro del test
  let s = sessions.get(title);
  if (!s) {
    s = { title, seq: 0, events: [] };
    sessions.set(title, s);
  }
  return s;
}

function persist(s: Session): void {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DIR, `${slug(s.title)}.json`),
    JSON.stringify({ title: s.title, events: s.events }),
  );
}

// Envuelve una Task midiendo su duracion real.
export async function traceTask<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const s = current();
  s.events.push({ seq: ++s.seq, kind: 'task', phase: 'start', name });
  const t = Date.now();
  try {
    return await fn();
  } finally {
    s.events.push({ seq: ++s.seq, kind: 'task', phase: 'end', name, ms: Date.now() - t });
    persist(s);
  }
}

// Envuelve una Question guardando la respuesta (recortada, sin secretos: los labels nunca llevan credenciales).
export async function traceQuestion<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const s = current();
  const t = Date.now();
  const answer = await fn();
  const raw = typeof answer === 'string' ? answer : JSON.stringify(answer);
  s.events.push({ seq: ++s.seq, kind: 'question', name, answer: (raw ?? '').slice(0, 140), ms: Date.now() - t });
  persist(s);
  return answer;
}
