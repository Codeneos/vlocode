import * as vscode from 'vscode';
import { SalesforceConnectionProvider } from '@vlocode/salesforce';
import { container, injectable, Logger } from '@vlocode/core';
import { cache, clearCache } from '@vlocode/util';

/**
 * Content provider for Apex code from Salesforce using the `apex://` URI scheme.
 * Supports URIs in the format: `apex://<namespace>/<classname>` where namespace is optional.
 * 
 * @author Peter van Gulik <peter.van.gulik@curlybracket.nl>
 * @company Curlybracket
 * 
 * Usage:
 * ```typescript
 * // Register the provider
 * const provider = new SalesforceApexContentProvider(connectionProvider, logger);
 * vscode.workspace.registerTextDocumentContentProvider('apex', provider);
 * 
 * // Use with URIs like:
 * // apex://MyClass
 * // apex://MyNamespace/MyClass
 * const uri = vscode.Uri.parse('apex://MyClass');
 * const content = await provider.provideTextDocumentContent(uri);
 * ```
 */
@injectable.singleton()
export class SalesforceApexContentProvider implements vscode.TextDocumentContentProvider {

    constructor(
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly logger: Logger
    ) {}

    /**
     * Registers the SalesforceApexContentProvider as a text document content provider for the 'apex' scheme.
     * 
     * @param service - An object that provides a `registerDisposable` method for managing disposables within the extension's lifecycle.
     */
    public static register(service: { registerDisposable: (...disposable: vscode.Disposable[]) => void }) {
        const provider = container.get(SalesforceApexContentProvider);
        service.registerDisposable(
            vscode.workspace.registerTextDocumentContentProvider('apex', provider),
            vscode.workspace.onDidChangeTextDocument(async (event) => {
                if (event.document.uri.scheme === 'apex') {
                    await vscode.languages.setTextDocumentLanguage(event.document, 'apex');
                }
            })
        );
    }

    /**
     * Provides the content for the specified Apex URI.
     * @param uri The URI in format apex://<namespace>/<classname> or apex://<classname>
     * @param token Optional cancellation token
     * @returns The Apex class body content
     */
    public async provideTextDocumentContent(
        uri: vscode.Uri, 
        token?: vscode.CancellationToken
    ): Promise<string> {
        try {
            const { namespace, className } = this.parseApexUri(uri);
            return await this.fetchApexClass(namespace, className, token);
        } catch (error) {
            this.logger.error(`Failed to fetch Apex class content for ${uri.toString()}:`, error);
            return `// Error fetching Apex class: ${error instanceof Error ? error.message : String(error)}`;
        }
    }

    /**
     * Parses the Apex URI to extract namespace and class name.
     * @param uri The URI to parse
     * @returns Object containing namespace (optional) and className
     */
    private parseApexUri(uri: vscode.Uri): { namespace?: string; className: string } {
        // URI format: apex://<namespace>/<classname> or apex://<classname>
        const authority = uri.authority;
        const path = uri.path;

        if (path && path.length > 1) {
            // Format: apex://<namespace>/<classname>
            const namespace = authority || undefined;
            const className = path.substring(1); // Remove leading slash
            return { namespace, className };
        } else {
            // Format: apex://<classname>
            const className = authority;
            return { className };
        }
    }

    /**
     * Fetches the Apex class content from Salesforce using the Tooling API.
     * @param namespace Optional namespace
     * @param className The class name to fetch
     * @param token Optional cancellation token
     * @returns The Apex class body
     */
    @cache({ unwrapPromise: true, ttl: 120 }) // Cache for 1 minute
    private async fetchApexClass(
        namespace: string | undefined, 
        className: string, 
        token?: vscode.CancellationToken
    ): Promise<string> {
        const fullClassName = namespace ? `${namespace}__${className}` : className;
        this.logger.debug(`Fetching Apex class: ${fullClassName}`);

        const connection = await this.connectionProvider.getJsForceConnection();

        // Check for cancellation
        if (token?.isCancellationRequested) {
            throw new Error('Request was cancelled');
        }

        // Build the query filter
        const filter: any = { Name: className };
        
        // Add namespace filter if provided
        if (namespace) {
            filter.NamespacePrefix = namespace;
        } else {
            // When no namespace is specified, look for classes without namespace prefix (null)
            filter.NamespacePrefix = null;
        }

        try {
            // Query the ApexClass object using the Tooling API
            const record: any = await connection.tooling.sobject('ApexClass').findOne(
                filter,
                ['Body', 'Name', 'NamespacePrefix']
            );

            if (!record) {
                throw new Error(`Apex class '${fullClassName}' not found in the organization`);
            }

            if (!record.Body) {
                throw new Error(`Apex class '${fullClassName}' has no body content`);
            }

            this.logger.debug(`Successfully fetched Apex class: ${record.Name}`);
            return record.Body;
        } catch (error) {
            this.logger.error(`Failed to fetch Apex class '${fullClassName}':`, error);
            throw error;
        }
    }

    /**
     * Clears the content cache.
     */
    public clearCache(): void {
        clearCache(this);
        this.logger.debug('Apex content cache cleared');
    }
}
