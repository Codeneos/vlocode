import { VlocodeCommand } from '../../constants';
import * as vscode from 'vscode';
import { vscodeCommand } from '../../lib/commandRouter';
import { CommandBase } from '../../lib/commandBase';
import { substringBetweenLast } from '@vlocode/util';

/**
 * Represents a command for showing the difference between
 * local Apex files and their org counterparts.
 * 
 * @author Peter van Gulik <peter.van.gulik@curlybracket.nl>
 * @company Curlybracket
 * 
 * Usage:
 * ```typescript
 * // The command can be executed via VS Code command palette
 * // or programmatically:
 * const command = new ShowOrgDiff();
 * await command.execute(vscode.Uri.file('/path/to/apex/file.cls'));
 * ```
 */
@vscodeCommand(VlocodeCommand.diffMetadata)
export default class ShowOrgDiff extends CommandBase {

    private readonly classNameRegex = /^[a-z ]*class ([a-z0-9]+)/i;

    /**
     * Executes the command to show a diff between local and org versions of a file.
     * If no document is provided, uses the currently open document.
     * Opens a side-by-side diff view showing org content on the left and local content on the right.
     */
    public execute(...args: any[]): void | Promise<void> {
        return this.showDiffForDocument.apply(this, [args[0] || this.currentOpenDocument]);
    }

    private async showDiffForDocument(document: vscode.Uri) {
        try {
            const fileName = substringBetweenLast(document.path, '/', '.');
            
            // Get the class name from the document
            const textDocument = await vscode.workspace.openTextDocument(document);
            const classInfo = this.getClassName(textDocument);
            
            if (!classInfo) {
                vscode.window.showErrorMessage('Unable to determine Apex class name from document');
                return;
            }

            // Create the apex:// URI for the org version
            const orgUri = vscode.Uri.parse(`apex://${classInfo.className}`);
            
            // Show the diff
            await vscode.commands.executeCommand(
                'vscode.diff',
                orgUri,
                document,
                `Org vs Local: ${fileName}`,
                {
                    preview: true,
                    preserveFocus: true
                }
            );
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to show diff: ${error}`);
        }
    }

    private getClassName(document: vscode.TextDocument) {
        if (!document.uri.path.endsWith('.cls')) {
            return;
        }

        for (let i = 0; i < Math.min(document.lineCount, 30); i++) {
            const line = document.lineAt(i);
            const match = line.text.match(this.classNameRegex);
            if (match) {
                return { range: line.range, className: match[1] }
            }
        }
    }
}