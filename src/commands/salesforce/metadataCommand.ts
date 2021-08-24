import * as vscode from 'vscode';

import { getDocumentBodyAsString } from '@vlocode/util';
import { CommandBase } from 'commands/commandBase';
import SalesforceService from 'lib/salesforce/salesforceService';
import { DetailedDeployResult, FailureDeployMessage } from 'lib/salesforce/salesforceDeployService';
import type { MetadataManifest } from 'lib/salesforce/deploy/packageXml';
import { SalesforcePackage } from 'lib/salesforce/deploymentPackage';

/**
 * Salesfoece metadata base command 
 */
export default abstract class MetadataCommand extends CommandBase {

    /**
     * Problem matcher functions
     */
    private readonly problemMatchers = [
        { test: /(?<message>.*):\s*(?<token>.*)/, handler: this.tokenProblemHandler.bind(this) },
        { test: /.+/, handler: this.genericProblemHandler.bind(this) }
    ];

    protected getDiagnostics() : vscode.DiagnosticCollection {
        return this.vlocode.getDiagnostics('salesforce');
    }

    protected get salesforce() : SalesforceService {
        return this.vlocode.salesforceService;
    }

    public async validate() : Promise<void> {
        const validationMessage = await this.vlocode.validateSalesforceConnectivity();
        if (validationMessage) {
            throw validationMessage;
        }
    }

    /**
     * Displays any error in the diagnostics tab of VSCode
     * @param manifest The deployment or destructive changes manifest
     * @param failures Array of component failures
     */
    protected async logDeployResult(sfPackage: SalesforcePackage, result: DetailedDeployResult) {
        if (result.success) {
            this.logger.info(`Deployment ${result?.id} -- ${result.status} (${result.numberComponentsDeployed}/${result.numberComponentsTotal})`);
        } else {
            this.logger.error(`Deployment ${result?.id} -- ${result.status}`);
        }

        if (!result.details?.componentFailures?.length) {
            return;
        }

        // Some times we get a lot of the same errors from Salesforce, in case of 'An unexpected error occurred' errors;
        // these are not useful to display so we instead filter these out        
        const filterFailures = result.details?.componentFailures?.filter(failure => !failure.problem.startsWith('An unexpected error occurred.'));

        for (const failure of filterFailures.filter(failure => failure && !!failure.fileName)) {
            const info = sfPackage.getSourceFile(failure.fileName.replace(/^src\//i, ''));
            if (info) {
                // vscode starts counting lines and characters at 0, Salesforce at 1, compensate for the difference                
                await this.reportProblem(vscode.Uri.file(info), failure);
            }
        }

        // Log all failures to the console even those that have no file info
        filterFailures.filter(failure => failure).forEach((failure, i) => {
            this.logger.warn(` ${i + 1}. ${failure.fullName} -- ${failure.problemType} -- ${failure.problem}`);
        });
    }

    protected async reportProblem(localPath: vscode.Uri, failure: { problem: string; lineNumber: any; columnNumber: any }) {
        // vscode starts counting lines and characters at 0, Salesforce at 1, compensate for the difference     
        const startPosition = new vscode.Position(parseInt(failure.lineNumber, 10) - 1, parseInt(failure.columnNumber, 10) - 1);
        const fileBody = await getDocumentBodyAsString(localPath.fsPath);

        for (const matcher of this.problemMatchers) {
            const match = failure.problem.match(matcher.test);
            if(!match) {
                continue;
            }
            try {
                const range = matcher.handler(fileBody, failure.problem, startPosition, match);
                if (range) {
                    this.addError(localPath, range, failure.problem);
                    return;
                }
            } catch(e) {
                this.logger.error(`Problem matcher error: ${e.message || e}`);
            }
        }

        // Only reaches here in case non of the problem matcher work,
        this.logger.warn('All problem matchers failed, falling back to basic single character match');
        this.addError(localPath, new vscode.Range(startPosition, startPosition.translate(0,1)), failure.problem);
    }

    private tokenProblemHandler(content: string, problem: string, start: vscode.Position, match: RegExpMatchArray) : vscode.Range | undefined {
        if (!match.groups) {
            return undefined;
        }
        // look ahead for the token
        return this.findSubstring(content, start.line, start.character, match.groups.token) ||
               this.findSubstring(content, start.line, 0, match.groups.token);
    }

    private genericProblemHandler(content: string, problem: string, start: vscode.Position) : vscode.Range | undefined {
        // look for a termination character
        return this.findTerminator(content, start.line, start.character);
    }

    /**
     * Clears currently registered errors from the diagnostics/problems tab n VSCode
     * @param manifest The deployment or destructive changes manifest
     */
    protected clearPreviousErrors(files : Iterable<string | vscode.Uri>) : void {
        for (const file of files) {
            this.clearMessages(typeof file === 'string' ? vscode.Uri.file(file) : file);
        }
    }

    /**
     * Clears all the errors and warning for the specified file.
     * @param file 
     */
    protected clearMessages(file: vscode.Uri) : void {
        const currentMessages = this.getDiagnostics().get(file);
        if (currentMessages) {
            this.getDiagnostics().set(file, []);
        }
    }

    protected addError(file: vscode.Uri, range: vscode.Range, message: string) : void {
        this.addMessage(vscode.DiagnosticSeverity.Error, file, range, message);
    }

    protected addWarning(file: vscode.Uri, range: vscode.Range, message: string) : void {
        this.addMessage(vscode.DiagnosticSeverity.Warning, file, range, message);
    }

    protected addMessage(severity: vscode.DiagnosticSeverity, file: vscode.Uri, range : vscode.Range, message : string) : void {
        const currentMessages = this.getDiagnostics().get(file) || [];
        this.getDiagnostics().set(file, [...currentMessages, new vscode.Diagnostic(range, message, severity)]);
    }

    private findSubstring(content: string, lineNumber: number, index: number, needle: string) : vscode.Range | undefined {
        const lines = content.split('\n');
        const column = lines[lineNumber]?.indexOf(needle, index);

        if (column && column != -1) {
            return new vscode.Range(
                new vscode.Position(lineNumber, column),
                new vscode.Position(lineNumber, column+needle.length)
            );
        }
    }

    private findTerminator(content: string, lineNumber: number, index: number, terminationPattern: RegExp = /\W{1}/i) : vscode.Range | undefined {
        const lines = content.split('\n');
        const match = lines[lineNumber]?.substr(index).match(terminationPattern);

        if (match && match.index !== undefined) {
            return new vscode.Range(
                new vscode.Position(lineNumber, index),
                new vscode.Position(lineNumber, index + match.index)
            );
        }
    }
}