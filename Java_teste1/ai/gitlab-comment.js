// Publica ai-reports/latest.md como comentário no Merge Request (GitLab CI)
// Requer variável CI/CD: GITLAB_TOKEN (Project/Personal Access Token com escopo "api")
import fs from 'fs';
import path from 'path';
import { REPORTS_DIR } from './lib.js';

const { CI_API_V4_URL, CI_PROJECT_ID, CI_MERGE_REQUEST_IID, CI_COMMIT_REF_NAME, GITLAB_TOKEN, CI_PIPELINE_URL } = process.env;
const file = path.join(REPORTS_DIR, 'latest.md');

if (!GITLAB_TOKEN || !CI_API_V4_URL) { console.log('ℹ️  Fora do CI ou GITLAB_TOKEN ausente — comentário ignorado.'); process.exit(0); }
if (!fs.existsSync(file)) { console.log('ℹ️  Nenhum relatório em ai-reports/latest.md.'); process.exit(0); }

const api = (p, opts = {}) => fetch(`${CI_API_V4_URL}/projects/${CI_PROJECT_ID}${p}`, {
    ...opts, headers: { 'PRIVATE-TOKEN': GITLAB_TOKEN, 'Content-Type': 'application/json' },
});

// Usa o MR do pipeline, ou procura um MR aberto para a branch
let iid = CI_MERGE_REQUEST_IID;
if (!iid) {
    const res = await api(`/merge_requests?state=opened&source_branch=${encodeURIComponent(CI_COMMIT_REF_NAME)}`);
    iid = (await res.json())[0]?.iid;
}
if (!iid) { console.log(`ℹ️  Nenhum MR aberto para "${CI_COMMIT_REF_NAME}".`); process.exit(0); }

const body = `${fs.readFileSync(file, 'utf8')}\n\n---\n<sub>Pipeline: ${CI_PIPELINE_URL ?? ''}</sub>`.slice(0, 1_000_000);
const res = await api(`/merge_requests/${iid}/notes`, { method: 'POST', body: JSON.stringify({ body }) });
console.log(res.ok ? `💬 Comentário publicado no MR !${iid}` : `❌ Falha (${res.status}): ${await res.text()}`);
