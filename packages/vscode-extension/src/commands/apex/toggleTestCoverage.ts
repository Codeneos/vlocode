import { VlocodeCommand } from '../../constants';
import * as vscode from 'vscode';
import { vscodeCommand } from '../../lib/commandRouter';
import { CommandBase } from '../../lib/commandBase';
import { cache, substringBetweenLast } from '@vlocode/util';

@vscodeCommand(VlocodeCommand.apexToggleCoverage)
/**
 * Represents a command for toggling test coverage
 * highlighting in the editor for the an Apex class.
 */
export default class ToggleApexTestCoverage extends CommandBase {

    private coverageShowingFor = new Set<string>();

    private coveredDecoration = vscode.window.createTextEditorDecorationType({
        borderRadius: '3px',
        borderWidth: '1px',
        borderStyle: 'solid',
        backgroundColor: 'RGBA(13,246,17,0.2)',
        borderColor: 'RGBA(13,246,17,0.3)',
    });

    private uncoveredDecoration = vscode.window.createTextEditorDecorationType({
        borderRadius: '3px',
        borderWidth: '1px',
        borderStyle: 'solid',
        backgroundColor: 'rgba(225,36,3,0.4)',
        borderColor: 'rgba(225,36,3,0.5)',
    });

    private get activeDocument() {
        return vscode.window.activeTextEditor?.document;
    }

    private get activeDocumentClassName() {
        if (!this.activeDocument?.uri.path.endsWith('.cls')) {
            return;
        }
        return substringBetweenLast(this.activeDocument.uri.path, '/', '.');
    }

    /**
     * Initializes the toggleTestCoverage feature.
     */
    public initialize() {
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (!editor?.document) {
                return;
            }
            const className = substringBetweenLast(editor.document.uri.path, '/', '.');
            if (this.coverageShowingFor.has(className.toLowerCase())) {
                this.showCoverageDecorations(className);
            }
        });
    }

    /**
     * Executes the command to toggle test coverage.
     * If the active document class name is not available, the function returns.
     * If the coverage is already showing for the active document class, the coverage decorations are cleared.
     * Otherwise, the coverage decorations are shown for the active document class.
     */
    public execute() {
        if (!this.activeDocumentClassName) {
            return;
        }
        if (this.coverageShowingFor.has(this.activeDocumentClassName.toLowerCase())) {
            return this.clearCoverageDecorations(this.activeDocumentClassName);
        }
        return this.showCoverageDecorations(this.activeDocumentClassName);
    }

    public dispose() {
        this.coveredDecoration?.dispose();
        this.uncoveredDecoration?.dispose();
    }

    /**
     * Shows coverage decorations for the specified Apex class.
     * @param apexClassName - The name of the Apex class.
     * @returns A promise that resolves when the coverage decorations are shown.
     */
    private async showCoverageDecorations(apexClassName: string) {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (!document) {
            return;
        }

        const coverageDetails = await this.getCoverage(apexClassName);
        if (!coverageDetails || !coverageDetails.coveredLines.length && !coverageDetails.uncoveredLines.length) {
            void vscode.window.showWarningMessage(`No test coverage data available for ${apexClassName}.`);
            return;
        }

        const maxLine = Math.max(...coverageDetails.coveredLines, ...coverageDetails.uncoveredLines) - 1;
        if (maxLine > document.lineCount) {
            void vscode.window.showWarningMessage(`Coverage data for ${apexClassName} is out of sync.`);
            return;
        }

        const coveredLines = coverageDetails.coveredLines.map(line => document.lineAt(line - 1).range);
        const uncoveredLines = coverageDetails.uncoveredLines.map(line => document.lineAt(line - 1).range);
        editor.setDecorations(this.coveredDecoration, coveredLines);
        editor.setDecorations(this.uncoveredDecoration, uncoveredLines);

        if (!this.coverageShowingFor.has(apexClassName.toLowerCase())) {
            void vscode.window.showInformationMessage(`Showing coverage information for ${apexClassName}.`);
            this.coverageShowingFor.add(apexClassName.toLowerCase());
        }
    }

    private clearCoverageDecorations(apexClassName: string) {
        vscode.window.activeTextEditor?.setDecorations(this.coveredDecoration, []);
        vscode.window.activeTextEditor?.setDecorations(this.uncoveredDecoration, []);
        this.coverageShowingFor.delete(apexClassName.toLowerCase());
    }

    /**
     * Retrieves the code coverage for a given Apex class.
     * @param className - The name of the Apex class.
     * @returns A Promise that resolves to the code coverage information.
     */
    @cache({ ttl: 60 * 5 })
    private getCoverage(className: string) {
        return this.vlocode.salesforceService.getApexCodeCoverage(className)
    }
}