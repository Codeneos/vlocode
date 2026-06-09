import * as vscode from 'vscode';

import MetadataCommand from '../metadataCommand';
import type { DeployMessage, DeployResult } from '@vlocode/salesforce';

class TestMetadataCommand extends MetadataCommand {
    public readonly lines: string[] = [];

    public execute() {
        // noop
    }

    public renderDeployResult(result: DeployResult) {
        this.outputDeployResult(result);
    }

    protected getOutputChannel() {
        return {
            appendLine: (message: string) => this.lines.push(message),
            show: jest.fn(),
            dispose: jest.fn()
        } as unknown as vscode.OutputChannel;
    }
}

describe('MetadataCommand', () => {
    it('displays only returned deploy messages', () => {
        const command = new TestMetadataCommand();

        command.renderDeployResult(deployResult({
            componentSuccesses: [
                deployMessage({
                    componentType: 'CustomObject',
                    fullName: 'Account',
                    changed: true
                })
            ]
        }));

        const output = command.lines.join('\n');
        expect(output).toContain('CustomObject');
        expect(output).toContain('Account');
        expect(output).not.toContain('CustomField');
        expect(output).not.toContain('Account.Test_Field__c');
    });

    it('displays returned child deploy messages', () => {
        const command = new TestMetadataCommand();

        command.renderDeployResult(deployResult({
            componentSuccesses: [
                deployMessage({
                    componentType: 'CustomField',
                    fullName: 'Account.Test_Field__c',
                    changed: true
                })
            ]
        }));

        const output = command.lines.join('\n');
        expect(output).toContain('CustomField');
        expect(output).toContain('Account.Test_Field__c');
        expect(output).toContain('Changed');
    });
});

function deployResult(details: Partial<DeployResult['details']>): DeployResult {
    return {
        id: '0Af000000000001',
        done: true,
        success: true,
        status: 'Succeeded',
        numberComponentsDeployed: 1,
        numberComponentsTotal: 1,
        details: {
            componentFailures: [],
            componentSuccesses: [],
            allComponentMessages: [],
            runTestResult: undefined,
            ...details
        }
    } as unknown as DeployResult;
}

function deployMessage(message: Partial<DeployMessage>): DeployMessage {
    return {
        id: null,
        componentType: 'ApexClass',
        fileName: '',
        fullName: 'Test',
        success: true,
        changed: false,
        deleted: false,
        created: false,
        requiresProductionTestRun: false,
        createdDate: '',
        knownPackagingProblem: false,
        forPackageManifestFile: false,
        ...message
    };
}
