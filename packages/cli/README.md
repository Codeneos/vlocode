[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fcli)

# vlocode-cli &mdash; a hyper-fast :rocket: Vlocity Datapack deployment CLI

A stand-alone command-line tool for deploying, exporting, activating and converting **Vlocity / OmniStudio Datapacks** and related metadata against any Salesforce org. Built as a thin front-end around [`@vlocode/vlocity-deploy`](../vlocity-deploy), [`@vlocode/omniscript`](../omniscript) and [`@vlocode/salesforce`](../salesforce) &mdash; no dependency on the Vlocity Build Tools.

## Why use it?

-   :rocket: **10&ndash;20&times; faster** than the Vlocity Build Tools / DX on typical projects
-   :computer: Dependency resolution and record conversion happen **client-side**
-   :rainbow: **True delta** &mdash; compares source against the org and only deploys what actually changed
-   :package: Single self-contained binary &mdash; trivial to drop into CI/CD
-   :lock: Reproducible builds &mdash; all dependencies are bundled and pinned

## What it does *not* do

-   It does not generate FlexCard LWC components (planned)
-   It is a CLI; for a UI use the [Vlocode VS Code extension](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode)

## Install

```shell
npm i -g @vlocode/cli
```

> If you intend to script against the deployment logic from your own Node project, depend on [`@vlocode/vlocity-deploy`](../vlocity-deploy) directly &mdash; this CLI is bundled and not meant to be imported as a library.

## Quick start

Deploy a folder of Datapacks via interactive OAuth (production orgs need `--instance login.salesforce.com`):

```shell
vlocode deploy ./path/to/datapacks
```

Deploy using an existing SFDX alias or username:

```shell
vlocode deploy ./path/to/datapacks -u my-sandbox
```

Export a single Datapack from the org:

```shell
vlocode export 01t000000000001 -t Product2 -u my-sandbox
```

Re-activate every OmniScript whose type starts with `MACD/`:

```shell
vlocode activate "MACD/*" -u my-sandbox
```

## Global options

Every command supports the following options on top of its own:

| Option | Default | Description |
| --- | --- | --- |
| `-v, --verbose` | `false` | Enable more detailed verbose logging. |
| `--debug` | `false` | Print the call stack when an unhandled error occurs. |
| `-h, --help` | &mdash; | Show help for the command. |

Commands that talk to Salesforce additionally support the connection options below (any command marked *(Salesforce)*).

| Option | Default | Description |
| --- | --- | --- |
| `-u, --user <username>` | &mdash; | Salesforce username or alias to authenticate with. When omitted, an interactive OAuth flow opens in the browser. |
| `-i, --instance <url>` | `test.salesforce.com` | Login host for the interactive OAuth flow. Use `login.salesforce.com` for production orgs. |
| `--record-session [file]` | &mdash; | Record the interaction with Salesforce to a session log so it can be replayed later. Conflicts with `--replay-session`. |
| `--replay-session <file>` | &mdash; | Replay a previously recorded session log instead of hitting Salesforce. Conflicts with `--record-session`. |

## Commands

Run `vlocode --help` for the full list, or `vlocode <command> --help` for details.

### `vlocode deploy` &mdash; deploy Datapacks *(Salesforce)*

```text
Usage: vlocode deploy [options] <paths..>

Deploy datapacks to Salesforce

Arguments:
  paths   one or more folders or files containing the datapacks to deploy
```

