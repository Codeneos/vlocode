import { assert, expect } from 'chai';
import { ApexLogSymbolProvider } from '@root/symbolProviders/apexLogSymbolProvider';
import * as vscode from 'vscode';

const apexLogContent = `09:41:19.369 (369138479)|METHOD_ENTRY|[1]|01p0Y00000O9SLP|OrderRepository.OrderRepository()
09:41:19.369 (369244047)|METHOD_EXIT|[1]|OrderRepository
09:41:19.369 (369309631)|CONSTRUCTOR_ENTRY|[17]|01p0Y00000O9SLP|<init>()|OrderRepository
09:41:19.369 (369582949)|CONSTRUCTOR_EXIT|[17]|01p0Y00000O9SLP|<init>()|OrderRepository
09:41:19.369 (369616240)|CONSTRUCTOR_ENTRY|[17]|01p5E000001BvvA|<init>(IOrderRepository)|OrderItemsController
09:41:19.369 (369653962)|METHOD_ENTRY|[4]|01p5E000001FJwa|VlocityController.VlocityController()
09:41:19.369 (369667080)|USER_DEBUG|[4]|Hello
09:41:19.369 (369667080)|METHOD_EXIT|[4]|VlocityController
09:41:19.369 (369616240)|CONSTRUCTOR_EXIT|[17]|01p5E000001BvvA|<init>(IOrderRepository)|OrderItemsController`;

describe('ApexLogSymbolProvider', () => {
    describe('#provideDocumentSymbols', () => {

        it('should parse APEX log into valid symbol hiearhcy', async () => {
            const document = await vscode.workspace.openTextDocument({ content: apexLogContent });
            const sut = new ApexLogSymbolProvider();
            const result = await sut.provideDocumentSymbols(document);

            // Assert child items creates
            expect(result.length).equals(3);
            expect(result[0].children.length).equals(0);
            expect(result[1].children.length).equals(0);
            expect(result[2].children.length).equals(1);
        });

        it('should set correct symbol types', async () => {
            const document = await vscode.workspace.openTextDocument({ content: apexLogContent });
            const sut = new ApexLogSymbolProvider();
            const result = await sut.provideDocumentSymbols(document);

            // Assert child items creates
            expect(result.length).equals(3);
            expect(result[0].kind).equals(vscode.SymbolKind.Method);
            expect(result[1].kind).equals(vscode.SymbolKind.Constructor);
            expect(result[2].kind).equals(vscode.SymbolKind.Constructor);
        });
    });
});
