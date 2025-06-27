import * as vscode from 'vscode';
import escapeRegExp from 'escape-string-regexp';
import { EventHandlerBase } from './eventHandlerBase';

export default class extends EventHandlerBase<vscode.FileRenameEvent> {

    public get enabled() : boolean {
        const manageMetadata = this.vloService.config?.salesforce?.enabled && this.vloService.config.salesforce.manageMetaXmlFiles;
        const orgSelected = !!this.vloService.sfdxUsername;
        return !!manageMetadata && orgSelected;
    }

    protected async handleEvent(event: vscode.FileRenameEvent): Promise<void> {
        const trx = new vscode.WorkspaceEdit();

        // Handle of bundle LWC and Aura
        const isBundleSourceFiles = event.files.map(file => this.getMetadataBundleFolder(file)).filter(f => typeof f === 'object');
        for (const bundleInfo of isBundleSourceFiles) {
            // Using for-of loop and not filter to avoid TS errors and custom type-guards
            if (!bundleInfo || !bundleInfo.nameChanged) {
                continue;
            }

            // update LWC references
            if (bundleInfo.type === 'lwc') {
                (await this.updateLwcReferences(bundleInfo.oldName, bundleInfo.newName))
                    .forEach(edit => trx.replace(edit.uri, edit.range, edit.newText, { label: 'Update LWC references', needsConfirmation: true }));
            }

            const files = await vscode.workspace.fs.readDirectory(bundleInfo.uri);
            for (const [name] of files) {
                const fileUri = vscode.Uri.joinPath(bundleInfo.uri, name);
                const newName = name.replace(bundleInfo.oldName, bundleInfo.newName);

                // Update component name in source just for LWC
                if (bundleInfo.type == 'lwc' && name.endsWith('.js')) {
                    (await this.updateLwcSourceFile(fileUri, bundleInfo.newName))
                        .forEach(edit => trx.replace(fileUri, edit.range, edit.newText, { label: 'Rename LWC', needsConfirmation: true }));
                }

                // Update any references to the old name in the meta file
                if (name.endsWith('-meta.xml')) {
                    [...this.replace(await this.vloService.readWorkspaceFile(fileUri), bundleInfo.oldName, bundleInfo.newName)]
                        .forEach(edit => trx.replace(fileUri, edit.range, edit.newText, { label: 'Rename LWC', needsConfirmation: true }));
                }

                // rename
                trx.renameFile(fileUri, vscode.Uri.joinPath(bundleInfo.uri, newName), undefined, { label: 'Rename LWC', needsConfirmation: true });
            }
        }

        if (trx.size > 0) {
            const shouldRefactor = await vscode.window.showInformationMessage(
                'You renamed Salesforce metadata; do you want Vlocode to update related files to match the new name?\n\nYou will be able to preview the changes before they are applied.',
                { modal: true }, { title: 'Update related files', apply: true }, { title: 'No', apply: false, isCloseAffordance: true }
            );
            if (!shouldRefactor?.apply) {
                return;
            }
            void vscode.workspace.applyEdit(trx);
        }
    }

    private async updateLwcSourceFile(file: vscode.Uri, newName: string) {
        const source = await this.vloService.readWorkspaceFile(file);
        const newLwcClassName =  newName.substr(0,1).toUpperCase() + newName.substr(1);
        return [...this.replace(source, /(export\s+default\s+class\s+)[\w]+(\s+extends)/ig, `$1${newLwcClassName}$2`)];
    }

    private async updateLwcReferences(oldName:string, newName: string) {
        const textEdits = new Array<vscode.TextEdit & { uri: vscode.Uri }>();

        // Update HTML elements
        const oldTag = this.getLwcTagName(oldName);
        const newTag = this.getLwcTagName(newName);

        for (const htmlSourceFile of await vscode.workspace.findFiles('**/lwc/**/*.html')) {
            const htmlSource = await this.vloService.readWorkspaceFile(htmlSourceFile);

            for (const edit of this.replace(htmlSource, `c-${oldTag}`, `c-${newTag}`)) {
                textEdits.push(Object.assign(edit, { uri: htmlSourceFile }));
            }
        }

        // Update JS imports
        for (const htmlSourceFile of await vscode.workspace.findFiles('**/lwc/**/*.js')) {
            const htmlSource = await this.vloService.readWorkspaceFile(htmlSourceFile);

            for (const edit of this.replace(htmlSource, new RegExp(`(from\\s+['|"])c\\/${oldName}(['|"]\\s*;)`, 'g'), `$1c/${newName}$2`)) {
                textEdits.push(Object.assign(edit, { uri: htmlSourceFile }));
            }
        }

        return textEdits;
    }

    private getLwcTagName(name: string) {
        let tagName = '';
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            if(i != 0 && char.toUpperCase() == char) {
                tagName += '-';
            }
            tagName += char.toLowerCase();
        }
        return tagName;
    }

    private* replace(source: string, searchExpr: RegExp | string, replacement: string | ((match: RegExpMatchArray) => string)) {
        const regExp = typeof searchExpr === 'string' ? new RegExp(escapeRegExp(searchExpr), 'g') : searchExpr;
        for (const match of source.matchAll(regExp)) {
            if (!match || !match.index) {
                return;
            }
            const newText = typeof replacement === 'function'
                ? replacement(match)
                : match.slice(1).reduce((r, m, i) => r.replaceAll(`$${i+1}`, m), replacement);
            const range = new vscode.Range(
                this.getPositionAt(source, match.index),
                this.getPositionAt(source, match.index + match[0].length)
            );
            yield new vscode.TextEdit(range, newText);
        }
    }

    private getPositionAt(source: string, pos: number): vscode.Position {
        const lineMatches = [...source.substr(0, pos).matchAll(/\r\n|\n/g)];
        const lastMatch = lineMatches[lineMatches.length - 1];
        if (!lastMatch) {
            return new vscode.Position(0, pos);
        }
        return new vscode.Position(lineMatches.length, pos - (lastMatch.index ?? 0) - lastMatch[0].length);
    }

    private getMetadataBundleFolder(file: vscode.FileRenameEvent['files'][0]) {
        const bundleMatcher = /(\/|\\)(lwc|aura)(\/|\\)([^/|\\]+$)/;
        const newMatch = bundleMatcher.exec(file.newUri.fsPath);
        const oldMatch = bundleMatcher.exec(file.oldUri.fsPath);
        return oldMatch && newMatch ? {
            oldName: oldMatch[4],
            newName: newMatch[4],
            nameChanged: oldMatch[4] != newMatch[4],
            uri: file.newUri,
            type: newMatch[2]
        } : false;
    }
}
