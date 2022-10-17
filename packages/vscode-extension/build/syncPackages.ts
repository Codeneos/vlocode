// Parse commands YAML into a package JSON command structure
import { join, resolve } from 'path';
import { relative } from 'path/posix';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as logSymbols from 'log-symbols';
import type * as PackageJsonType from '../package.json';

async function getWorkspaces(workspacesRoot) : Promise<[string, any][]> {
    const workspaceFolders = (await fs.readdir(workspacesRoot, { withFileTypes: true }))
        .filter(f => f.isDirectory())
        .map(f => join(workspacesRoot, f.name));

    return workspaceFolders.map(ws => [
        resolve(...ws.split(/\|\//g)),
        fs.readJSONSync(resolve(...ws.split(/\|\//g), 'package.json'))
    ]) as [string, typeof PackageJsonType][];
}

async function syncPackageJson(workspaces: [path: string, packageJson: any][]) {
    const packageJson: typeof PackageJsonType = await fs.readJSON('package.json');
    const propertiesToSync = [ 'version', 'author', 'license', 'publisher' ];

    for (const [workspace, workspaceJson] of workspaces) {
        console.log(`${chalk.bold(logSymbols.info)} Sync ${chalk.bold(workspaceJson.name)} package-json`);

        for (const prop of propertiesToSync) {
            workspaceJson[prop] = packageJson[prop];
        }

        for (const dep of Object.keys(workspaceJson.dependencies)) {
            // Sync workspace package versions to all have the same version
            const workspacePackage = workspaces.find(([,json]) => json.name == dep);
            if (workspacePackage) {
                const relativeVersion = `workspace:${relative(workspace, workspacePackage[0])}`;
                workspaceJson.dependencies[dep] = relativeVersion;
                console.log(`  ${chalk.bold(workspaceJson.name)} ${chalk.blueBright(dep)} -> ${relativeVersion}`);
            }
        }

        // Update workspaces to have the same version as the main module of all dependencies
        for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
            if (workspaceJson.dependencies?.[dep]  && workspaceJson.dependencies[dep] != version) {
                workspaceJson.dependencies[dep] = version;
                console.log(`  ${chalk.bold(workspaceJson.name)} ${chalk.blueBright(dep)} -> ${chalk.magenta.bold(version)}`);
            }
            if (workspaceJson.devDependencies?.[dep] && workspaceJson.devDependencies[dep] != version) {
                workspaceJson.devDependencies[dep] = version;
                console.log(`  ${chalk.bold(workspaceJson.name)} ${chalk.blueBright(dep)} -> ${chalk.magenta.bold(version)}`);
            }
        }

        await fs.writeJSON(join(workspace, 'package.json'), workspaceJson, { spaces: 4 });
        //await fs.unlink(join(workspace, 'package-lock.json')); // Remove lock file
    }

    //await fs.unlink('package-lock.json'); // Remove lock file
}

async function syncPatchFiles(workspaces: [string, any][]) {
    const patchedModules = new Map((await fs.readdir('patches', { withFileTypes: true }))
        .filter(f => f.isFile() && f.name.endsWith('.patch'))
        .map(f => {
            const patchParts = f.name.slice(0, -8).split('+');
            return [ patchParts.slice(0, -1).join('/'), join('patches', f.name) ];
        }));

    for (const [workspace, workspaceJson] of workspaces as [string, any][]) {
        console.log(`${chalk.bold(logSymbols.info)} Sync ${chalk.bold(workspaceJson.name)} patch files`);

        for (const dep of Object.keys(workspaceJson.dependencies)) {
            const patchFile = patchedModules.get(dep);
            if (patchFile) {
                console.log(`  ${chalk.bold(workspaceJson.name)} copy patch ${chalk.blueBright(dep)} (${chalk.magenta.bold(patchFile)})`);
                await fs.ensureDir(resolve(workspace, patchFile, '..'));
                await fs.copy(patchFile, join(workspace, patchFile));
            }
        }
    }
}

void (async () => {
    const workspaces = await getWorkspaces('packages');
    console.log(`${chalk.bold(logSymbols.info)} Found ${workspaces.length} workspace modules`);

    await syncPackageJson(workspaces);
    await syncPatchFiles(workspaces);

    console.log(`${chalk.bold(logSymbols.success)} Synced workspace modules!`);
})();


