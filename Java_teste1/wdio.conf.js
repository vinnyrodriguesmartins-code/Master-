import { join } from 'path';

// Determina as capabilities com base nas variáveis de ambiente
let capabilities = [];

if (process.env.BROWSERSTACK === 'true') {
    capabilities = [{
        'bstack:options': {
            userName: process.env.BROWSERSTACK_USERNAME || 'YOUR_USERNAME',
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY || 'YOUR_ACCESS_KEY',
            projectName: "Desafio Carrefour Banco",
            buildName: "Build 1.0",
            sessionName: "Testes Mobile"
        },
        platformName: "android",
        "appium:platformVersion": "11.0",
        "appium:deviceName": "Google Pixel 5",
        "appium:app": process.env.BROWSERSTACK_APP_ID || "bs://demo-app-handshake",
        "appium:automationName": "UiAutomator2"
    }];
} else if (process.env.TEST_PLATFORM === 'ios') {
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
    port: process.env.BROWSERSTACK === 'true' ? 80 : 4723,
    path: process.env.BROWSERSTACK === 'true' ? '/wd/hub' : '/',
    hostname: process.env.BROWSERSTACK === 'true' ? 'hub-cloud.browserstack.com' : 'localhost',
    
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
    services: process.env.BROWSERSTACK === 'true' ? [] : [
        ['appium', {
            args: {
                address: 'localhost',
                port: 4723
            },
            command: 'appium'
        }]
    ],
    
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
    }
};
