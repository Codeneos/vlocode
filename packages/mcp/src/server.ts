import { CachedFileSystemAdapter, container, Logger, LogLevel, LogManager, NodeFileSystem, FileSystem, type LogEntry, type LogWriter } from '@vlocode/core';
import {
    InteractiveConnectionProvider,
    SalesforceConnectionProvider,
    SfdxConnectionProvider,
} from '@vlocode/salesforce';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { datapackTools, executeDatapackTool } from './tools/datapacks.js';
import { metadataTools, executeMetadataTool } from './tools/metadata.js';
import { schemaTools, executeSchemaTool } from './tools/schema.js';
import { profileTools, executeProfileTool } from './tools/profiles.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from package.json
let version = '1.0.0';
try {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    version = pkg.version ?? version;
} catch {
    // ignore
}

export interface VlocodeMcpOptions {
    /** SFDX username or alias to connect to Salesforce */
    user?: string;
    /** Salesforce instance URL (e.g. login.salesforce.com) */
    instance?: string;
    /** Log level */
    logLevel?: LogLevel;
}

/**
 * Starts the Vlocode MCP server over stdio.
 *
 * The server exposes tools for deploying and retrieving Vlocity datapacks,
 * describing Salesforce objects, managing profiles, and deploying metadata.
 */
export async function startMcpServer(options: VlocodeMcpOptions = {}) {
    // Configure logging — MCP communicates over stdio so all log output must
    // go to stderr to avoid corrupting the protocol stream.
    const stderrWriter: LogWriter = {
        write({ level, time, category, message }: LogEntry) {
            const ts = (time ?? new Date()).toISOString();
            process.stderr.write(`${ts} [${LogLevel[level]}] [${category}]: ${message}\n`);
        },
    };
    LogManager.registerWriter(stderrWriter);
    LogManager.setGlobalLogLevel(options.logLevel ?? LogLevel.warn);

    const logger = LogManager.get('vlocode-mcp');
    logger.info('Starting Vlocode MCP server v%s', version);

    // Create an isolated DI container for this server instance
    const localContainer = container.create();

    // Register connection provider based on authentication options
    if (options.user) {
        localContainer.add(new SfdxConnectionProvider(options.user), {
            provides: [SalesforceConnectionProvider],
        });
    } else if (options.instance) {
        localContainer.add(
            new InteractiveConnectionProvider(`https://${options.instance}`),
            { provides: [SalesforceConnectionProvider] }
        );
    } else {
        // Fall back to interactive provider using the default Salesforce login URL
        localContainer.add(
            new InteractiveConnectionProvider('https://login.salesforce.com'),
            { provides: [SalesforceConnectionProvider] }
        );
    }

    // Provide a cached file system adapter for loading/writing local files
    localContainer.add(new CachedFileSystemAdapter(new NodeFileSystem()), {
        provides: [FileSystem],
    });

    // Register a named logger in the container
    localContainer.registerProvider(Logger, (receiver) =>
        LogManager.get(receiver ?? 'vlocode-mcp')
    );

    // Register the Vlocity namespace service so namespace placeholders are resolved.
    // Initialization is deferred to the first tool call so the server starts quickly.
    const nsService = localContainer.get(VlocityNamespaceService);
    let nsInitialized = false;

    async function ensureNamespaceInitialized() {
        if (!nsInitialized) {
            await nsService.initialize(localContainer.get(SalesforceConnectionProvider));
            localContainer.add(nsService);
            nsInitialized = true;
        }
    }

    // ------------------------------------------------------------------ //
    // Build the MCP server
    // ------------------------------------------------------------------ //
    const server = new Server(
        { name: 'vlocode', version },
        { capabilities: { tools: {} } }
    );

    // List all available tools
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            ...datapackTools,
            ...metadataTools,
            ...schemaTools,
            ...profileTools,
        ],
    }));

    // Dispatch tool calls to the appropriate handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        try {
            // Initialize the Vlocity namespace service on the first tool call
            await ensureNamespaceInitialized();

            if (datapackTools.some((t) => t.name === name)) {
                return await executeDatapackTool(name, args ?? {}, localContainer);
            }
            if (metadataTools.some((t) => t.name === name)) {
                return await executeMetadataTool(name, args ?? {}, localContainer);
            }
            if (schemaTools.some((t) => t.name === name)) {
                return await executeSchemaTool(name, args ?? {}, localContainer);
            }
            if (profileTools.some((t) => t.name === name)) {
                return await executeProfileTool(name, args ?? {}, localContainer);
            }
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        } catch (err: unknown) {
            if (err instanceof McpError) {
                throw err;
            }
            const message = err instanceof Error ? err.message : String(err);
            return {
                content: [{ type: 'text' as const, text: `Error: ${message}` }],
                isError: true,
            };
        }
    });

    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Vlocode MCP server ready');
}
