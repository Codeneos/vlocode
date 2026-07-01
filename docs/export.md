# Exporting datapacks

Export reads records out of a Salesforce org and writes them to disk as
[datapacks](./concepts.md#datapack) — portable, file-based representations that
can be version-controlled and deployed to other orgs. This guide explains how to
run an export, the three ways to select what to export, and how the export
pipeline works internally.

| | |
| --- | --- |
| **Command** | `vlocode export` — full option reference in the [CLI reference](./cli.md#vlocode-export). |
| **Engine** | [`DatapackExporter`](../packages/vlocity-deploy/src/export/datapackExporter.ts), [`DatapackExpander`](../packages/vlocity-deploy/src/export/datapackExpander.ts). |
| **Related** | [Building export definitions](./export-definitions.md) · [Importing / deploying datapacks](./import.md) |

## Prerequisites

- The Vlocode CLI installed and an authenticated org — see
  [Installation](./cli.md#installation) and
  [Authentication](./cli.md#authentication).
- An **export-definitions** file describing how records are shaped into
  datapacks. You can author one (see
  [Building export definitions](./export-definitions.md)) or generate a starting
  point with
  [`vlocode build-export-definitions`](./cli.md#vlocode-build-export-definitions).

## Selecting what to export

The `export` command accepts three selection styles. Use exactly one per run.

### 1. By record Id

Pass record Ids directly and name the datapack type with `--type`:

```shell
vlocode export 01t0000000000001AAA 01t0000000000002AAA \
  --definitions ./export-definitions.yaml \
  --type Product2 \
  --expand --output ./datapacks --user my-org
```

### 2. By SOQL query

Let a query choose the records. The query **must select the `Id` field**:

```shell
vlocode export \
  --definitions ./export-definitions.yaml \
  --type Product2 \
  --query "SELECT Id FROM Product2 WHERE IsActive = true" \
  --depth -1 --expand --output ./datapacks --user my-org
```

### 3. By export manifest

Drive everything from a YAML manifest. This is the recommended approach for
repeatable, multi-type exports because the entire scope lives in version control:

```shell
vlocode export --file ./export.yaml --user my-org
```

`--file` cannot be combined with Ids, `--query`, or `--type`.

## Export manifests

An export manifest groups many queries by datapack type and carries the export
settings, so an environment can be exported with a single command. The format is
defined by
[`DatapackExportFile`](../packages/cli/src/datapackExportFileLoader.ts):

```yaml
# export.yaml

# Path (relative to this file) to the export definitions used to shape datapacks.
exportDefinitions: ./export-definitions.yaml

# Expand each datapack into separate files. Equivalent to --expand.
expand: true

# Output folder. Equivalent to --output.
folder: ./datapacks

# Dependency depth; -1 follows all dependencies. Equivalent to --depth.
depth: -1

# Omit null field values. Equivalent to --suppress-nulls.
suppressNulls: true

# Required: datapack type -> one or more SOQL queries (each must select Id).
export:
  Product2:
    - SELECT Id FROM Product2 WHERE IsActive = true
  Pricebook2:
    - SELECT Id FROM Pricebook2 WHERE IsStandard = false
  CalculationMatrix:
    - SELECT Id FROM %vlocity_namespace%__CalculationMatrix__c
```

Notes:

- `export` is the only required key; every other key has a default and can be
  overridden on the command line.
- Each value under `export` may be a single query string or a list of strings.
- `exportDefinitions` is resolved relative to the manifest file and must exist.
- The depth key in a manifest is `depth` (a negative value means "all
  dependencies").

## How export works

The exporter processes records in *chunks* (200 by default) and streams them
through the pipeline below. Memory is released after each chunk, so large exports
stay within bounded memory.

```
input (ids / query / manifest)
        │
        ▼
1. enqueue           normalize input into export requests
        │
        ▼
2. retrieve          fetch full records from Salesforce, by Id, in chunks
        │             (de-duplicated across chunks)
        ▼
3. build datapack    for each record:
        │              • compute the matching key → source key
        │              • export each field (normalize namespaces, parse JSON)
        │              • turn lookups into references (internal or external)
        │              • queue embedded child objects
        ▼
4. resolve embedded  batch-query all queued child records by object type,
        │             then build them (handles nested embedding)
        ▼
5. finalize          children finalize before parents:
        │              • rewrite references that turned out to be internal
        │              • run field processors
        │              • enqueue dependencies for export (per --depth)
        ▼
6. resolve lookups   batch-resolve external references into matching-key
        │             objects; normalize foreign keys
        ▼
7. expand (optional) split fields/children into files per the definitions
        │
        ▼
8. write             write *_DataPack.json (and sibling files when expanded)
```

Key behaviours:

- **Batched queries.** Embedded-object lookups and external-reference resolution
  are deferred and executed as batched queries grouped by object type, keeping
  the number of Salesforce API calls low even for deep graphs.
- **Deterministic keys.** [Matching keys](./concepts.md#matching-key) are
  validated for uniqueness within the export. A collision is an error (the record
  is skipped, or the run aborts under `--fail-on-error`). Top-level records that
  cannot produce a business matching key are an error; embedded records fall back
  to a deterministic path key.
- **Namespace normalization.** Vlocity managed-package prefixes are written as
  the `%vlocity_namespace%__` placeholder so datapacks are portable between orgs
  with different namespaces.

## Output layout

**Consolidated** (default) — each datapack is written to its own subfolder named
after its (sanitized) source key: `<output>/<source-key>/<Name>_DataPack.json`. The
per-datapack subfolder keeps datapacks that share the same `Name` from colliding.
Related datapacks pulled in by `--depth` each get their own subfolder too.

**Expanded** (`--expand`) — each datapack becomes a folder
`<output>/<DatapackType>/<Name>/` containing a `_DataPack.json` plus separate
files for fields/children configured for file expansion in the definitions. The
exporter aborts if two datapacks would write to the same path. Expanded output is
what you typically commit to source control and deploy from.

## Troubleshooting

| Symptom | Cause and resolution |
| --- | --- |
| `Export query ... must select the Id field` | The SOQL in `--query` or the manifest does not select `Id`. Add `Id` to the `SELECT`. |
| `No datapacks matched the export input` | The query returned no rows, or no Ids were supplied. Verify the query and the target org. |
| Matching-key collision error | Two records resolved to the same [matching key](./concepts.md#matching-key). Refine `matchingKeyFields` in the definition so the key is unique. |
| Top-level record has no matching key | A top-level object lacks `matchingKeyFields` and no key could be inferred. Add `matchingKeyFields` to its [definition](./export-definitions.md#matchingkeyfields). |
| Expanded export path collision | Two datapacks resolve to the same folder/file name. Adjust the `name`/`fileName` formats so they are unique. |

To investigate a run, raise the log level with `-v`/`--debug` and inspect the
NDJSON log file — see [Logging and diagnostics](./cli.md#logging-and-diagnostics).

## Programmatic export

The export engine is available as a library:

```ts
import { container } from '@vlocode/core';
import {
  DatapackExporter,
  DatapackExportDefinitionStore,
} from '@vlocode/vlocity-deploy';

// Load definitions once
container.get(DatapackExportDefinitionStore).load(definitionsObject);

const exporter = container.new(DatapackExporter);

// Export and expand into files
const results = await exporter.exportObjectAndExpand(ids, {
  datapackType: 'Product2',
  maxDepth: 2,
  suppressNulls: true,
  failOnError: false,
});

for (const result of results) {
  await result.writeToFilesystem('./datapacks');
}
```

Use `exportObject(...)` instead of `exportObjectAndExpand(...)` to produce
consolidated datapacks without file expansion.

## Next steps

- [Build export definitions](./export-definitions.md) to control exactly how
  records are shaped into datapacks.
- [Deploy the exported datapacks](./import.md) to a target org.
