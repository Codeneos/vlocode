import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';
import { container, injectable } from '@vlocode/core';
import { VlocodeCommand } from '../constants';
import { cache } from '@vlocode/util';
import { ApexSourceStatus, ApexTestCoverage } from 'lib/salesforce/apexSourceStatus';

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

    private get sourceStatus() {
        return container.get(ApexSourceStatus);
    }

    constructor(private readonly vlocode: VlocodeService) {
    }

    public static register(service: VlocodeService) {
        const lens = container.get(TestCoverageLensProvider);
        service.registerDisposable(
            vscode.languages.registerCodeLensProvider(lens.documentFilter, lens)
        );
    }

    public async provideCodeLenses(document: vscode.TextDocument) {
        const details = this.sourceStatus.classNameFromDocument(document);
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

    @cache({ ttl: 30 })
    private getCoverage(className: string) {
        return this.sourceStatus.codeCoverage(className)
    }

    public async resolveCodeLens(codeLens: TestCoverageCodeLens) {
        return codeLens;
    }
}

class TestCoverageCodeLens extends vscode.CodeLens {
    constructor(range: vscode.Range, public readonly className: string, coverageDetails: ApexTestCoverage) {
        super(range, {
            title: `${TestCoverageCodeLens.getCoveragePercentage(coverageDetails)}% Test Coverage`,
            command: VlocodeCommand.apexToggleCoverage,
            arguments: [ coverageDetails ]
        });
    }

    /**
     * Get the coverage percentage for the specified coverage details in the format of 0.0 - 100.0.
     * 100.0 means all lines are covered and 0.0 means no lines are covered.
     * @param coverageDetails 
     * @returns 
     */
    static getCoveragePercentage(coverageDetails: ApexTestCoverage) {
        return Math.round(
            coverageDetails.coveredLines.length /
            (coverageDetails.coveredLines.length + coverageDetails.uncoveredLines.length) * 100
        );
    }
}