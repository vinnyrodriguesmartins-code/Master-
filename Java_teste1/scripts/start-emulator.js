import { execSync, spawn } from 'child_process';
import path from 'path';
import settings from '../config.js';

function isEmulatorRunning() {
    try {
        const output = execSync('adb devices').toString();
        const lines = output.trim().split('\n');
        // The first line is "List of devices attached"
        // Check if there's any other line containing "device"
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].includes('device')) {
                return true;
            }
        }
    } catch (e) {
        console.error('Error running adb devices:', e.message);
    }
    return false;
}

function getEmulatorPath() {
    const androidHome = settings.test.androidHome;
    if (!androidHome) {
        throw new Error('ANDROID_HOME environment variable is not defined!');
    }
    const binary = process.platform === 'win32' ? 'emulator.exe' : 'emulator';
    return path.join(androidHome, 'emulator', binary);
}

function getAvailableAvd() {
    try {
        const emulatorBinary = getEmulatorPath();
        const output = execSync(`"${emulatorBinary}" -list-avds`).toString().trim();
        const avds = output.split('\n').map(avd => avd.trim()).filter(Boolean);
        if (avds.length > 0) {
            return avds[0]; // Retorna a primeira AVD encontrada (ex: Pixel_5)
        }
    } catch (e) {
        console.error('Error listing AVDs:', e.message);
    }
    return null;
}

async function startEmulator() {
    // Pula a inicialização se rodar no BrowserStack ou iOS
    if (settings.browserstack.enabled) {
        console.log('Running on BrowserStack, skipping local emulator check.');
        return;
    }
    if (settings.test.platform === 'ios') {
        console.log('Running on iOS, skipping Android emulator check.');
        return;
    }

    if (isEmulatorRunning()) {
        console.log('An Android device/emulator is already running.');
        return;
    }

    const avd = getAvailableAvd();
    if (!avd) {
        console.error('No Android Virtual Devices (AVD) found. Please create one in Android Studio first.');
        process.exit(1);
    }

    const emulatorBinary = getEmulatorPath();
    console.log(`Starting Android Emulator with AVD: "${avd}"...`);

    // Inicia o emulador em segundo plano (detached)
    let child;
    if (process.platform === 'win32') {
        child = spawn('cmd.exe', ['/c', 'start', '', emulatorBinary, '-avd', avd], {
            detached: true,
            stdio: 'ignore'
        });
    } else {
        child = spawn(emulatorBinary, ['-avd', avd], {
            detached: true,
            stdio: 'ignore'
        });
    }
    child.unref();

    console.log('Waiting for emulator to boot (this might take a moment)...');
    
    let booted = false;
    const startTime = Date.now();
    const timeout = 120000; // Timeout de 2 minutos

    while (!booted && (Date.now() - startTime) < timeout) {
        try {
            const bootCompleted = execSync('adb shell getprop sys.boot_completed', { stdio: 'pipe' }).toString().trim();
            if (bootCompleted === '1') {
                booted = true;
                break;
            }
        } catch (e) {
            // adb shell pode falhar temporariamente enquanto o emulador liga
        }
        // Aguarda 3 segundos antes da próxima verificação
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (booted) {
        console.log('Emulator boot detected. Waiting 15 seconds for system services to settle...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        console.log('Emulator successfully started and fully booted!');
    } else {
        console.warn('Timeout reached waiting for emulator to boot. Attempting to proceed anyway...');
    }
}

startEmulator();
