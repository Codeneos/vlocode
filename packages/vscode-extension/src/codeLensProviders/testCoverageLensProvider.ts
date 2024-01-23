import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, injectable } from '@vlocode/core';
import { VlocodeCommand } from '../constants';
import { ApexTestCoverage } from '@vlocode/salesforce';
import { TimedMap, cache } from '@vlocode/util';

/**
 * Provides a code lens to show the test coverage for the current class
 * only shows the code lens when there is coverage data available
 */
@injectable()
export class TestCoverageLensProvider implements vscode.CodeLensProvider<TestCoverageCodeLens> {

    private readonly documentFilter : Array<vscode.DocumentFilter> = [
        { pattern: '**/*.{cls}' },
        { language: 'apex' }
    ];
    private readonly regex = /^[a-z ]*class ([a-z0-9]+)/i;

    constructor(private readonly vlocode: VlocodeService) {
    }

    public static register(service: VlocodeService) {
        const lens = container.get(TestCoverageLensProvider);
        service.registerDisposable(
            vscode.languages.registerCodeLensProvider(lens.documentFilter, lens)
        );
    }

    private getClassName(document: vscode.TextDocument) {
        if (!document.uri.path.endsWith('.cls')) {
            return;
        }

        for (let i = 0; i < Math.min(document.lineCount, 30); i++) {
            const line = document.lineAt(i);
            const match = line.text.match(this.regex);
            if (match) {
                return { range: line.range, className: match[1] }
            }
        }
    }

    public async provideCodeLenses(document: vscode.TextDocument) {
        const details = this.getClassName(document);
        if (!details) {
            return;
        }

        const coverageDetails = await this.getCoverage(details.className);
        if (coverageDetails) {
            return [
                new TestCoverageCodeLens(details.range, details.className, coverageDetails)
            ];
        }
    }

    @cache({ ttl: 60 * 5 })
    private getCoverage(className: string) {
        return this.vlocode.salesforceService.getApexCodeCoverage(className)
    }

    public async resolveCodeLens(codeLens: TestCoverageCodeLens) {
        return codeLens;
    }
}

class TestCoverageCodeLens extends vscode.CodeLens {
    constructor(range: vscode.Range, public readonly className: string, coverageDetails: ApexTestCoverage) {
        super(range, {
            title: 'Test Coverage',
            command: VlocodeCommand.apexToggleCoverage,
            arguments: [ coverageDetails ]
        });
    }
}