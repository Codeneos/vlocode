# vlocode — a hyper fast :rocket: Vlocity/Salesforce CLI

`vlocode` is a fast, Salesforce-native command line tool for **exporting**,
**deploying**, and **activating** Vlocity/OmniStudio metadata, deploying raw
**Salesforce metadata**, running **data** operations, and orchestrating
multi-stage **deploy pipelines** against any Salesforce org. It is built on the
_[@vlocode/vlocity-deploy](https://www.npmjs.com/package/@vlocode/vlocity-deploy)_
library and does **not** depend on the Vlocity build tools.

Built on [oclif](https://oclif.io). Requires **Node.js >= 20**.

## Installation

```shell
npm install --global @vlocode/cli
```

Verify the install with `vlocode --version`.

## Commands by topic

| Topic | Command | Summary |
| --- | --- | --- |
| **datapack** | `datapack deploy <paths..>` (alias `datapack import`) | Deploy Vlocity datapacks from disk into an org. |
| | `datapack export [ids..]` | Export records from an org into datapack files. |
| | `datapack compare <paths..>` | Compare datapacks against org data without deploying (console/json/markdown reports). |
| | `datapack convert <paths..>` | Convert managed-runtime OmniScript datapacks to native OmniProcess. |
| | `datapack build-definitions` | Generate export-definition YAML from an org's DataRaptor config. |
| **metadata** | `metadata deploy [sources..]` | Deploy/validate Salesforce metadata (delta, tests, reports). |
| | `metadata deploy cancel [id]` | Cancel a pending metadata deployment. |
| | `metadata deploy artifact <zip>` | Deploy a pre-built artifact zip. |
| **omniscript** | `omniscript activate [filter]` | Activate OmniScripts and deploy their LWC components. |
| **data** | `data export [sobject]` | Export raw record data via the Bulk API v2 as NDJSON. |
| | `data create <input>` | Create/update a record from YAML. |
| | `data delete <soql>` | Delete records matched by a SOQL query, in batches. |
| **apex** | `apex impacted-tests <folders..>` | Find which Apex tests cover a set of classes (offline). |
| **salesforce** | `salesforce frontdoor [path]` | Get a frontdoor login URL for an org. |
| **deploy** | `deploy run <manifest.yaml>` | Run a multi-stage metadata + datapack pipeline. |
| | `deploy validate <manifest.yaml>` | Validate a pipeline manifest (offline). |

List all commands with `vlocode --help`, and get help for a specific command with
`vlocode <topic> <command> --help`.

## Authentication

Commands that connect to Salesforce support:

- **SFDX username or alias** (`--user <alias>`) — reuse an existing `sf`/`sfdx`
  authorization. Recommended for CI/CD.
- **Interactive OAuth** (default when `--user` is omitted) — opens a browser login
  against `--instance` (default `test.salesforce.com`; use `login.salesforce.com`
  for production).
- **Session replay** (`--replay-session <file>`) — replay a previously recorded
  session, with no org connection.

## Deploy pipelines

`deploy run <manifest.yaml>` executes an ordered list of stages, each dispatched
directly to the native vlocode engines. Stage types: `metadata`, `datapack`,
`apex`, `batch`, `createRecords`, `deleteRecords`, `destruct`. Stages support
`when` gating (org type / sandbox name) and per-stage/pipeline `continueOnError`.
See [`docs/examples/deploy-pipeline.yaml`](docs/examples/deploy-pipeline.yaml)
for a complete example, and `deploy validate <manifest.yaml>` to check a manifest
offline.

## Command reference

<!-- commands -->
* [`vlocode apex impacted-tests FOLDERS`](#vlocode-apex-impacted-tests-folders)
* [`vlocode data create INPUT`](#vlocode-data-create-input)
* [`vlocode data delete SOQL`](#vlocode-data-delete-soql)
* [`vlocode data export [SOBJECT]`](#vlocode-data-export-sobject)
* [`vlocode datapack build-definitions`](#vlocode-datapack-build-definitions)
* [`vlocode datapack compare PATHS`](#vlocode-datapack-compare-paths)
* [`vlocode datapack convert PATHS`](#vlocode-datapack-convert-paths)
* [`vlocode datapack deploy PATHS`](#vlocode-datapack-deploy-paths)
* [`vlocode datapack export [IDS]`](#vlocode-datapack-export-ids)
* [`vlocode datapack import PATHS`](#vlocode-datapack-import-paths)
* [`vlocode deploy run MANIFEST`](#vlocode-deploy-run-manifest)
* [`vlocode deploy validate MANIFEST`](#vlocode-deploy-validate-manifest)
* [`vlocode help [COMMAND]`](#vlocode-help-command)
* [`vlocode metadata deploy`](#vlocode-metadata-deploy)
* [`vlocode metadata deploy artifact ARTIFACTPATH`](#vlocode-metadata-deploy-artifact-artifactpath)
* [`vlocode metadata deploy cancel [ID]`](#vlocode-metadata-deploy-cancel-id)
* [`vlocode omniscript activate [SCRIPTFILTER]`](#vlocode-omniscript-activate-scriptfilter)
* [`vlocode salesforce frontdoor [PATH]`](#vlocode-salesforce-frontdoor-path)

## `vlocode apex impacted-tests FOLDERS`

Find impacted unit tests for a given set of APEX classes

```
USAGE
  $ vlocode apex impacted-tests FOLDERS... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [--classes <value>...] [--output <value>]

ARGUMENTS
  FOLDERS...  path to a folder containing the APEX class files and triggers to parse

FLAGS
  -v, --verbose             enable more detailed verbose logging
      --classes=<value>...  list of classes to find impacted tests for
      --debug               print the call stack when an unhandled error occurs
      --log-file=<path>     append logs as NDJSON to the specified file
      --log-level=<option>  set the log level, overrides -v/--debug
                            <options: debug|verbose|info|warn|error|fatal>
      --output=<value>      [default: impactedTests.json] path to the file to which to write the impacted tests output
                            as JSON

DESCRIPTION
  Find impacted unit tests for a given set of APEX classes

EXAMPLES
  $ vlocode apex impacted-tests ./force-app/main/default/classes

  $ vlocode apex impacted-tests ./classes --classes MyService,MyController
```

## `vlocode data create INPUT`

Create or update a single Salesforce record from YAML

```
USAGE
  $ vlocode data create INPUT... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--dryRun] [--match <value>] [-s <value>]

ARGUMENTS
  INPUT...  YAML file containing record fields, or "-" to read YAML from stdin

FLAGS
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -s, --object=<value>             SObject API name to create or update
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --debug                      print the call stack when an unhandled error occurs
      --dryRun                     show the normalized record without writing to Salesforce
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --match=<value>              field API name used to find and update an existing record
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Create or update a single Salesforce record from YAML

EXAMPLES
  $ vlocode data create ./account.yml --object Account -u my-org

  $ vlocode data create ./account.yml --object Account --match External_Id__c -u my-org
```

## `vlocode data delete SOQL`

Delete Salesforce records returned by a SOQL query, in batches

```
USAGE
  $ vlocode data delete SOQL... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--batchSize <value>] [--dryRun] [--object <value>]

ARGUMENTS
  SOQL...  SOQL query selecting the records to delete. The query must select Id.

FLAGS
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --batchSize=<value>          [default: 200] number of records to delete per API call
      --debug                      print the call stack when an unhandled error occurs
      --dryRun                     count matching records without deleting them
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --object=<value>             SObject API name to delete from when it cannot be inferred from query results
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Delete Salesforce records returned by a SOQL query, in batches

EXAMPLES
  $ vlocode data delete "SELECT Id FROM Account WHERE Name LIKE 'Test%'" -u my-org

  $ vlocode data delete "SELECT Id FROM Account WHERE CreatedDate = TODAY" --dryRun -u my-org
```

## `vlocode data export [SOBJECT]`

Export data from Salesforce using the Bulk API v2 and output as NDJSON

```
USAGE
  $ vlocode data export [SOBJECT...] -o <value> [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [-q <value> | -f <value>] [-l <value>] [--include-deleted]
    [--chunk-size <value>]

ARGUMENTS
  [SOBJECT...]  SObject name to query (if no query / file is specified)

FLAGS
  -f, --file=<value>               path to a file containing a SOQL query
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -l, --limit=<value>              limit the number of records to export (only applies when providing an SObject name)
  -o, --output=<value>             (required) path to the output NDJSON file
  -q, --query=<value>              SOQL query string to execute
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --chunk-size=<value>         [default: 50000] number of records to retrieve per API call
      --debug                      print the call stack when an unhandled error occurs
      --include-deleted            include deleted records in the query (queryAll)
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Export data from Salesforce using the Bulk API v2 and output as NDJSON

EXAMPLES
  $ vlocode data export Account -o accounts.ndjson -u my-org

  $ vlocode data export -q "SELECT Id, Name FROM Account" -o accounts.ndjson -u my-org
```

## `vlocode datapack build-definitions`

Generate DatapackExportDefinition YAML from DRMapItem migration records

```
USAGE
  $ vlocode datapack build-definitions [-v] [--debug] [--log-file <path>] [--log-level debug|verbose|info|warn|error|fatal] [-u
    username@example.com] [-i <value>] [--api-version <version>] [--record-session | --replay-session <file>] [-e
    <value>] [-x] [-o <value>] [-d <value>]

FLAGS
  -d, --output-dir=<value>         [default: ./datapack-export-definitions] output directory for expanded mode
  -e, --expand-definition=<value>  optional path to datapacksexpanddefinition YAML file
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -o, --output=<value>             [default: ./export-definitions.yaml] output YAML file path for non-expanded mode
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
  -x, --expanded                   write one YAML file per datapack definition
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --debug                      print the call stack when an unhandled error occurs
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Generate DatapackExportDefinition YAML from DRMapItem migration records

EXAMPLES
  $ vlocode datapack build-definitions -u my-org

  $ vlocode datapack build-definitions --expanded --output-dir ./definitions -u my-org
```

## `vlocode datapack compare PATHS`

Compare datapacks against the data in a Salesforce org without deploying them. Reports per datapack if it is in sync with the org and which records a deployment would insert, update or delete.

```
USAGE
  $ vlocode datapack compare PATHS... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [-r console|json|markdown...] [--report-file <value>] [--progress]
    [--bulk-extract] [--bulk-extract-limit <value>] [--matching-keys <files...>...]

ARGUMENTS
  PATHS...  path of the folders containing the datapacks or datapack files to compare

FLAGS
  -i, --instance=<value>             [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                     for example: test.salesforce.com
  -r, --reporter=<option>...         [default: console] one or more reporters used to output the comparison results
                                     <options: console|json|markdown>
  -u, --user=username@example.com    Salesforce username or alias of the org to connect to
  -v, --verbose                      enable more detailed verbose logging
      --api-version=<version>        Salesforce API version to use; defaults to the latest version supported by the org
      --[no-]bulk-extract            bulk extract org data for comparison (use --no-bulk-extract to compare using
                                     filtered org queries)
      --bulk-extract-limit=<value>   [default: 200000] maximum number of org records per SObject type to bulk extract;
                                     types with more records fall back to filtered org queries
      --debug                        print the call stack when an unhandled error occurs
      --log-file=<path>              append logs as NDJSON to the specified file
      --log-level=<option>           set the log level, overrides -v/--debug
                                     <options: debug|verbose|info|warn|error|fatal>
      --matching-keys=<files...>...  JSON or YAML files defining the matching key fields per SObject type, e.g. {
                                     "Product2": ["ProductCode"] }
      --[no-]progress                show an interactive progress bar (use --no-progress for plain forward-printing
                                     output)
      --record-session               record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>        replay a previously recorded session log instead of connecting to an org
      --report-file=<value>          [default: datapack-comparison] name of the report file to which the json and
                                     markdown reporters write; the file extension is set per reporter

DESCRIPTION
  Compare datapacks against the data in a Salesforce org without deploying them. Reports per datapack if it is in sync
  with the org and which records a deployment would insert, update or delete.

EXAMPLES
  $ vlocode datapack compare ./datapacks -u my-org

  $ vlocode datapack compare ./datapacks -r console -r markdown --report-file compare-report -u my-org

FLAG DESCRIPTIONS
  -r, --reporter=console|json|markdown...  one or more reporters used to output the comparison results

    The console reporter prints a colorized summary, the json and markdown reporters write a detailed report file.

  --[no-]bulk-extract  bulk extract org data for comparison (use --no-bulk-extract to compare using filtered org queries)

    Bulk extraction reads all org records per compared SObject type which is significantly faster for large comparisons.

  --matching-keys=<files...>...

    JSON or YAML files defining the matching key fields per SObject type, e.g. { "Product2": ["ProductCode"] }

    Matching keys from these files take precedence over matching keys defined in the org and in export definitions. A
    matching-keys.json or matching-keys.yaml file in the current directory is always loaded when present.
```

## `vlocode datapack convert PATHS`

Convert Managed runtime OmniScript datapacks to native OmniProcess datapacks

```
USAGE
  $ vlocode datapack convert PATHS... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>]

ARGUMENTS
  PATHS...  path of the folders containing the datapacks or datapack files to be converted

FLAGS
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --debug                      print the call stack when an unhandled error occurs
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Convert Managed runtime OmniScript datapacks to native OmniProcess datapacks

EXAMPLES
  $ vlocode datapack convert ./datapacks -u my-org
```

## `vlocode datapack deploy PATHS`

Deploy datapacks to Salesforce

```
USAGE
  $ vlocode datapack deploy PATHS... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--purge-dependencies] [--lookup-failed] [--allow-unresolved]
    [--retry-count <value>] [--bulk-api] [--delta] [--strict-order] [--skip-lwc] [--use-metadata-api]
    [--remote-script-activation] [-y] [--matching-keys <files...>...]

ARGUMENTS
  PATHS...  path of the folders containing the datapacks or datapack files to be deployed

FLAGS
  -i, --instance=<value>             [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                     for example: test.salesforce.com
  -u, --user=username@example.com    Salesforce username or alias of the org to connect to
  -v, --verbose                      enable more detailed verbose logging
  -y, --continue-on-error            continue deploying when one of the datapacks cannot be loaded
      --allow-unresolved             do not fail the deployment of a datapack when a dependency cannot be resolved
      --api-version=<version>        Salesforce API version to use; defaults to the latest version supported by the org
      --bulk-api                     use the Salesforce bulk API to update and insert records
      --debug                        print the call stack when an unhandled error occurs
      --delta                        check for changes between the source data packs and source org and only deploy the
                                     datapacks that are changed
      --log-file=<path>              append logs as NDJSON to the specified file
      --log-level=<option>           set the log level, overrides -v/--debug
                                     <options: debug|verbose|info|warn|error|fatal>
      --lookup-failed                lookup dependencies that fail to deploy in the org
      --matching-keys=<files...>...  JSON or YAML files defining the matching key fields per SObject type, e.g. {
                                     "Product2": ["ProductCode"] }
      --purge-dependencies           delete embedded dependencies with matching keys after the primary datapack record
                                     is deployed
      --record-session               record the interaction with Salesforce to a session log that can be replayed later
      --remote-script-activation     use anonymous apex to activate OmniScripts
      --replay-session=<file>        replay a previously recorded session log instead of connecting to an org
      --retry-count=<value>          [default: 1] the number of times a record deployment is retried before failing it
      --skip-lwc                     skip LWC activation for LWC enabled OmniScripts
      --strict-order                 enforce a strict order for datapacks that are dependent on other datapacks in the
                                     same deployment
      --use-metadata-api             deploy LWC components using the Metadata API (slower) instead of the Tooling API

DESCRIPTION
  Deploy datapacks to Salesforce

ALIASES
  $ vlocode datapack import

EXAMPLES
  $ vlocode datapack deploy ./datapacks -u my-org

  $ vlocode datapack deploy ./datapacks --delta --strict-order -u my-org

FLAG DESCRIPTIONS
  -y, --continue-on-error  continue deploying when one of the datapacks cannot be loaded

    For any error that occurs while loading and converting a datapack to records the deployment will exit without making
    changes to the org. You can ignore these errors and continue deploying the datapacks that were loaded without errors
    by setting this option.

  --allow-unresolved  do not fail the deployment of a datapack when a dependency cannot be resolved

    When this option is enabled Vlocode will attempt to deploy the datapack without the dependency and log a warning.
    The field which contains the unresolved dependency will be set to null instead, enabling this can cause inconsistent
    data in the target org and is only recommended to resolve deployment issues.

  --bulk-api  use the Salesforce bulk API to update and insert records

    Using the Bulk API for deployments is significantly slower compared to the standard Salesforce API and should only
    be used to reduce the number of call outs made during the deployment

  --matching-keys=<files...>...

    JSON or YAML files defining the matching key fields per SObject type, e.g. { "Product2": ["ProductCode"] }

    Matching keys from these files take precedence over matching keys defined in the org and in export definitions. A
    matching-keys.json or matching-keys.yaml file in the current directory is always loaded when present.

  --purge-dependencies  delete embedded dependencies with matching keys after the primary datapack record is deployed

    By default Vlocode will only delete child records that do not have a matching key configuration, with this flag
    Vlocode will delete all child records that have a lookup relationships to the primary datapack record. For example;
    when deploying a Product2 datapack this flag will delete all child item records found in the target org with a
    lookup to the Product2 datapack that is deployed.

  --remote-script-activation  use anonymous apex to activate OmniScripts

    By default Vlocode will generate script definitions locally which is faster and more reliable than remote
    activation. Enable this for edge cases when OmniScripts are not working properly when using local script activation.

  --strict-order  enforce a strict order for datapacks that are dependent on other datapacks in the same deployment

    By default Vlocode determines deployment order based on record level dependencies, this allows for more optimal
    chunking improving the overall speed of the deployment. By setting this option to true Vlocode also enforces that
    any datapack that is dependent on another datapack is deployed after the datapack it depends on. This reduces
    deployment speed but can improve compatibility, enable this option when you experience issues with deployment order.
```

## `vlocode datapack export [IDS]`

Export an object as datapack from Salesforce

```
USAGE
  $ vlocode datapack export [IDS...] [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--definitions <file>] [-f <value> | -q <value>] [-e] [-t <value>] [-o
    <value>] [-d <value>] [--suppress-nulls] [--fail-on-error] [--progress] [--matching-keys <files...>...]

ARGUMENTS
  [IDS...]  list of object IDs to export

FLAGS
  -d, --depth=<value>                dependency export depth; use -1 to include all dependencies
  -e, --expand                       expand the exported datapack into separate files according to the definitions
  -f, --file=<value>                 path to a YAML export manifest with datapack export queries
  -i, --instance=<value>             [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                     for example: test.salesforce.com
  -o, --output=<value>               [default: ./] folder where exported datapacks are written
  -q, --query=<value>                SOQL query selecting the records to export instead of passing object IDs
  -t, --type=<value>                 datapack type to use when exporting IDs or a single query
  -u, --user=username@example.com    Salesforce username or alias of the org to connect to
  -v, --verbose                      enable more detailed verbose logging
      --api-version=<version>        Salesforce API version to use; defaults to the latest version supported by the org
      --debug                        print the call stack when an unhandled error occurs
      --definitions=<file>           path to the YAML or JSON file defining how objects are expanded into datapack files
      --fail-on-error                fail the export if an error occurs while exporting a datapack
      --log-file=<path>              append logs as NDJSON to the specified file
      --log-level=<option>           set the log level, overrides -v/--debug
                                     <options: debug|verbose|info|warn|error|fatal>
      --matching-keys=<files...>...  JSON or YAML files defining the matching key fields per SObject type, e.g. {
                                     "Product2": ["ProductCode"] }
      --[no-]progress                show an interactive progress bar (use --no-progress for plain forward-printing
                                     output)
      --record-session               record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>        replay a previously recorded session log instead of connecting to an org
      --suppress-nulls               suppress null SObject field values from exported datapacks

DESCRIPTION
  Export an object as datapack from Salesforce

EXAMPLES
  $ vlocode datapack export a0X000000000000 -t Product2 -u my-org

  $ vlocode datapack export --definitions ./export-definitions.yaml --query "SELECT Id FROM Product2" --expand -u my-org

FLAG DESCRIPTIONS
  --matching-keys=<files...>...

    JSON or YAML files defining the matching key fields per SObject type, e.g. { "Product2": ["ProductCode"] }

    Matching keys from these files take precedence over matching keys defined in the org and in export definitions. A
    matching-keys.json or matching-keys.yaml file in the current directory is always loaded when present.
```

## `vlocode datapack import PATHS`

Deploy datapacks to Salesforce

```
USAGE
  $ vlocode datapack import PATHS... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--purge-dependencies] [--lookup-failed] [--allow-unresolved]
    [--retry-count <value>] [--bulk-api] [--delta] [--strict-order] [--skip-lwc] [--use-metadata-api]
    [--remote-script-activation] [-y] [--matching-keys <files...>...]

ARGUMENTS
  PATHS...  path of the folders containing the datapacks or datapack files to be deployed

FLAGS
  -i, --instance=<value>             [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                     for example: test.salesforce.com
  -u, --user=username@example.com    Salesforce username or alias of the org to connect to
  -v, --verbose                      enable more detailed verbose logging
  -y, --continue-on-error            continue deploying when one of the datapacks cannot be loaded
      --allow-unresolved             do not fail the deployment of a datapack when a dependency cannot be resolved
      --api-version=<version>        Salesforce API version to use; defaults to the latest version supported by the org
      --bulk-api                     use the Salesforce bulk API to update and insert records
      --debug                        print the call stack when an unhandled error occurs
      --delta                        check for changes between the source data packs and source org and only deploy the
                                     datapacks that are changed
      --log-file=<path>              append logs as NDJSON to the specified file
      --log-level=<option>           set the log level, overrides -v/--debug
                                     <options: debug|verbose|info|warn|error|fatal>
      --lookup-failed                lookup dependencies that fail to deploy in the org
      --matching-keys=<files...>...  JSON or YAML files defining the matching key fields per SObject type, e.g. {
                                     "Product2": ["ProductCode"] }
      --purge-dependencies           delete embedded dependencies with matching keys after the primary datapack record
                                     is deployed
      --record-session               record the interaction with Salesforce to a session log that can be replayed later
      --remote-script-activation     use anonymous apex to activate OmniScripts
      --replay-session=<file>        replay a previously recorded session log instead of connecting to an org
      --retry-count=<value>          [default: 1] the number of times a record deployment is retried before failing it
      --skip-lwc                     skip LWC activation for LWC enabled OmniScripts
      --strict-order                 enforce a strict order for datapacks that are dependent on other datapacks in the
                                     same deployment
      --use-metadata-api             deploy LWC components using the Metadata API (slower) instead of the Tooling API

DESCRIPTION
  Deploy datapacks to Salesforce

ALIASES
  $ vlocode datapack import

EXAMPLES
  $ vlocode datapack import ./datapacks -u my-org

  $ vlocode datapack import ./datapacks --delta --strict-order -u my-org

FLAG DESCRIPTIONS
  -y, --continue-on-error  continue deploying when one of the datapacks cannot be loaded

    For any error that occurs while loading and converting a datapack to records the deployment will exit without making
    changes to the org. You can ignore these errors and continue deploying the datapacks that were loaded without errors
    by setting this option.

  --allow-unresolved  do not fail the deployment of a datapack when a dependency cannot be resolved

    When this option is enabled Vlocode will attempt to deploy the datapack without the dependency and log a warning.
    The field which contains the unresolved dependency will be set to null instead, enabling this can cause inconsistent
    data in the target org and is only recommended to resolve deployment issues.

  --bulk-api  use the Salesforce bulk API to update and insert records

    Using the Bulk API for deployments is significantly slower compared to the standard Salesforce API and should only
    be used to reduce the number of call outs made during the deployment

  --matching-keys=<files...>...

    JSON or YAML files defining the matching key fields per SObject type, e.g. { "Product2": ["ProductCode"] }

    Matching keys from these files take precedence over matching keys defined in the org and in export definitions. A
    matching-keys.json or matching-keys.yaml file in the current directory is always loaded when present.

  --purge-dependencies  delete embedded dependencies with matching keys after the primary datapack record is deployed

    By default Vlocode will only delete child records that do not have a matching key configuration, with this flag
    Vlocode will delete all child records that have a lookup relationships to the primary datapack record. For example;
    when deploying a Product2 datapack this flag will delete all child item records found in the target org with a
    lookup to the Product2 datapack that is deployed.

  --remote-script-activation  use anonymous apex to activate OmniScripts

    By default Vlocode will generate script definitions locally which is faster and more reliable than remote
    activation. Enable this for edge cases when OmniScripts are not working properly when using local script activation.

  --strict-order  enforce a strict order for datapacks that are dependent on other datapacks in the same deployment

    By default Vlocode determines deployment order based on record level dependencies, this allows for more optimal
    chunking improving the overall speed of the deployment. By setting this option to true Vlocode also enforces that
    any datapack that is dependent on another datapack is deployed after the datapack it depends on. This reduces
    deployment speed but can improve compatibility, enable this option when you experience issues with deployment order.
```

## `vlocode deploy run MANIFEST`

Run a multi-stage deployment pipeline that combines metadata, datapack and action stages

```
USAGE
  $ vlocode deploy run MANIFEST... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--check-only] [--stage <value>...] [--from <value>]
    [--continue-on-error | --fail-fast]

ARGUMENTS
  MANIFEST...  path to the deploy pipeline YAML manifest

FLAGS
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --check-only                 force all metadata stages to validate-only (dry run)
      --continue-on-error          run all remaining stages on failure, then exit non-zero (overrides the manifest)
      --debug                      print the call stack when an unhandled error occurs
      --fail-fast                  stop at the first failed stage (overrides the manifest)
      --from=<value>               resume the pipeline from the named stage
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org
      --stage=<value>...           run only the named stage(s)

DESCRIPTION
  Run a multi-stage deployment pipeline that combines metadata, datapack and action stages

EXAMPLES
  $ vlocode deploy run deploy-pipeline.yaml -u my-org

  $ vlocode deploy run deploy-pipeline.yaml --check-only -u my-org

  $ vlocode deploy run deploy-pipeline.yaml --stage "Apex & automation" -u my-org
```

## `vlocode deploy validate MANIFEST`

Validate a deploy pipeline manifest (schema + variable interpolation) without connecting to an org

```
USAGE
  $ vlocode deploy validate MANIFEST... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal]

ARGUMENTS
  MANIFEST...  path to the deploy pipeline YAML manifest

FLAGS
  -v, --verbose             enable more detailed verbose logging
      --debug               print the call stack when an unhandled error occurs
      --log-file=<path>     append logs as NDJSON to the specified file
      --log-level=<option>  set the log level, overrides -v/--debug
                            <options: debug|verbose|info|warn|error|fatal>

DESCRIPTION
  Validate a deploy pipeline manifest (schema + variable interpolation) without connecting to an org

EXAMPLES
  $ vlocode deploy validate deploy-pipeline.yaml
```

## `vlocode help [COMMAND]`

Display help for vlocode.

```
USAGE
  $ vlocode help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for vlocode.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.53/src/commands/help.ts)_

## `vlocode metadata deploy`

Deploy or validate a deployment of Salesforce metadata components to an org

```
USAGE
  $ vlocode metadata deploy [-v] [--debug] [--log-file <path>] [--log-level debug|verbose|info|warn|error|fatal] [-u
    username@example.com] [-i <value>] [--api-version <version>] [--record-session | --replay-session <file>] [-d
    <value>] [--check-only] [-l NoTestRun|RunSpecifiedTests|RunRelevantTests|RunLocalTests|RunAllTestsInOrg]
    [--run-tests <value>...] [--ignore-warnings] [--delta org|git] [-f <value>] [--build-only -o <value>] [-r <value>]
    [--test-coverage-report <value>] [--deploy-report <value>] [--env-file <value>]

FLAGS
  -d, --sources=<value>               comma separated list of source files/folders to deploy (defaults to "src")
  -f, --from-revision=<value>         git revision to compare against for --delta git (defaults to the last deployed
                                      revision)
  -i, --instance=<value>              [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                      for example: test.salesforce.com
  -l, --test-level=<option>           which tests to run during deployment; RunRelevantTests resolves the tests covering
                                      the deployed Apex from the sources
                                      <options:
                                      NoTestRun|RunSpecifiedTests|RunRelevantTests|RunLocalTests|RunAllTestsInOrg>
  -o, --out=<value>                   save the deployment package zip to the specified path
  -r, --test-report=<value>           write a JUnit XML test report to the specified path
  -u, --user=username@example.com     Salesforce username or alias of the org to connect to
  -v, --verbose                       enable more detailed verbose logging
      --api-version=<version>         Salesforce API version to use; defaults to the latest version supported by the org
      --build-only                    build the deployment package without deploying it (requires --out)
      --check-only                    validate the deployment without making any changes (dry run)
      --debug                         print the call stack when an unhandled error occurs
      --delta=<option>                only deploy components changed vs the org ("org") or a git revision ("git")
                                      <options: org|git>
      --deploy-report=<value>         write a JSON deployment results report to the specified path
      --env-file=<value>              JSON file with token replacements applied to the packaged sources
      --[no-]ignore-warnings          ignore deployment warnings (use --no-ignore-warnings to treat warnings as errors)
      --log-file=<path>               append logs as NDJSON to the specified file
      --log-level=<option>            set the log level, overrides -v/--debug
                                      <options: debug|verbose|info|warn|error|fatal>
      --record-session                record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>         replay a previously recorded session log instead of connecting to an org
      --run-tests=<value>...          test classes to run (requires --test-level RunSpecifiedTests)
      --test-coverage-report=<value>  write a test coverage report (Jacoco XML) to the specified path

DESCRIPTION
  Deploy or validate a deployment of Salesforce metadata components to an org

EXAMPLES
  $ vlocode metadata deploy -d src -l RunLocalTests -u my-org

  $ vlocode metadata deploy --check-only -d src -l RunAllTestsInOrg -u my-org

  $ vlocode metadata deploy --delta org -u my-org

  $ vlocode metadata deploy --build-only --out package.zip -d src
```

## `vlocode metadata deploy artifact ARTIFACTPATH`

Deploy or validate a previously built deployment package (zip) to a Salesforce org. Build packages with `metadata deploy --build-only --out <zip>`.

```
USAGE
  $ vlocode metadata deploy artifact ARTIFACTPATH... [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--check-only] [-l
    NoTestRun|RunSpecifiedTests|RunRelevantTests|RunLocalTests|RunAllTestsInOrg] [--run-tests <value>...]
    [--ignore-warnings] [-r <value>] [--test-coverage-report <value>] [--deploy-report <value>] [--revision <value>]
    [--branch <value>]

ARGUMENTS
  ARTIFACTPATH...  path to the deployment package zip file to deploy

FLAGS
  -i, --instance=<value>              [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                      for example: test.salesforce.com
  -l, --test-level=<option>           which tests to run during deployment; RunRelevantTests resolves the tests covering
                                      the deployed Apex from the sources
                                      <options:
                                      NoTestRun|RunSpecifiedTests|RunRelevantTests|RunLocalTests|RunAllTestsInOrg>
  -r, --test-report=<value>           write a JUnit XML test report to the specified path
  -u, --user=username@example.com     Salesforce username or alias of the org to connect to
  -v, --verbose                       enable more detailed verbose logging
      --api-version=<version>         Salesforce API version to use; defaults to the latest version supported by the org
      --branch=<value>                git branch to record as deployed in the org settings after a successful deploy
      --check-only                    validate the deployment without making any changes (dry run)
      --debug                         print the call stack when an unhandled error occurs
      --deploy-report=<value>         write a JSON deployment results report to the specified path
      --[no-]ignore-warnings          ignore deployment warnings (use --no-ignore-warnings to treat warnings as errors)
      --log-file=<path>               append logs as NDJSON to the specified file
      --log-level=<option>            set the log level, overrides -v/--debug
                                      <options: debug|verbose|info|warn|error|fatal>
      --record-session                record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>         replay a previously recorded session log instead of connecting to an org
      --revision=<value>              git revision to record as deployed in the org settings after a successful deploy
      --run-tests=<value>...          test classes to run (requires --test-level RunSpecifiedTests)
      --test-coverage-report=<value>  write a test coverage report (Jacoco XML) to the specified path

DESCRIPTION
  Deploy or validate a previously built deployment package (zip) to a Salesforce org. Build packages with `metadata
  deploy --build-only --out <zip>`.

EXAMPLES
  $ vlocode metadata deploy artifact package.zip -u my-org

  $ vlocode metadata deploy artifact package.zip --check-only -l RunLocalTests -u my-org
```

## `vlocode metadata deploy cancel [ID]`

Cancel a pending or in-progress Salesforce metadata deployment by id. If no id is specified the id is read from the ".salesforce-deploy" status file.

```
USAGE
  $ vlocode metadata deploy cancel [ID...] [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--file <value>]

ARGUMENTS
  [ID...]  id of the Salesforce deployment to cancel

FLAGS
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --debug                      print the call stack when an unhandled error occurs
      --file=<value>               [default: .salesforce-deploy] JSON file containing the deployment id to cancel
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Cancel a pending or in-progress Salesforce metadata deployment by id. If no id is specified the id is read from the
  ".salesforce-deploy" status file.

EXAMPLES
  $ vlocode metadata deploy cancel -u my-org

  $ vlocode metadata deploy cancel 0Af3j0000004X2nCAE -u my-org
```

## `vlocode omniscript activate [SCRIPTFILTER]`

Activate OmniScripts in Salesforce and deploy associated LWC components

```
USAGE
  $ vlocode omniscript activate [SCRIPTFILTER...] [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>] [--parallel-activations <value>] [--skip-lwc] [--use-metadata-api]
    [--skip-reactivate-dependencies] [--remote-activation] [--debug-activation]

ARGUMENTS
  [SCRIPTFILTER...]  Salesforce ID or <type>/<subType>(/<language>) filter of the scripts to activate. Supports wildcard
                     characters, i.e: "MACD/" to activate multiple scripts

FLAGS
  -i, --instance=<value>              [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                      for example: test.salesforce.com
  -u, --user=username@example.com     Salesforce username or alias of the org to connect to
  -v, --verbose                       enable more detailed verbose logging
      --api-version=<version>         Salesforce API version to use; defaults to the latest version supported by the org
      --debug                         print the call stack when an unhandled error occurs
      --debug-activation              save the updated script definitions as JSON file
      --log-file=<path>               append logs as NDJSON to the specified file
      --log-level=<option>            set the log level, overrides -v/--debug
                                      <options: debug|verbose|info|warn|error|fatal>
      --parallel-activations=<value>  [default: 4] determines the amount of parallel activations to run
      --record-session                record the interaction with Salesforce to a session log that can be replayed later
      --remote-activation             use anonymous apex to activate OmniScripts
      --replay-session=<file>         replay a previously recorded session log instead of connecting to an org
      --skip-lwc                      skip LWC activation for LWC enabled OmniScripts
      --skip-reactivate-dependencies  skips reactivating parent scripts that embed any of the scripts that are being
                                      activated
      --use-metadata-api              deploy LWC components using the Metadata API (slower) instead of the Tooling API

DESCRIPTION
  Activate OmniScripts in Salesforce and deploy associated LWC components

EXAMPLES
  $ vlocode omniscript activate -u my-org

  $ vlocode omniscript activate "MACD/" -u my-org

FLAG DESCRIPTIONS
  --debug-activation  save the updated script definitions as JSON file

    Use this option while debugging to compare scripts activated with `--remote-activation` and local activation.

  --remote-activation  use anonymous apex to activate OmniScripts

    By default Vlocode will generate script definitions locally which is faster and more reliable than remote
    activation. Enable this when you experience issues or inconsistencies in scripts deployed through Vlocode.

  --skip-reactivate-dependencies

    skips reactivating parent scripts that embed any of the scripts that are being activated

    When you activate a re-usable OmniScript all the OmniScript that embed this script will also get re-activated and
    updated.
```

## `vlocode salesforce frontdoor [PATH]`

Get a Salesforce frontdoor URL for an authenticated org

```
USAGE
  $ vlocode salesforce frontdoor [PATH...] [-v] [--debug] [--log-file <path>] [--log-level
    debug|verbose|info|warn|error|fatal] [-u username@example.com] [-i <value>] [--api-version <version>]
    [--record-session | --replay-session <file>]

ARGUMENTS
  [PATH...]  Salesforce relative path to open after login, e.g. lightning/setup/SetupOneHome/home

FLAGS
  -i, --instance=<value>           [default: test.salesforce.com] Salesforce instance URL used for interactive OAuth;
                                   for example: test.salesforce.com
  -u, --user=username@example.com  Salesforce username or alias of the org to connect to
  -v, --verbose                    enable more detailed verbose logging
      --api-version=<version>      Salesforce API version to use; defaults to the latest version supported by the org
      --debug                      print the call stack when an unhandled error occurs
      --log-file=<path>            append logs as NDJSON to the specified file
      --log-level=<option>         set the log level, overrides -v/--debug
                                   <options: debug|verbose|info|warn|error|fatal>
      --record-session             record the interaction with Salesforce to a session log that can be replayed later
      --replay-session=<file>      replay a previously recorded session log instead of connecting to an org

DESCRIPTION
  Get a Salesforce frontdoor URL for an authenticated org

EXAMPLES
  $ vlocode salesforce frontdoor -u my-org

  $ vlocode salesforce frontdoor lightning/setup/SetupOneHome/home -u my-org
```
<!-- commandsstop -->
