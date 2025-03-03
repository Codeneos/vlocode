import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    TextDocumentSyncKind,
    InitializeResult,
    ServerCapabilities,
    ClientCapabilities,
    TextDocumentChangeEvent,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument'
import { URI } from 'vscode-uri'

import { Apex } from '@vlocode/apex';
import { injectable, Logger, LogManager } from '@vlocode/core';
import path from 'path';

@injectable()
export class ApexLanguageServer {

    /**
     * The name of the cache file used to store the parsed Apex classes
     */
    public static CACHE_FILE = ['.vlocode', 'apex-ls.cache'];

    private documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
    private connection = createConnection(ProposedFeatures.all);
    private workspaceFolders: URI[] = [];
    private clientCapabilities: ClientCapabilities;
    private cacheFile: string | undefined;

    public get hasConfigurationCapability() {
        return !!this.clientCapabilities.workspace && !!this.clientCapabilities.workspace.configuration;
    }

    public get hasWorkspaceFolderCapability() {
        return !!this.clientCapabilities.workspace && !!this.clientCapabilities.workspace.workspaceFolders;
    }

    public get hasDiagnosticRelatedInformationCapability() {
        return !!(
            this.clientCapabilities.textDocument &&
            this.clientCapabilities.textDocument.publishDiagnostics &&
            this.clientCapabilities.textDocument.publishDiagnostics.relatedInformation
        );
    }

    public readonly serverCapabilities: ServerCapabilities = {
        textDocumentSync: {
            change: TextDocumentSyncKind.Incremental,
            openClose: true,
            save: true
        },
        referencesProvider: true,
        completionProvider: {
            resolveProvider: true,
            triggerCharacters: [ '.' ],
            allCommitCharacters: [ '.', ',', '(', ')' ]
        }
    }

    constructor(
        private apex: Apex,
        private logger: Logger = LogManager.get(ApexLanguageServer),
    ) {
    }

    public start() {
        this.connection.onInitialize(this.onConnectionInitialize.bind(this));        
        this.connection.onInitialized(this.onConnectionInitialized.bind(this));
        this.documents.onDidChangeContent(this.onDidChangeContent.bind(this));

        this.documents.listen(this.connection);
        this.connection.listen();
    }

    private onConnectionInitialize(params: InitializeParams): InitializeResult {
        for (const folder of params.workspaceFolders ?? []) {
            this.workspaceFolders.push(URI.parse(folder.uri));
        }
    
        this.clientCapabilities = params.capabilities;

        return {
            capabilities: {
                textDocumentSync: {
                    change: TextDocumentSyncKind.Incremental,
                    openClose: true,
                    save: true
                },
                referencesProvider: true,
                completionProvider: {
                    resolveProvider: true,
                    triggerCharacters: [ '.' ],
                    allCommitCharacters: [ '.', ',', '(', ')' ]
                }
            },
        };
    }

    private async onConnectionInitialized() {
        if (this.hasConfigurationCapability) {
            this.connection.client.register(DidChangeConfigurationNotification.type);
            this.connection.onDidChangeConfiguration(this.onConfigurationChanged.bind(this));
        }
    
        if (this.hasWorkspaceFolderCapability) {
            this.connection.workspace.onDidChangeWorkspaceFolders(this.onWorkspaceFoldersChanged.bind(this));
        }

        if (this.workspaceFolders.length === 0) {
            return;
        }

        // Init WS folders and load cache
        this.cacheFile = path.join(this.workspaceFolders[0].fsPath, ...ApexLanguageServer.CACHE_FILE);
        await this.apex.loadCache(this.cacheFile);
        await this.apex.parseSourcePaths(...this.workspaceFolders.map(ws => ws.fsPath));
        await this.apex.persistCache(this.cacheFile);
    }

    private onConfigurationChanged(/* change: DidChangeConfigurationParams */) {
        this.logger.info('Configuration change event received.');
    }
    
    private onWorkspaceFoldersChanged(/* event: WorkspaceFoldersChangeEvent */) {
        this.logger.info('Workspace folder change event received.');
    }

    private onDidChangeContent(change: TextDocumentChangeEvent<TextDocument>) {
        const documentUri = URI.parse(change.document.uri);
        try {
            this.apex.parseSource(change.document.getText(), documentUri.fsPath);
        } catch(err) {
            this.logger.error('Error while parsing file:', err);
        }
    }

    private async addWorkspaceFolder(folder: URI) {
        if (this.workspaceFolders.push(folder) === 1) {
            this.cacheFile = path.join(this.workspaceFolders[0].fsPath, ...ApexLanguageServer.CACHE_FILE);
            await this.apex.loadCache(this.cacheFile);
        }
        await this.apex.parseSourcePaths(folder.fsPath);
        this.cacheFile && await this.apex.persistCache(this.cacheFile);
    }

    private async removeWorkspaceFolder(folder: URI) {
        const index = this.workspaceFolders.findIndex(ws => ws.fsPath === folder.fsPath);
        if (index >= 0) {
            this.workspaceFolders.splice(index, 1);
        }
    }
}