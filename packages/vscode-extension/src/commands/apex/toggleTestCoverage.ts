import { VlocodeCommand } from '../../constants';
import * as vscode from 'vscode';
import { vscodeCommand } from '../../lib/commandRouter';
import { CommandBase } from '../../lib/commandBase';
import { substringBetweenLast } from '@vlocode/util';

@vscodeCommand(VlocodeCommand.apexToggleCoverage)
export default class PauseMetadataDeploymentsCommand extends CommandBase {

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

    initialize() {
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

    public async showCoverageDecorations(apexClassName: string) {
        const editor = vscode.window.activeTextEditor;
        const document = editor?.document;
        if (!document) {
            return;
        }

        const coverageDetails = await this.vlocode.salesforceService.getApexCodeCoverage(apexClassName);
        if (!coverageDetails) {
            void vscode.window.showWarningMessage(`No test coverage collected for ${apexClassName}.`);
            return;
        }

        const maxLine = Math.max(...coverageDetails.coveredLines, ...coverageDetails.uncoveredLines) - 1;
        if (maxLine > document.lineCount) {
            void vscode.window.showWarningMessage(`Coverage data for ${apexClassName} is out of sync with the current file.`);
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

    public clearCoverageDecorations(apexClassName: string) {
        vscode.window.activeTextEditor?.setDecorations(this.coveredDecoration, []);
        vscode.window.activeTextEditor?.setDecorations(this.uncoveredDecoration, []);
        this.coverageShowingFor.delete(apexClassName.toLowerCase());
    }
}