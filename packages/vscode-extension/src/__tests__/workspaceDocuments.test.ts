import 'jest';
import * as vscode from 'vscode';

import { WorkspaceDocuments } from '../lib/workspaceDocuments';

describe('WorkspaceDocuments', () => {
    const textDocuments = vscode.workspace.textDocuments as vscode.TextDocument[];

    afterEach(() => {
        textDocuments.splice(0);
    });

    it('saves only dirty open documents in the source graph', async () => {
        const source = textDocument('/project/IntegrationProcedure/Test/Test_DataPack.json', true);
        const cleanSource = textDocument('/project/IntegrationProcedure/Test/Test_Element.json', false);
        const unrelated = textDocument('/project/Other.json', true);
        textDocuments.push(source.document, cleanSource.document, unrelated.document);

        await WorkspaceDocuments.saveOpenDocuments(new Set([
            WorkspaceDocuments.normalizeFileName(source.document.uri.fsPath),
            WorkspaceDocuments.normalizeFileName(cleanSource.document.uri.fsPath)
        ]));

        expect(source.save).toHaveBeenCalledTimes(1);
        expect(cleanSource.save).not.toHaveBeenCalled();
        expect(unrelated.save).not.toHaveBeenCalled();
    });
});

function textDocument(fileName: string, isDirty: boolean) {
    const save = jest.fn().mockResolvedValue(true);
    return {
        document: {
            uri: vscode.Uri.file(fileName),
            isDirty,
            getText: () => '',
            save
        } as vscode.TextDocument,
        save
    };
}
