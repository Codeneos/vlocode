// Parse commands YAML into a package JSON command structure
import { join, resolve } from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as logSymbols from 'log-symbols';
import type * as PackageJsonType from '../package.json';

async function syncPackageVersion() {
    const packageJson: typeof PackageJsonType = await fs.readJSON('package.json');
    const propertiesToSync = [ 'version', 'author', 'license', 'publisher' ];

    const workspaces = packageJson.workspaces.map(ws => [
        resolve(...ws.split(/\|\//g)),
        fs.readJSONSync(resolve(...ws.split(/\|\//g), 'package.json'))
    ]) as [string, typeof PackageJsonType][];

    for (const [workspace, workspaceJson] of workspaces as [string, any][]) {
        for (const prop of propertiesToSync) {
            workspaceJson[prop] = packageJson[prop];
        }

        for (const dep of Object.keys(workspaceJson.dependencies)) {
            const isWorkspacePackage = workspaces.find(([,json]) => json.name == dep);
            if (isWorkspacePackage) {
                workspaceJson.dependencies[dep] = packageJson.version;
                console.log(`${chalk.bold(workspaceJson.name)} - sync dependency ${chalk.blueBright(dep)} version to ${chalk.magenta.bold(packageJson.version)}`);
            }
        }

        await fs.writeJSON(join(workspace, 'package.json'), workspaceJson, { spaces: 4 });
        console.log(`${chalk.bold(logSymbols.info)} Synced workspace ${chalk.blueBright(workspace)} to ${chalk.magenta.bold(packageJson.version)}`);
    }
}

// Run update command
void syncPackageVersion();