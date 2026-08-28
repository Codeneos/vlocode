import 'jest';
import * as vscode from 'vscode';

import { ModelBackedDocument } from '../webviews/modelBackedDocument';

describe('ModelBackedDocument source synchronization', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('cancels a pending designer write when the source changes', async () => {
        const document = createDocument();
        const write = jest.fn().mockResolvedValue(undefined);
        const reload = jest.fn().mockResolvedValue(undefined);

        document.scheduleSourceWrite(write);
        document.scheduleSourceReload(reload);
        await jest.runAllTimersAsync();

        expect(write).not.toHaveBeenCalled();
        expect(reload).toHaveBeenCalledTimes(1);
    });

    it('cancels a pending source reload when the designer changes', async () => {
        const document = createDocument();
        const write = jest.fn().mockResolvedValue(undefined);
        const reload = jest.fn().mockResolvedValue(undefined);

        document.scheduleSourceReload(reload);
        document.scheduleSourceWrite(write);
        await jest.runAllTimersAsync();

        expect(reload).not.toHaveBeenCalled();
        expect(write).toHaveBeenCalledTimes(1);
    });

    it('cancels a pending designer write before an immediate save synchronization', async () => {
        const document = createDocument();
        const write = jest.fn().mockResolvedValue(undefined);

        document.scheduleSourceWrite(write);
        document.cancelSourceWrite();
        await jest.runAllTimersAsync();

        expect(write).not.toHaveBeenCalled();
    });
});

function createDocument() {
    const uri = vscode.Uri.file('/project/IntegrationProcedure/Test/Test_DataPack.json');
    return new ModelBackedDocument(uri, { model: {}, uri });
}
