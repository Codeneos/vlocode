# Importing / deploying datapacks

Deployment writes datapacks from disk into a Salesforce org. In Vlocode there is
no separate "import" step — deployment *is* the import path: `vlocode deploy`
reads datapack files, converts them to Salesforce records, resolves their
dependencies, computes a safe order, and upserts them. The same engine handles
Vlocity/OmniStudio activation (OmniScripts, LWC, matrices) as part of the run.

| | |
| --- | --- |
| **Command** | `vlocode deploy` — full option reference in the [CLI reference](./cli.md#vlocode-deploy). |
| **Engine** | [`DatapackDeployer`](../packages/vlocity-deploy/src/datapackDeployer.ts), [`DatapackDeployment`](../packages/vlocity-deploy/src/datapackDeployment.ts). |
| **Related** | [Customizing deployment with specs](./deployment-specs.md) · [Exporting datapacks](./export.md) |

## Prerequisites

- The Vlocode CLI installed and an authenticated org — see
  [Installation](./cli.md#installation) and
  [Authentication](./cli.md#authentication).
- A folder of datapacks to deploy (for example produced by
  [`vlocode export --expand`](./export.md)).

## Running a deployment

Point `deploy` at one or more folders or datapack files. Folders are scanned
recursively for `*_DataPack.json` files:

```shell
# Deploy a folder tree using an SFDX alias
vlocode deploy ./datapacks --user my-org

# Deploy only changed datapacks to production
vlocode deploy ./datapacks --instance login.salesforce.com --delta
```

The most frequently used options are summarized below; see the
[CLI reference](./cli.md#vlocode-deploy) for the complete list with defaults.

| Option | When to use |
| --- | --- |
| `--delta` | Deploy only datapacks that differ from the target org. Recommended for fast, repeatable deployments. |
| `--retry-count <n>` | Increase resilience to transient row-lock/timeout errors. |
| `--strict-order` | Enforce datapack-level ordering when record-level ordering is not enough. |
| `--purge-dependencies` | Force-replace embedded child collections (non-production). |
| `--allow-unresolved` | Continue when a dependency cannot be resolved (may produce inconsistent data). |
| `-y, --continue-on-error` | Continue with datapacks that loaded successfully even if others failed to load. |

## How deployment works

```
datapack files
       │
       ▼
1. load            DatapackLoader reads *_DataPack.json files and resolves
       │            external file references (HTML, images, ...). Datapack
       │            type is inferred from folder + SObject type.
       ▼
2. preprocess      spec `preprocess` hook may patch datapack data
       │
       ▼
3. convert         DatapackRecordFactory turns each datapack into one or more
       │            DatapackDeploymentRecords; embedded datapacks recurse;
       │            references become dependencies. spec `afterRecordConversion`.
       ▼
4. resolve deps    for each record, resolve:
       │              • internal deps  → other records in this deployment
       │              • external deps  → existing records in the org (lookup)
       ▼
5. resolve ids     look up existing records by matching key → upsert (update)
       │            or insert. `--delta` skips in-sync records.
       ▼
6. order & batch   repeatedly select records whose dependencies are all
       │            resolved, in chunks; detect circular dependencies.
       │            spec `beforeDeploy` / `beforeDeployRecord` hooks.
       ▼
7. deploy          RecordBatch upserts the chunk via REST (or Bulk) API.
       │            spec `afterDeployRecord` / `afterDeploy` hooks.
       ▼
8. activate        post-deploy work: verify Vlocity GlobalKeys, purge
       │            dependents, activate OmniScripts / LWC / matrices, ...
       ▼
9. retry/report    retry retryable failures up to --retry-count; collect
                    errors and warnings.
```

### Records and record groups

A single datapack expands into one
[`DatapackDeploymentRecord`](../packages/vlocity-deploy/src/datapackDeploymentRecord.ts)
per SObject record. Records originating from the same datapack are tracked
together as a
[`DatapackDeploymentRecordGroup`](../packages/vlocity-deploy/src/datapackDeploymentRecordGroup.ts)
so that group-level hooks (activation, purge) run once the whole datapack is
deployed.

### Dependency resolution

Datapacks carry two kinds of dependency (see
[Concepts](./concepts.md#references-vs-embedded-objects)):

- **Internal** (`VlocityMatchingKeyObject`) — resolved against the other records
  in the same deployment by source key.
- **External lookup** (`VlocityLookupMatchingKeyObject`) — resolved against the
  target org by querying on the matching-key fields carried in the reference.

External resolution goes through
[`DatapackLookupService`](../packages/vlocity-deploy/src/datapackLookupService.ts),
which fetches each SObject's matching-key definition, queries existing records,
and caches the results. Requests are batched by
[`DeferredDependencyResolver`](../packages/vlocity-deploy/src/deferredDependencyResolver.ts)
to minimize API calls.

### Ordering and circular dependencies

The deployment loop repeatedly selects the records whose dependencies are all
satisfied and deploys them in chunks. This record-level ordering allows optimal
chunking across datapacks. If no record can make progress while pending records
remain, the engine detects a **circular dependency** and fails the involved
records. `--strict-order` additionally enforces whole-datapack ordering when
record-level ordering is insufficient.

### Matching and upsert

Each record is matched to an existing org record using its
[matching key](./concepts.md#matching-key) fields — the same concept used on
export. Matching-key definitions come from the org's
`%vlocity_namespace%__DRMatchingKey__mdt` custom metadata, falling back to
inferred keys.

- Match found → **update** the existing record.
- No match → **insert** a new record.
- Multiple matches → a warning is logged and the first match is used.
- With `--delta`, unchanged records are **skipped** entirely.

### Vlocity triggers and GlobalKeys

Some Vlocity objects have triggers that overwrite fields (such as `GlobalKey`
fields) during insert/update. After deploying, the engine re-fetches the affected
records, compares the GlobalKey fields against the expected values, and corrects
them if a trigger changed them — disabling triggers during the corrective update
where needed.

## What the command reports

After a run, `vlocode deploy` prints a summary with the elapsed time and the
number of errors and warnings, then lists per-datapack messages (errors always;
warnings under `--verbose`). Namespace prefixes are stripped from source keys for
readability.

> **Important for automation.** A deployment that completes but reports
> per-record errors still exits `0`. To gate a pipeline on record-level failures,
> inspect the summary or parse the NDJSON
> [log file](./cli.md#logging-and-diagnostics). The process exits `1` only on an
> unhandled error (see [Exit codes](./cli.md#exit-codes)).

## Troubleshooting

| Symptom | Cause and resolution |
| --- | --- |
| `No datapacks found in specified paths` | The paths contain no `*_DataPack.json` files. Check the folder, or that the export produced expanded datapacks. |
| Circular dependency failure | Two or more records depend on each other. Review the datapack references; try `--strict-order`, or split the cycle. |
| Dependency cannot be resolved | A referenced record is missing from both the deployment and the org. Deploy the dependency first, use `--lookup-failed`, or (with caution) `--allow-unresolved`. |
| Field exists in datapack but not deployed | The field is absent in the target org; Vlocode matches datapack fields against the org schema and reports unmatched fields as errors. Review the org's object/field setup. |
| Deleted child records are not removed | By design Vlocode does not delete records unless asked. Use `--purge-dependencies` (non-production) to replace embedded child collections. |

Raise the log level with `-v`/`--debug` to see detailed per-record diagnostics in
the NDJSON [log file](./cli.md#logging-and-diagnostics).

## Programmatic deployment

The engine is usable directly as a library; the convenience entry point is the
`deploy` function in
[`datapackDeploy.ts`](../packages/vlocity-deploy/src/datapackDeploy.ts):

```ts
import { container } from '@vlocode/core';
import { DatapackDeployer } from '@vlocode/vlocity-deploy';
import { DatapackLoader } from '@vlocode/vlocity';

const datapacks = await container.get(DatapackLoader)
  .loadDatapacksFromFolder('./datapacks');

const deployment = await container.new(DatapackDeployer)
  .createDeployment(datapacks, {
    maxRetries: 1,
    deltaCheck: true,
    strictOrder: false,
  });

await deployment.start();

// Inspect results
const messages = deployment.getMessages();
const byDatapack = deployment.getMessagesByDatapack();
```

`DatapackDeploymentOptions`
([source](../packages/vlocity-deploy/src/datapackDeploymentOptions.ts)) exposes
the same switches as the CLI plus internal tuning such as `chunkSize`,
`bulkApiThreshold`, `purgeMatchingDependencies`, and `disableTriggers`.

## Next steps

To add behaviour for a specific datapack type — patch data before conversion,
add dependencies, or run post-deploy activation — see
[Customizing deployment with specs](./deployment-specs.md).
