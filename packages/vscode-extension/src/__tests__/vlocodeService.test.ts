import 'jest';
import * as vscode from 'vscode';

import VlocodeService from '../lib/vlocodeService';

describe('VlocodeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateSalesforceConnectivity', () => {
        it('asks for org selection before attempting initialization', async () => {
            const service = Object.create(VlocodeService.prototype) as VlocodeService & {
                sfUsername?: string;
                initializeConnection: jest.Mock;
            };

            service.sfUsername = undefined;
            service.initializeConnection = jest.fn();
            (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);

            await expect(service.validateSalesforceConnectivity()).resolves.toBe(
                'Select a Salesforce instance for this workspace to use Vlocode'
            );
            expect(service.initializeConnection).not.toHaveBeenCalled();
        });
    });
});
