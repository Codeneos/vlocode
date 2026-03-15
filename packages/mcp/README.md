# @vlocode/mcp

Vlocode **Model Context Protocol (MCP)** server that enables AI agents (GitHub Copilot, Claude, etc.) to interact with Salesforce and Vlocity datapacks directly from your IDE.

## Features

The server exposes the following tools:

| Tool | Description |
|------|-------------|
| `deploy_datapacks` | Deploy Vlocity datapacks from local folders to Salesforce |
| `retrieve_datapacks` | Export/retrieve Salesforce objects as Vlocity datapacks |
| `deploy_metadata` | Deploy Salesforce metadata (Apex, LWC, etc.) |
| `list_sobjects` | List all Salesforce objects in the connected org |
| `describe_sobject` | Describe a Salesforce object with its fields and metadata |
| `describe_sobject_field` | Describe a specific field on a Salesforce object |
| `list_profiles` | List all Salesforce profiles |
| `add_fls_to_profile` | Add Field Level Security permissions to a profile |

## Installation

```bash
npm install -g @vlocode/mcp
```

## Usage

### Command-line options

```
vlocode-mcp [options]

Options:
  -u, --user <username>   SFDX username or alias to connect to Salesforce
  -i, --instance <url>    Salesforce instance URL (default: login.salesforce.com)
  --log-level <level>     Log level: debug | verbose | info | warn | error
  --debug                 Enable debug logging
  --verbose               Enable verbose logging
  -h, --help              Show help
```

### VS Code MCP configuration

Add the following to your `.vscode/mcp.json` (or VS Code User Settings) to make the Vlocode MCP server available to GitHub Copilot and other agents:

```json
{
  "servers": {
    "vlocode": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@vlocode/mcp", "--user", "myorg@example.com"]
    }
  }
}
```

Replace `myorg@example.com` with your SFDX org username or alias.

### Authentication

The server uses SFDX authentication. Ensure you have authenticated with the target org before starting the server:

```bash
sf org login web --alias myorg
```

## Examples

### Deploy datapacks

An agent can deploy datapacks using the `deploy_datapacks` tool:

```
Deploy the datapacks in ./datapacks/OmniScript to my Salesforce org
```

### Retrieve datapacks

```
Export the OmniScript record with ID a1B000000000000 as a datapack to ./output
```

### Describe a Salesforce object

```
What fields does the Account object have?
```

### Add FLS to a profile

```
Grant read access to Account.Phone and Account.Fax for the Standard profile
```

## License

MIT
