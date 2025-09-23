let _extension;
globalThis.__vlocodeStartTime = Date.now();

async function extension() {
    if (!_extension) {
        _extension = await import('./dist/vlocode.mjs');
    }
    return _extension;
}

async function showErrorMessage(error, ...args) {
    (await import('vscode')).window.showErrorMessage(error, ...args);
}

export async function activate(...args) {
    try {
        return (await extension()).activate(...args);
    } catch (error) {
        showErrorMessage(`Error during activation: ${error.message}`);
    }
}

export async function deactivate(...args) {
    try {
        return (await extension()).deactivate?.(...args);
    } catch (error) {
        showErrorMessage(`Error during de-activation: ${error.message}`);
    }
}