// =====================================================================
// Configuração centralizada do projeto
// Única fonte de verdade para variáveis de ambiente (.env + defaults).
// Para alterar um valor: edite o .env (veja .env.example) — não o código.
// =====================================================================
import 'dotenv/config';

const env = process.env;
const bool = (v, def = false) => (v === undefined || v === '' ? def : v.toLowerCase() === 'true');

export const config = {
    // ---------- Execução de testes ----------
    test: {
        platform: (env.TEST_PLATFORM || 'android').toLowerCase(), // android | ios
        androidHome: env.ANDROID_HOME,
    },

    // ---------- BrowserStack ----------
    browserstack: {
        enabled: bool(env.BROWSERSTACK),
        username: env.BROWSERSTACK_USERNAME || 'YOUR_USERNAME',
        accessKey: env.BROWSERSTACK_ACCESS_KEY || 'YOUR_ACCESS_KEY',
        appId: env.BROWSERSTACK_APP_ID || 'bs://demo-app-handshake',
    },

    // ---------- IA / RAG (Gemini) ----------
    ai: {
        apiKey: env.GEMINI_API_KEY,
        chatModel: env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
        embedModel: env.GEMINI_EMBED_MODEL || 'gemini-embedding-001',
        monitorEnabled: bool(env.AI_MONITOR, true),
    },

    // ---------- GitLab (comentário no MR via CI) ----------
    gitlab: {
        token: env.GITLAB_TOKEN,
        apiUrl: env.CI_API_V4_URL,
        projectId: env.CI_PROJECT_ID,
        mergeRequestIid: env.CI_MERGE_REQUEST_IID,
        branch: env.CI_COMMIT_REF_NAME,
        pipelineUrl: env.CI_PIPELINE_URL,
    },
};

export default config;
