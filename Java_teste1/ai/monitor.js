// IA monitor: analisa as falhas da última execução e gera diagnóstico em Markdown.
// Uso: npm run ai:monitor  (também é chamado automaticamente no onComplete do wdio)
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { readAllureResults, retrieve, formatContext, generate, REPORTS_DIR, INDEX_FILE } from './lib.js';

export async function runMonitor({ sinceMs } = {}) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  [AI Monitor] GEMINI_API_KEY ausente — análise ignorada.');
        return null;
    }
    if (!fs.existsSync(INDEX_FILE)) {
        console.warn('⚠️  [AI Monitor] Índice RAG não encontrado — rode "npm run rag:index". Análise ignorada.');
        return null;
    }

    let results = readAllureResults();
    if (sinceMs) results = results.filter(r => (r.start ?? 0) >= sinceMs);
    const failed = results.filter(r => r.status === 'failed' || r.status === 'broken');

    const ts = new Date();
    const lines = [
        `# 🤖 Relatório do AI Monitor — ${ts.toLocaleString('pt-BR')}`,
        '',
        `| Total | ✅ Passou | ❌ Falhou | ⏭️ Skipped |`,
        `|---|---|---|---|`,
        `| ${results.length} | ${results.filter(r => r.status === 'passed').length} | ${failed.length} | ${results.filter(r => r.status === 'skipped').length} |`,
        '',
    ];

    if (!failed.length) {
        lines.push('Nenhuma falha detectada. 🎉');
    }

    for (const r of failed) {
        const name = r.fullName || r.name;
        const err = r.statusDetails?.message || '(sem mensagem)';
        const trace = (r.statusDetails?.trace || '').slice(0, 2000);
        console.log(`🔎 [AI Monitor] Analisando: ${name}`);

        const hits = await retrieve(`${name}\n${err}\n${trace}`, 8);
        const diagnosis = await generate(`Você é um engenheiro sênior de QA mobile (WebdriverIO + Appium + Mocha).
Um teste falhou. Usando o código do projeto no CONTEXTO (incluindo histórico de execuções), produza em português:
1. **Causa provável** (seja específico: seletor, timing, ambiente, asserção, app)
2. **Evidências** (cite arquivos/linhas do contexto como [n])
3. **Correção sugerida** (com trecho de código se aplicável)
4. **Flaky?** (indique se parece intermitente com base no histórico)

TESTE: ${name}
ERRO: ${err}
STACK:
${trace}

CONTEXTO:
${formatContext(hits)}`);

        lines.push(`## ❌ ${name}`, '', '```', err, '```', '', diagnosis, '',
            `<sub>Fontes: ${hits.map((h, i) => `[${i + 1}] ${h.source}`).join(' · ')}</sub>`, '');
    }

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const file = path.join(REPORTS_DIR, `report-${ts.toISOString().replace(/[:.]/g, '-')}.md`);
    const content = lines.join('\n');
    fs.writeFileSync(file, content);
    fs.writeFileSync(path.join(REPORTS_DIR, 'latest.md'), content);
    console.log(`📝 [AI Monitor] Relatório: ${path.relative(process.cwd(), file)}`);
    return file;
}

// Execução direta via CLI
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    await runMonitor();
}
