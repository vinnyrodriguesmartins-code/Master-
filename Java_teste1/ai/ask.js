// npm run rag:ask -- "sua pergunta"
import { retrieve, formatContext, generate } from './lib.js';

const question = process.argv.slice(2).join(' ').trim();
if (!question) {
    console.error('Uso: npm run rag:ask -- "Como funciona o teste de swipe?"');
    process.exit(1);
}

const hits = await retrieve(question);
const answer = await generate(`Você é um especialista em automação mobile (WebdriverIO + Appium + Mocha) e conhece este projeto.
Responda em português usando APENAS o contexto abaixo. Cite as fontes como [n]. Se não souber, diga.

CONTEXTO:
${formatContext(hits)}

PERGUNTA: ${question}`);

console.log(`\n${answer}\n\nFontes:`);
hits.forEach((h, i) => console.log(`  [${i + 1}] ${h.source} (score ${h.score.toFixed(3)})`));
