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

    readonly functionPattern = /^(?<time>[\d+:.]+) \(\d+\)\|(?<type>CONSTRUCTOR|METHOD|SYSTEM_METHOD)_(?<mode>ENTRY|EXIT)\|\[\d+\]\|(?<name>.*)$/;
    readonly assignmentPattern = /^(?<time>[\d+:.]+) \(\d+\)\|VARIABLE_ASSIGNMENT\|\[\d+\]\|(?<name>.*)$/;

    public provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
        const symbols = this.parseSymbols(this.getDocumentLineIterator(document));
        return symbols;
    }

    private parseSymbols(documentLines: Iterable<vscode.TextLine>) : vscode.DocumentSymbol[] {
        const symbols = new Array<vscode.DocumentSymbol>();

        for (const line of documentLines) {
            const functionMatch = line.text.match(this.functionPattern);
            const assignmentMatch = line.text.match(this.assignmentPattern);

            if (functionMatch?.groups) {
                let type = functionMatch.groups.type === 'CONSTRUCTOR' ? vscode.SymbolKind.Constructor : vscode.SymbolKind.Method;
                const symbolName = functionMatch.groups.name.split('|').pop() || 'NAME_MISSING';
                const symbolDetail = functionMatch.groups.name.split('|').slice(0, 2).join('|');

                if (symbolName.includes('.__sfdc_')) {
                    type = vscode.SymbolKind.Property;
                }

                const symbol = new vscode.DocumentSymbol(
                    symbolName,
                    symbolDetail,
                    type,
                    line.range,
                    line.range
                );

                if (functionMatch.groups.mode === 'ENTRY') {
                    symbol.children.push(...this.parseSymbols(documentLines));
                } else {
                    break;
                }

                symbols.push(symbol);
            }

            if (assignmentMatch?.groups) {
                const type = vscode.SymbolKind.Variable;
                const nameParts = assignmentMatch.groups.name.split('|');
                const symbolName = `${nameParts.shift()} = ${nameParts.shift()}`;
                const symbolDetail = nameParts.join('|');

                symbols.push(new vscode.DocumentSymbol(
                    symbolName,
                    symbolDetail,
                    type,
                    line.range,
                    line.range
                ));
            }
        }

        return symbols;
    }

    private getDocumentLineIterator(document: vscode.TextDocument) : IterableIterator<vscode.TextLine> {
        let index = 0;
        return {
            next: function() {
                if (index >= document.lineCount) {
                    return { value: undefined, done: true };
                }
                return { value: document.lineAt(index++), done: false };
            },
            [Symbol.iterator]: function() {
                return this;
            }
        };
    }
}