import * as vscode from 'vscode';
import path from 'path';

import { FileSystem } from '@vlocode/core';
import type { VlocityDatapack } from '@vlocode/vlocity';
import type { DatapackWritePlan } from '@vlocode/vlocity-deploy';

export async function confirmDatapackWrite(
    datapack: VlocityDatapack,
    plan: DatapackWritePlan,
    fileSystem: FileSystem
): Promise<void> {
    const existingEntries = await fileSystem.isDirectory(plan.targetFolder)
        ? await fileSystem.readDirectory(plan.targetFolder)
        : [];
    const existingNames = new Set(existingEntries.map(entry => entry.name));
    const outputNames = new Set([...plan.files.keys()].map(fileName => path.relative(plan.targetFolder, fileName)));
    const create = [...outputNames].filter(name => !existingNames.has(name)).sort();
    const remove = [...existingNames].filter(name => !outputNames.has(name)).sort();
    const locationChanged = path.resolve(plan.expectedHeader) !== path.resolve(plan.targetHeader);

    if (!locationChanged && !create.length && !remove.length) {
        return;
    }

    const details: string[] = [];
    if (locationChanged) {
        details.push(
            `The expand definition expects: ${plan.expectedHeader}`,
            `The current folder and main file will be kept: ${plan.targetHeader}`
        );
    }
    if (create.length) {
        details.push(`Create: ${create.join(', ')}`);
    }
    if (remove.length) {
        details.push(`Delete surplus: ${remove.join(', ')}`);
    }

    const action = await vscode.window.showWarningMessage(
        `Saving ${datapack.key} will update its expanded file structure.`,
        { modal: true, detail: details.join('\n') },
        { title: 'Save and Update Files', save: true },
        { title: 'Cancel', isCloseAffordance: true }
    );
    if (!action?.save) {
        throw new vscode.CancellationError();
    }
}
