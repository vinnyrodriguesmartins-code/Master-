// npm run rag:watch — observa o projeto e reindexa automaticamente (incremental, com debounce)
import fs from 'fs';
import path from 'path';
import { ROOT } from './lib.js';
import { buildIndex } from './index.js';

const TARGETS = ['test', 'scripts', 'allure-results', 'README.md', 'wdio.conf.js', 'package.json', '.gitlab-ci.yml'];
let timer, running = false, again = false;

async function reindex(reason) {
    if (running) { again = true; return; }
    running = true;
    console.log(`\n🔄 [${new Date().toLocaleTimeString('pt-BR')}] Mudança detectada (${reason}) — reindexando...`);
    try { await buildIndex(); } catch (e) { console.error('❌', e.message); }
    running = false;
    if (again) { again = false; reindex('pendente'); }
}

function schedule(reason) {
    clearTimeout(timer);
    timer = setTimeout(() => reindex(reason), 2000);
}

for (const t of TARGETS) {
    const p = path.join(ROOT, t);
    if (!fs.existsSync(p)) continue;
    const recursive = fs.statSync(p).isDirectory();
    fs.watch(p, { recursive }, (_e, file) => schedule(recursive ? `${t}/${file}` : t));
}

console.log('👀 Observando:', TARGETS.join(', '), '(Ctrl+C para sair)');
await reindex('inicial');
