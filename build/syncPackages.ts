// Parse commands YAML into a package JSON command structure
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as logSymbols from 'log-symbols';
import { join } from 'path';
import * as execa from 'execa';
import type * as PackageJsonType from '../package.json';

async function syncPackageVersion() {
    const packageJson: typeof PackageJsonType = await fs.readJSON('package.json');
    const propertiesToSync = [ 'version', 'author', 'license', 'publisher' ];

    const workspaces = await Promise.all(packageJson.workspaces.map(async ws => [ws, (await fs.readJSON(join(ws, 'package.json'))) as typeof PackageJsonType])) as Array<[string, typeof PackageJsonType]>;

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
        //execa.sync(`npx typedoc ${join(workspace, 'src', 'index.ts')} --readme none --tsconfig ${join(workspace, 'tsconfig.json')} --excludePrivate`);
    }
}

// Run update command
void syncPackageVersion();