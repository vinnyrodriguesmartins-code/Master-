// Núcleo do RAG: cliente Gemini, coleta de arquivos, chunking, embeddings e vector store local (JSON)
import settings from '../config.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

export const ROOT = process.cwd();
export const INDEX_FILE = path.join(ROOT, 'ai', '.index', 'vectors.json');
export const REPORTS_DIR = path.join(ROOT, 'ai-reports');

export const EMBED_MODEL = settings.ai.embedModel;
export const CHAT_MODEL = settings.ai.chatModel;

let _client;
export function client() {
    if (!settings.ai.apiKey) {
        throw new Error('GEMINI_API_KEY não definida. Crie um arquivo .env (veja .env.example).');
    }
    return (_client ??= new GoogleGenAI({ apiKey: settings.ai.apiKey }));
}

// ---------- Coleta de fontes ----------
const SOURCE_DIRS = ['test', 'scripts'];
const SOURCE_FILES = ['README.md', 'wdio.conf.js', 'package.json', '.gitlab-ci.yml'];
const EXT = new Set(['.js', '.md', '.json', '.yml', '.yaml']);

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (EXT.has(path.extname(e.name))) out.push(p);
    }
    return out;
}

export function collectSourceDocs() {
    const files = [
        ...SOURCE_FILES.map(f => path.join(ROOT, f)).filter(fs.existsSync),
        ...SOURCE_DIRS.flatMap(d => walk(path.join(ROOT, d))),
    ];
    return files.map(f => ({
        source: path.relative(ROOT, f).replace(/\\/g, '/'),
        type: 'code',
        text: fs.readFileSync(f, 'utf8'),
    }));
}

// Lê os resultados do Allure (*-result.json) e converte em texto resumido
export function readAllureResults() {
    const dir = path.join(ROOT, 'allure-results');
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('-result.json'))
        .map(f => {
            try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
            catch { return null; }
        })
        .filter(Boolean)
        .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
}

export function allureToDocs(results) {
    return results.map(r => ({
        source: `allure:${r.fullName || r.name}`,
        type: 'result',
        text: [
            `Teste: ${r.fullName || r.name}`,
            `Status: ${r.status}`,
            `Duração: ${r.stop && r.start ? r.stop - r.start : '?'} ms`,
            `Data: ${r.start ? new Date(r.start).toISOString() : '?'}`,
            r.statusDetails?.message ? `Erro: ${r.statusDetails.message}` : '',
            r.statusDetails?.trace ? `Stack: ${r.statusDetails.trace.slice(0, 1500)}` : '',
        ].filter(Boolean).join('\n'),
    }));
}

// ---------- Chunking ----------
export function chunk(doc, size = 1500, overlap = 200) {
    const out = [];
    const t = doc.text;
    for (let i = 0; i < t.length; i += size - overlap) {
        out.push({ ...doc, text: t.slice(i, i + size), offset: i });
        if (i + size >= t.length) break;
    }
    return out;
}

// ---------- Embeddings ----------
export async function embed(texts, taskType = 'RETRIEVAL_DOCUMENT') {
    const vectors = [];
    for (let i = 0; i < texts.length; i += 50) {
        const res = await client().models.embedContent({
            model: EMBED_MODEL,
            contents: texts.slice(i, i + 50),
            config: { taskType },
        });
        vectors.push(...res.embeddings.map(e => e.values));
    }
    return vectors;
}

// ---------- Vector store ----------
export function loadIndex() {
    if (!fs.existsSync(INDEX_FILE)) {
        throw new Error('Índice não encontrado. Rode: npm run rag:index');
    }
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
}

export function saveIndex(index) {
    fs.mkdirSync(path.dirname(INDEX_FILE), { recursive: true });
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index));
}

function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
    return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function retrieve(query, k = 6) {
    const index = loadIndex();
    const [q] = await embed([query], 'RETRIEVAL_QUERY');
    return index.chunks
        .map(c => ({ ...c, score: cosine(q, c.vector) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k);
}

export function formatContext(chunks) {
    return chunks.map((c, i) => `[${i + 1}] (${c.source})\n${c.text}`).join('\n\n---\n\n');
}

export async function generate(prompt) {
    const res = await client().models.generateContent({ model: CHAT_MODEL, contents: prompt });
    return res.text;
}