| Option | Default | Description |
| --- | --- | --- |
| `--purge-dependencies` | `false` | After deploying a primary record, also delete dependent child records linked through lookup relationships (in addition to those without a matching key). Example: when deploying a `Product2` datapack this removes child item records in the target org that look up to it. |
| `--lookup-failed` | `false` | If a dependency record fails to deploy, look up an existing record in the org that matches the lookup requirements. |
| `--allow-unresolved` | `false` | Continue deploying a datapack when a dependency cannot be resolved. The field carrying the missing dependency is set to `null`. Can cause inconsistent data &mdash; use only to unblock deployments. |
| `--retry-count <count>` | `1` | Number of times each record deployment is retried before being marked failed. |
| `--bulk-api` | `false` | Use the Salesforce Bulk API for inserts and updates. Significantly slower than the standard API; mostly useful to reduce callouts. |
| `--delta` | `false` | Compare the source datapacks against the org and only deploy the ones that changed. |
| `--strict-order` | `false` | Enforce strict Datapack-level ordering instead of record-level. Slower but improves compatibility when you hit ordering issues. |
| `--skip-lwc` | `false` | Skip LWC activation for LWC-enabled OmniScripts. |
| `--use-metadata-api` | `false` | Deploy LWC components via the Metadata API (slower) instead of the Tooling API. |
| `--remote-script-activation` | `false` | Activate OmniScripts via anonymous APEX on the server. By default Vlocode generates definitions locally, which is faster and more reliable. |
| `-y, --continue-on-error` | `false` | Continue deploying when one of the datapacks fails to load. By default any load/convert error aborts the deployment before changes are made. |

### `vlocode activate` &mdash; activate OmniScripts *(Salesforce)*

```text
Usage: vlocode activate [options] [scriptFilter]

Activate OmniScripts in Salesforce and deploy associated LWC components

Arguments:
  scriptFilter   Salesforce Id, or a "<type>/<subType>(/<language>)" filter. Supports
                 wildcards (e.g. "MACD/*") to activate multiple scripts.
```

| Option | Default | Description |
| --- | --- | --- |
| `--parallel-activations` | `4` | Number of activations to run in parallel. |
| `--skip-lwc` | `false` | Skip LWC activation for LWC-enabled OmniScripts. |
| `--use-metadata-api` | `false` | Deploy LWC components via the Metadata API instead of the (faster) Tooling API. |
| `--skip-reactivate-dependencies` | `false` | Skip re-activating parent scripts that embed the script being activated. By default, parents that embed a reusable script are re-activated automatically. |
| `--remote-activation` | `false` | Activate OmniScripts via anonymous APEX. By default Vlocode generates definitions locally. |
| `--debug-activation` | `false` | Save the generated script definitions as a JSON file. Useful for comparing local vs. remote activation output. |

### `vlocode export` &mdash; export Datapacks *(Salesforce)*

```text
Usage: vlocode export [options] [ids...]

Export an object as datapack from Salesforce

Arguments:
  ids   one or more Salesforce record IDs to export
```

| Option | Default | Description |
| --- | --- | --- |
| `-d, --export-definitions <file>` | &mdash; | YAML or JSON file with export definitions describing how objects expand into datapacks. |
| `-f, --file <file>` | &mdash; | YAML export file with one or more datapack queries. Conflicts with `--query`. |
| `-e, --expand` | `false` | After exporting, expand each datapack into separate files following the export definitions. |
| `-q, --query <query-string>` | &mdash; | SOQL query to use instead of record IDs. Conflicts with `--file`. |
| `-t, --datapack-type <type>` | &mdash; | Datapack type when exporting by ID or a single query. |
| `--folder <folder>` | `./` | Folder where exported datapacks are written. |
| `--depth <depth>` | &mdash; | Dependency export depth. Use `-1` to include all transitive dependencies. |

### `vlocode bulk-export` &mdash; Bulk API v2 data export *(Salesforce)*

```text
Usage: vlocode bulk-export [options] [sobject]

Export data from Salesforce using the Bulk API v2 and output as NDJSON

Arguments:
  sobject   SObject name to query (used only when neither --query nor --file is given)
```

| Option | Default | Description |
| --- | --- | --- |
| `-o, --output <file>` | **required** | Path to the output NDJSON file. |
| `-q, --query <query>` | &mdash; | SOQL query string to execute. Conflicts with `--file`. |
| `-f, --file <file>` | &mdash; | Path to a file containing a SOQL query. Conflicts with `--query`. |
| `-l, --limit <number>` | &mdash; | Limit the number of records to export. Only applies when an SObject name is provided. |
| `--include-deleted` | `false` | Include deleted records in the query (uses `queryAll`). |
| `--chunk-size <size>` | `50000` | Number of records to retrieve per API call. |

