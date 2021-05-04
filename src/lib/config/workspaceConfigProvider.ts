import * as vscode from 'vscode';

export interface VscodeWorkspaceConfigProvider {
    getVscodeConfiguration(section: string): vscode.WorkspaceConfiguration;
}
