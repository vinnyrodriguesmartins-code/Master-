// npm run rag:index — indexa código, docs e resultados do Allure (incremental: só re-embeda o que mudou)
import fs from 'fs';
import crypto from 'crypto';
import { pathToFileURL } from 'url';
import { collectSourceDocs, readAllureResults, allureToDocs, chunk, embed, saveIndex, INDEX_FILE, EMBED_MODEL } from './lib.js';

const hash = s => crypto.createHash('sha1').update(s).digest('hex');

export async function buildIndex({ full = false } = {}) {
    const docs = [...collectSourceDocs(), ...allureToDocs(readAllureResults())];
    const chunks = docs.flatMap(d => chunk(d)).map(c => ({ ...c, hash: hash(c.source + c.text) }));

    // Reaproveita vetores de chunks inalterados
    let cache = new Map();
    if (!full && fs.existsSync(INDEX_FILE)) {
        const old = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
        if (old.model === EMBED_MODEL) cache = new Map(old.chunks.filter(c => c.hash).map(c => [c.hash, c.vector]));
    }

    const pending = chunks.filter(c => !cache.has(c.hash));
    console.log(`📚 ${docs.length} documentos → ${chunks.length} chunks (${pending.length} novos/alterados).`);
    if (pending.length) {
        const vectors = await embed(pending.map(c => `Arquivo: ${c.source}\n${c.text}`));
        pending.forEach((c, i) => cache.set(c.hash, vectors[i]));
    }

    saveIndex({
        model: EMBED_MODEL,
        createdAt: new Date().toISOString(),
        chunks: chunks.map(c => ({ ...c, vector: cache.get(c.hash) })),
    });
    console.log('✅ Índice salvo em ai/.index/vectors.json');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    await buildIndex({ full: process.argv.includes('--full') });
}
