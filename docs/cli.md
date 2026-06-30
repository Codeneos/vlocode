# Vlocode CLI reference

The Vlocode command line interface (`vlocode`) is a fast, dependency-free tool
for exporting, deploying, and activating Salesforce/Vlocity metadata. It is
distributed as the [`@vlocode/cli`](../packages/cli/README.md) npm package and is
designed to run both interactively and unattended in CI/CD pipelines.

This page is the authoritative reference for installation, authentication, global
behaviour, and every command. For task-oriented guides see
[Exporting datapacks](./export.md) and
[Importing / deploying datapacks](./import.md).

## Contents

- [Installation](#installation)
- [Command overview](#command-overview)
- [Authentication](#authentication)
- [Global options](#global-options)
- [Salesforce connection options](#salesforce-connection-options)
- [Logging and diagnostics](#logging-and-diagnostics)
- [Exit codes](#exit-codes)
- [Command reference](#command-reference)
- [Using Vlocode in CI/CD](#using-vlocode-in-cicd)

## Installation

Vlocode CLI ships as a bundled, dependency-pinned build, which makes it fast to
install and gives consistent, reproducible behaviour across environments —
important for CI/CD.

```shell
npm install --global @vlocode/cli
```

Requirements:

| Requirement | Value |
| --- | --- |
| Node.js | `>= 20.0.0` |
| Package | `@vlocode/cli` |
| Command | `vlocode` |

Verify the installation and view the build version:

```shell
vlocode --version       # prints the version and build date
vlocode --help          # lists all commands
vlocode <command> --help
vlocode help <command>  # equivalent to <command> --help
```

> **Library usage.** If you intend to embed the deployment/export engine in your
> own application, depend on
> [`@vlocode/vlocity-deploy`](../packages/vlocity-deploy/README.md) directly
> rather than on the CLI package.

## Command overview

| Command | Summary |
| --- | --- |
| [`deploy`](#vlocode-deploy) | Deploy datapacks from disk into a Salesforce org. |
| [`export`](#vlocode-export) | Export records from an org into datapack files. |
| [`bulk-export`](#vlocode-bulk-export) | Export raw record data via the Bulk API v2 as NDJSON. |
| [`activate`](#vlocode-activate) | Activate OmniScripts and deploy their LWC components. |
| [`convert`](#vlocode-convert) | Convert managed-runtime OmniScript datapacks to native OmniProcess datapacks. |
| [`build-export-definitions`](#vlocode-build-export-definitions) | Generate export-definition YAML from an org's DataRaptor migration configuration. |
| [`impacted-tests`](#vlocode-impacted-tests) | Analyze Apex source to find which unit tests cover a set of classes (offline). |

## Authentication

Every command that connects to Salesforce supports three authentication modes,
selected by which options you provide:

1. **SFDX username or alias** *(recommended for CI/CD)* — reuse an existing
   Salesforce CLI (`sf`/`sfdx`) authorization:

   ```shell
   vlocode deploy ./datapacks --user my-org-alias
   ```

   The org must already be authorized in the Salesforce CLI on the machine
   running Vlocode (for example via `sf org login`).

2. **Interactive OAuth** *(default when `--user` is omitted)* — Vlocode opens a
   browser login against the instance given by `--instance`. The default
   instance is `test.salesforce.com` (sandbox/scratch); for production logins
   pass `--instance login.salesforce.com`:

   ```shell
   vlocode deploy ./datapacks --instance login.salesforce.com
   ```

3. **Session replay** *(offline/testing)* — replay a previously recorded API
   session instead of contacting an org. See
   [Session recording and replay](#session-recording-and-replay).

## Global options

These options are available on **every** command and primarily control logging.

| Option | Description |
| --- | --- |
| `-v, --verbose` | Enable verbose logging. |
| `--debug` | Enable debug logging and print a call stack on unhandled errors. |
| `--log-level <level>` | Set the log level explicitly. Overrides `-v`/`--debug`. One of `debug`, `verbose`, `info`, `warn`, `error`, `fatal`. |
| `--log-file <path>` | Append logs as NDJSON to the given file. See [Logging](#logging-and-diagnostics). |
| `-h, --help` | Display help for the command. |

## Salesforce connection options

These options are available on every command that talks to an org — that is,
all commands **except** [`impacted-tests`](#vlocode-impacted-tests), which works
entirely offline.

| Option | Description |
| --- | --- |
| `-u, --user <username>` | SFDX username or alias of the target org. When omitted, an interactive OAuth login is started. |
| `-i, --instance <url>` | Salesforce instance/login URL for interactive OAuth. Default `test.salesforce.com`. Use `login.salesforce.com` for production. |
| `--record-session` | Record the Salesforce API interaction to a session log for later replay. Conflicts with `--replay-session`. |
| `--replay-session <file>` | Replay a previously recorded session log instead of connecting to an org. Conflicts with `--record-session`. |

### Session recording and replay

Session record/replay captures the HTTP interaction with Salesforce so a run can
be reproduced deterministically — useful for debugging and for building
regression fixtures.

```shell
# Record a deployment's API traffic to a session log
vlocode deploy ./datapacks --user my-org --record-session

# Re-run later against the recorded session, with no org connection
vlocode deploy ./datapacks --replay-session ./vlocode-session-1718000000.log
```

## Logging and diagnostics

Vlocode always writes a structured **NDJSON log file** in addition to console
output, so runs remain auditable even when the console scrollback is lost.

- **Console level.** Defaults to `info`. `-v`/`--verbose` raises it to `verbose`;
  `--debug` raises it to `debug` and includes stack traces. An explicit
  `--log-level` always takes precedence.
- **Log file.** By default logs are appended as NDJSON to
  `./.vlocode/logs/<command>-<timestamp>.log` under the current working
  directory. Override the location with `--log-file <path>`. Each line is a JSON
  object, which is convenient for ingestion into log aggregation tooling.
- **Interactive progress.** Commands with a progress bar (such as
  [`export`](#vlocode-export)) route log lines above the bar so output is not
  corrupted. Use `--no-progress` (on `export`) for plain, line-oriented output
  suitable for CI logs.

> **Tip.** Add `.vlocode/` to your `.gitignore` so generated logs are not
> committed.

## Exit codes

Vlocode is designed to be scriptable: it returns a non-zero exit code on
failure so pipelines fail fast.

| Exit code | Meaning |
| --- | --- |
| `0` | The command completed. |
| `1` | The command terminated with an unhandled error. |

> **Note.** A `deploy` run that finishes but reports per-record errors still
> exits `0`; inspect the deployment summary (and the NDJSON log) to gate a
> pipeline on individual record failures. See
> [Importing / deploying datapacks](./import.md#what-the-command-reports).

## Command reference

### vlocode deploy

Deploy datapacks from one or more folders or files into a Salesforce org. Folders
are scanned recursively for `*_DataPack.json` files. See
[Importing / deploying datapacks](./import.md) for the full workflow and the
deployment pipeline.

```
vlocode deploy <paths...> [options]
```

**Arguments**

| Argument | Description |
| --- | --- |
| `paths...` | One or more folders or datapack files to deploy. |

**Options** (in addition to the [global](#global-options) and
[connection](#salesforce-connection-options) options)

| Option | Default | Description |
| --- | --- | --- |
| `--purge-dependencies` | `false` | After deploying the primary record, delete target child records that have a lookup to it (even those with a matching key). Use to force-replace child collections; not recommended on production. |
| `--lookup-failed` | `false` | Look up the Ids of dependencies that failed to deploy so dependent records can still resolve them. |
| `--allow-unresolved` | `false` | Do not fail a datapack when a dependency cannot be resolved; the field is set to `null` and a warning logged. May produce inconsistent data. |
| `--retry-count <count>` | `1` | Number of times a record deployment is retried before it is failed. |
| `--bulk-api` | `false` | Use the Salesforce Bulk API. Slower; use only to reduce API call-outs. |
| `--delta` | `false` | Only deploy datapacks that differ from the target org. |
| `--strict-order` | `false` | Enforce datapack-level ordering in addition to record-level ordering. Slower but more compatible. |
| `--skip-lwc` | `false` | Skip LWC activation for LWC-enabled OmniScripts. |
| `--use-metadata-api` | `false` | Deploy LWC via the Metadata API instead of the Tooling API. |
| `--remote-script-activation` | `false` | Activate OmniScripts via anonymous Apex instead of local script generation. |
| `-y, --continue-on-error` | `false` | Continue with datapacks that loaded successfully even if others failed to load/convert. |

```shell
# Deploy a folder tree using an SFDX alias
vlocode deploy ./datapacks --user my-org

# Deploy only changed datapacks to production
vlocode deploy ./datapacks --instance login.salesforce.com --delta
```

### vlocode export

Export records from an org into datapack files, by Id, by SOQL query, or driven
by a YAML manifest. See [Exporting datapacks](./export.md) for the full workflow,
and [Building export definitions](./export-definitions.md) for the definition
format.

```
vlocode export [ids...] [options]
```

**Arguments**

| Argument | Description |
| --- | --- |
| `ids...` | Optional list of record Ids to export. |

**Options** (in addition to the [global](#global-options) and
[connection](#salesforce-connection-options) options)

| Option | Default | Description |
| --- | --- | --- |
| `--definitions <file>` | — | YAML/JSON export definitions describing how records become datapacks. |
| `-f, --file <file>` | — | YAML export manifest with datapack queries. Conflicts with `--query`. |
| `-e, --expand` | `false` | Expand each datapack into a folder of separate files. |
| `-q, --query <soql>` | — | SOQL query selecting records to export (must select `Id`). Conflicts with `--file`. |
| `-t, --type <type>` | — | Datapack type to apply when exporting Ids or a single query. |
| `-o, --output <dir>` | `./` | Output folder for exported datapacks. |
| `-d, --depth <n>` | — | Dependency export depth; `-1` follows all dependencies. |
| `--suppress-nulls` | `false` | Omit null field values from the export. |
| `--fail-on-error` | `false` | Abort the export if any datapack errors (otherwise the record is skipped). |
| `--no-progress` | — | Disable the interactive progress bar; print plain output. |

```shell
vlocode export \
  --definitions ./export-definitions.yaml \
  --type Product2 \
  --query "SELECT Id FROM Product2 WHERE IsActive = true" \
  --depth -1 --expand --output ./datapacks --user my-org
```

### vlocode bulk-export

Export raw record data using the Salesforce **Bulk API v2**, streaming results to
a newline-delimited JSON (NDJSON) file. This is a *data* export (one JSON object
per record), distinct from datapack export — use it for large data extracts, not
for metadata transport.

```
vlocode bulk-export [sobject] [options]
```

**Arguments**

| Argument | Description |
| --- | --- |
| `sobject` | SObject to query (`SELECT Id FROM <sobject>`) when no `--query`/`--file` is given. |

**Options** (in addition to the [global](#global-options) and
[connection](#salesforce-connection-options) options)

| Option | Default | Description |
| --- | --- | --- |
| `-o, --output <file>` | *required* | Path to the output NDJSON file. |
| `-q, --query <query>` | — | SOQL query to execute. Conflicts with `--file`. |
| `-f, --file <file>` | — | Path to a file containing a SOQL query. Conflicts with `--query`. |
| `-l, --limit <number>` | — | Limit the number of records (only when an SObject name is given). |
| `--include-deleted` | `false` | Include deleted/archived records (`queryAll`). |
| `--chunk-size <size>` | `50000` | Number of records retrieved per API call. |

```shell
vlocode bulk-export Account --output ./accounts.ndjson --user my-org
vlocode bulk-export --query "SELECT Id, Name FROM Product2" -o ./products.ndjson -u my-org
```

### vlocode activate

Activate OmniScripts in an org and deploy their associated LWC components.
Dependencies between scripts are respected: when a reusable OmniScript is
activated, the scripts that embed it are reactivated unless suppressed.

```
vlocode activate [scriptFilter] [options]
```

**Arguments**

| Argument | Description |
| --- | --- |
| `scriptFilter` | A Salesforce Id, or a `type/subType/language` filter with wildcard support (e.g. `MACD/` matches all sub-types). Omit to consider all scripts. |

**Options** (in addition to the [global](#global-options) and
[connection](#salesforce-connection-options) options)

| Option | Default | Description |
| --- | --- | --- |
| `--parallel-activations` | `4` | Number of activations to run in parallel. |
| `--skip-lwc` | `false` | Skip LWC activation for LWC-enabled OmniScripts. |
| `--use-metadata-api` | `false` | Deploy LWC via the Metadata API instead of the Tooling API. |
| `--skip-reactivate-dependencies` | `false` | Do not reactivate parent scripts that embed the activated scripts. |
| `--remote-activation` | `false` | Activate via anonymous Apex instead of local script generation. |
| `--debug-activation` | `false` | Save script definitions as JSON before/after activation for comparison. |

```shell
vlocode activate "MACD/" --user my-org
```

### vlocode convert

Convert managed-runtime OmniScript datapacks into native OmniProcess datapacks.

```
vlocode convert <paths...> [options]
```

**Arguments**

| Argument | Description |
| --- | --- |
| `paths...` | One or more folders or datapack files to convert. |

Supports the [global](#global-options) and
[connection](#salesforce-connection-options) options.

```shell
vlocode convert ./datapacks --user my-org
```

### vlocode build-export-definitions

Generate a `DatapackExportDefinition` YAML file from an org's DataRaptor
migration configuration (`DRMapItem` records). Use this to bootstrap an
[export-definitions file](./export-definitions.md) instead of authoring it by
hand, then trim and customize the result.

```
vlocode build-export-definitions [options]
```

**Options** (in addition to the [global](#global-options) and
[connection](#salesforce-connection-options) options)

| Option | Default | Description |
| --- | --- | --- |
| `-e, --expand-definition <file>` | — | Optional `datapacksexpanddefinition` YAML to merge expansion settings from. |
| `-x, --expanded` | `false` | Write one YAML file per datapack definition instead of a single combined file. |
| `-o, --output <file>` | `./export-definitions.yaml` | Output file for combined mode. |
| `-d, --output-dir <dir>` | `./datapack-export-definitions` | Output directory for expanded (`-x`) mode. |

```shell
vlocode build-export-definitions --output ./export-definitions.yaml --user my-org
```

### vlocode impacted-tests

Parse Apex classes and triggers to determine which unit tests cover a given set
of classes, directly or indirectly. This command runs **offline** — it analyzes
local source and does not connect to an org, so it has no connection options.

```
vlocode impacted-tests <folders...> [options]
```

**Arguments**

| Argument | Description |
| --- | --- |
| `folders...` | One or more folders containing Apex class (`.cls`) and trigger (`.trigger`) files. |

**Options** (in addition to the [global](#global-options) options)

| Option | Default | Description |
| --- | --- | --- |
| `--classes <classes...>` | — | Classes to report impacted tests for. |
| `--output <file>` | `impactedTests.json` | Path to write the full analysis as JSON. |

```shell
vlocode impacted-tests ./force-app/main/default/classes --classes AccountService
```

## Using Vlocode in CI/CD

Vlocode's bundled distribution, SFDX-based authentication, NDJSON logging, and
non-zero exit codes make it straightforward to run in a pipeline. A typical
deployment stage:

```shell
# 1. Authorize the target org with the Salesforce CLI (once per runner/session)
sf org login sfdx-url --sfdx-url-file ./AUTH_URL.txt --alias target-org

# 2. Install Vlocode
npm install --global @vlocode/cli

# 3. Deploy, failing the build on unhandled errors
vlocode deploy ./datapacks \
  --user target-org \
  --delta \
  --no-progress \
  --log-file ./artifacts/vlocode-deploy.log
```

Guidelines:

- Authenticate with `--user` against an org pre-authorized in the Salesforce CLI;
  avoid interactive OAuth in headless runners.
- Use `--no-progress` (on `export`) for clean, line-oriented logs.
- Archive the NDJSON `--log-file` as a build artifact for auditing.
- Use `--delta` to deploy only what changed and keep runs fast.
- Gate the stage on the process exit code; for finer control, parse the deploy
  summary or NDJSON log for record-level errors.

## See also

- [Exporting datapacks](./export.md)
- [Importing / deploying datapacks](./import.md)
- [Building export definitions](./export-definitions.md)
- [Customizing deployment with specs](./deployment-specs.md)
