import { LogLevel } from '@vlocode/core';
import { startMcpServer, type VlocodeMcpOptions } from './server.js';

/**
 * Parse a minimal set of command-line options for the MCP server.
 * We deliberately keep this lightweight (no Commander dependency)
 * because the MCP server is meant to be embedded in agent configurations.
 */
function parseArgs(argv: string[]): VlocodeMcpOptions {
    const opts: VlocodeMcpOptions = {};

    for (let i = 2; i < argv.length; i++) {
        const arg = argv[i];

        if ((arg === '-u' || arg === '--user') && argv[i + 1]) {
            opts.user = argv[++i];
        } else if ((arg === '-i' || arg === '--instance') && argv[i + 1]) {
            opts.instance = argv[++i];
        } else if (arg === '--debug') {
            opts.logLevel = LogLevel.debug;
        } else if (arg === '--verbose') {
            opts.logLevel = LogLevel.verbose;
        } else if ((arg === '--log-level') && argv[i + 1]) {
            const level = argv[++i].toLowerCase();
            const levelMap: Record<string, LogLevel> = {
                debug: LogLevel.debug,
                verbose: LogLevel.verbose,
                info: LogLevel.info,
                warn: LogLevel.warn,
                error: LogLevel.error,
            };
            opts.logLevel = levelMap[level] ?? LogLevel.warn;
        } else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        }
    }

    return opts;
}

function printHelp() {
    process.stderr.write(
        [
            'Usage: vlocode-mcp [options]',
            '',
            'Start the Vlocode MCP (Model Context Protocol) server over stdio.',
            '',
            'Options:',
            '  -u, --user <username>       SFDX username or alias to connect to Salesforce',
            '  -i, --instance <url>        Salesforce instance URL (default: login.salesforce.com)',
            '  --log-level <level>         Log level: debug | verbose | info | warn | error (default: warn)',
            '  --debug                     Enable debug logging',
            '  --verbose                   Enable verbose logging',
            '  -h, --help                  Show this help message',
            '',
            'MCP tools exposed:',
            '  deploy_datapacks            Deploy Vlocity datapacks from local folders',
            '  retrieve_datapacks          Export Salesforce objects as datapacks',
            '  deploy_metadata             Deploy Salesforce metadata',
            '  list_sobjects               List all Salesforce objects',
            '  describe_sobject            Describe a Salesforce object and its fields',
            '  describe_sobject_field      Describe a specific field on a Salesforce object',
            '  list_profiles               List all Salesforce profiles',
            '  add_fls_to_profile          Add Field Level Security to a profile',
            '',
            'Example VS Code MCP configuration (.vscode/mcp.json):',
            '  {',
            '    "servers": {',
            '      "vlocode": {',
            '        "type": "stdio",',
            '        "command": "npx",',
            '        "args": ["-y", "@vlocode/mcp", "--user", "myorg@example.com"]',
            '      }',
            '    }',
            '  }',
        ].join('\n') + '\n'
    );
}

const options = parseArgs(process.argv);
await startMcpServer(options);
