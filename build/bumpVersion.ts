// Parse commands YAML into a package JSON command structure
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as logSymbols from 'log-symbols';

async function bumpVersion(type: 'major' | 'minor' | 'patch' | string) {
    const packageJson = await fs.readJSON(`package.json`);
    const packageLockJson = await fs.readJSON(`package-lock.json`);
    const currentVersion : string = packageJson.version;
    let [ major, minor, patch ] = currentVersion.split('.').map(parseFloat);

    if ([ major, minor, patch ].some(isNaN)) {
        throw new Error(`Failed to parse version from package JSON: ${currentVersion}`);
    }

    // What to bump
    if (type == 'major') {
        major++;
    } else if (type == 'minor') {
        minor++;
    } else if (type == 'patch') {
        patch++;
    } else {
        throw new Error(`Unknown version type: ${type}`);
    }

    // Update version
    packageJson.version = `${major}.${minor}.${patch}`;
    packageLockJson.version = `${major}.${minor}.${patch}`;

    // Save it
    await fs.writeJSON(`package.json`, packageJson, { spaces: 4 });
    await fs.writeJSON(`package-lock.json`, packageLockJson, { spaces: 4 });

    console.log(`${chalk.bold(logSymbols.info)} Bumped from ${chalk.magenta.bold(currentVersion)} to ${chalk.magenta.bold(packageJson.version)}`);
}

// Run update command
const [ type ] = process.argv.slice(2);
bumpVersion(type);