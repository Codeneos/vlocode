import 'jest';
import * as vscode from 'vscode';

import { Logger } from '@vlocode/core';
import { observeArray } from '@vlocode/util';
import VlocodeService from '../lib/vlocodeService';

describe('VlocodeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    interface TestServiceState {
        activities: VlocodeService['activities'];
        disposables: { dispose(): unknown }[];
        logger: Pick<Logger, 'debug' | 'error'>;
    }

    function createService(): VlocodeService {
        const service = Object.create(VlocodeService.prototype) as VlocodeService;
        Object.assign(service, {
            activities: observeArray([]),
            disposables: [],
            logger: Logger.null
        } satisfies TestServiceState);
        return service;
    }

    describe('validateSalesforceConnectivity', () => {
        it('asks for org selection before attempting initialization', async () => {
            const service = createService();
            const initializeConnection = jest.spyOn(service, 'initializeConnection');

            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);

            await expect(service.validateSalesforceConnectivity()).resolves.toBe(
                'Select a Salesforce instance for this workspace to use Vlocode'
            );
            expect(initializeConnection).not.toHaveBeenCalled();
        });
    });

    describe('withActivity', () => {
        it('accumulates fractional absolute progress increments for more than 100 steps', async () => {
            const service = createService();
            const reports: Array<{ increment?: number }> = [];

            (vscode.window.withProgress as jest.Mock).mockImplementation(async (_options, task) => {
                return task({
                    report: jest.fn(report => reports.push(report))
                }, {
                    isCancellationRequested: false,
                    onCancellationRequested: jest.fn()
                });
            });

            await service.withActivity({ progressTitle: 'Exporting 180 datapacks...' }, async progress => {
                for (let index = 0; index <= 180; index++) {
                    progress.report({ progress: index, total: 180 });
                }
            });

            const reportedProgress = reports.reduce((total, report) => total + (report.increment ?? 0), 0);

            expect(reportedProgress).toBe(100);
            expect(reports.some(report => (report.increment ?? 0) > 0)).toBe(true);
        });
    });
});
