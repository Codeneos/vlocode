import * as vscode from 'vscode';

/**
 * 
09:41:19.369 (369138479)|METHOD_ENTRY|[1]|01p0Y00000O9SLP|OrderRepository.OrderRepository()
09:41:19.369 (369244047)|METHOD_EXIT|[1]|OrderRepository
09:41:19.369 (369309631)|CONSTRUCTOR_ENTRY|[17]|01p0Y00000O9SLP|<init>()|OrderRepository
09:41:19.369 (369582949)|CONSTRUCTOR_EXIT|[17]|01p0Y00000O9SLP|<init>()|OrderRepository
09:41:19.369 (369616240)|CONSTRUCTOR_ENTRY|[17]|01p5E000001BvvA|<init>(IOrderRepository)|OrderItemsController
09:41:19.369 (369653962)|METHOD_ENTRY|[4]|01p5E000001FJwa|VlocityController.VlocityController()
09:41:19.369 (369667080)|METHOD_EXIT|[4]|VlocityController
09:41:19.369 (369616240)|CONSTRUCTOR_EXIT|[17]|01p5E000001BvvA|<init>(IOrderRepository)|OrderItemsController
 */

/**
 * Provides Symbol and Outline information for Salesforce APEX logs
 */
export class ApexLogSymbolProvider implements vscode.DocumentSymbolProvider {

    readonly functionPattern = /^(?<time>[\d+:.]+) \(\d+\)\|(?<type>CONSTRUCTOR|METHOD)_(?<mode>ENTRY|EXIT)\|\[\d+\]\|(?<name>.*)$$/;

    public async provideDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
        const symbols = this.parseSymbols(this.getDocumentLineIterator(document));
        return symbols;
    }

    private parseSymbols(documentLines: Iterable<vscode.TextLine>) : vscode.DocumentSymbol[] {
        const symbols = new Array<vscode.DocumentSymbol>();

        for (const line of documentLines) {
            const text = line.text;
            const match = line.text.match(this.functionPattern);

            if (match && match.groups) {
                const type = match.groups.type === 'CONSTRUCTOR' ? vscode.SymbolKind.Constructor : vscode.SymbolKind.Method;
                const symbolName = match.groups.name.split('|').pop() || 'NAME_MISSING';
                const symbolDetail = match.groups.name.split('|').slice(0, 2).join('|');

                const symbol = new vscode.DocumentSymbol(
                    symbolName,
                    symbolDetail,
                    type,
                    line.range,
                    line.range
                );

                if (match.groups.mode === 'ENTRY') {
                    symbol.children.push(...this.parseSymbols(documentLines));
                } else {
                    break;
                }

                symbols.push(symbol);
            }
        }

        return symbols;
    }

    private getDocumentLineIterator(document: vscode.TextDocument) : IterableIterator<vscode.TextLine> {
        return {
            index: 0,
            next: function() {
                if (this.index >= document.lineCount) {
                    return { value: undefined, done: true };
                }
                return { value: document.lineAt(this.index++), done: false };
            },
            [Symbol.iterator]: function() {
                return this;
            }
        };
    }
}