### `vlocode convert` &mdash; convert legacy Datapacks to OmniStudio *(Salesforce)*

```text
Usage: vlocode convert [options] <paths..>

Convert Managed runtime OmniScript datapacks to native OmniProcess datapacks

Arguments:
  paths   one or more folders or files containing the datapacks to convert
```

Converts Vlocity (`vlocity_cmt__`) OmniScript datapacks into native OmniStudio (`OmniProcess`) datapacks. Uses only the global and Salesforce connection options listed above.

### `vlocode build-export-definitions` &mdash; generate export YAML *(Salesforce)*

```text
Usage: vlocode build-export-definitions [options]

Generate DatapackExportDefinition YAML from DRMapItem migration records
```

| Option | Default | Description |
| --- | --- | --- |
| `-e, --expand-definition <file>` | &mdash; | Optional path to a `DatapacksExpandDefinition` YAML file that controls how datapacks are split into files. |
| `-x, --expanded` | `false` | Write one YAML file per datapack definition instead of a single combined file. |
| `-o, --output <file>` | `./export-definitions.yaml` | Output YAML path used when `--expanded` is *not* set. |
| `-d, --output-dir <dir>` | `./datapack-export-definitions` | Output directory used when `--expanded` is set. |

### `vlocode impacted-tests` &mdash; find impacted APEX tests

```text
Usage: vlocode impacted-tests [options] <folders...>

Find impacted unit tests for a given set of APEX classes

Arguments:
  folders   one or more folders containing the APEX classes and triggers to parse
```

| Option | Default | Description |
| --- | --- | --- |
| `--classes <classes...>` | &mdash; | Classes to look up impacted tests for. If omitted, the impact map is built for every class found. |
| `--output <file>` | `impactedTests.json` | Path to the JSON file containing the impacted-tests map. |

This command parses APEX source locally and does not need a Salesforce connection.

## FAQ

**Q: Does Vlocode deploy LWC-enabled OmniScripts?**
A: Yes. Vlocode deploys the OmniScript, compiles the LWC locally and deploys it via the Tooling API (default) or the Metadata API. The Tooling API can run in parallel to an ongoing metadata deployment.

**Q: Does Vlocode honour custom Datapack fields that are not part of the standard definition?**
A: Yes. Vlocode loads the Datapack, matches its fields against the SObject schema in the target org, deploys the ones that exist, and reports errors for the ones that do not.

**Q: Vlocode does not delete Product Child Items (PCI) that I removed from the Datapack &mdash; why?**
A: Vlocode is safe-by-default and does not delete records unless asked to. The recommended approach for the product hierarchy is to **disable** a PCI rather than delete it, because deletions have cascading effects on cached content and existing Assets. For non-production orgs you can pass `--purge-dependencies` to delete embedded records before re-deploying.

**Q: Should I prefer `--bulk-api` for production deployments?**
A: No. The Bulk API runs at lower priority and depends on available org resources, so its performance is more variable than the standard Collections API. Use it to save API limits, not to go faster.

**Q: When I activate my OmniScript from the UI it looks different from the one deployed by Vlocode &mdash; why?**
A: By default Vlocode generates the script definition locally instead of calling Vlocity's remote APEX activation. The implementation is well-tested but the OmniStudio managed package keeps evolving, so mismatches are possible. If you hit one, fall back to `--remote-script-activation` and please open a bug so we can update the local generator.

**Q: Does Vlocode compile FlexCards into LWC components?**
A: Not yet. The activation logic is significantly more involved than OmniScript and is still being ported. The VS Code extension can activate FlexCards via the standard Vlocity flow in the meantime.

**Q: We want help adopting Vlocode on a project &mdash; can you support us?**
A: Yes, support engagements are available on request.
