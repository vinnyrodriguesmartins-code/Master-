import { join } from 'path';
import settings from './config.js';

const bs = settings.browserstack;
let runStartedAt = Date.now();

// Determina as capabilities com base nas variáveis de ambiente
let capabilities = [];

if (bs.enabled) {
    capabilities = [{
        'bstack:options': {
            userName: bs.username,
            accessKey: bs.accessKey,
            projectName: "Desafio Carrefour Banco",
            buildName: "Build 1.0",
            sessionName: "Testes Mobile"
        },
        platformName: "android",
        "appium:platformVersion": "11.0",
        "appium:deviceName": "Google Pixel 5",
        "appium:app": bs.appId,
        "appium:automationName": "UiAutomator2"
    }];
} else if (settings.test.platform === 'ios') {
    capabilities = [{
        platformName: 'iOS',
        'appium:deviceName': 'iPhone 15 Simulator',
        'appium:platformVersion': '17.2',
        'appium:automationName': 'XCUITest',
        'appium:app': join(process.cwd(), './apps/ios.simulator.wdio.native.app.v2.2.0.zip'),
        'appium:newCommandTimeout': 240,
    }];
} else {
    // Default: Android Local Emulator
    capabilities = [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:platformVersion': '11.0',
        'appium:automationName': 'UiAutomator2',
        'appium:app': join(process.cwd(), './apps/android.wdio.native.app.v2.2.0.apk'),
        'appium:newCommandTimeout': 240,
    }];
}

export const config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',
    port: bs.enabled ? 80 : 4723,
    path: bs.enabled ? '/wd/hub' : '/',
    hostname: bs.enabled ? 'hub-cloud.browserstack.com' : 'localhost',
    
    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './test/specs/**/*.spec.js'
    ],
    exclude: [],
    
    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 1,
    capabilities: capabilities,
    
    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    bail: 0,
    baseUrl: '',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // Rodar o serviço Appium somente em execuções locais
    services: [],
    
    framework: 'mocha',
    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    
    //
    // =====
    // Hooks
    // =====
    //
    // Tira um screenshot automático após cada teste que falhar e anexa ao Allure
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },

    onPrepare: function() {
        runStartedAt = Date.now();
    },

    // AI Monitor: analisa as falhas desta execução com RAG e gera ai-reports/latest.md
    onComplete: async function() {
        if (!settings.ai.monitorEnabled) return;
        try {
            const { runMonitor } = await import('./ai/monitor.js');
            await runMonitor({ sinceMs: runStartedAt });
        } catch (e) {
            console.warn('⚠️  [AI Monitor] Falhou:', e.message);
        }
    }
};
