# Vlocode DataPack Export & Import

This documentation explains how Vlocode exports Salesforce/Vlocity records into
**datapacks** and deploys them back into an org. It covers the concepts behind
datapacks, the `vlocode` command line interface, how to author export
definitions, how the export and deployment pipelines work internally, and the
extension points available on both sides.

The export and deployment engines live in the
[`@vlocode/vlocity-deploy`](../packages/vlocity-deploy/README.md) package and are
driven from the [`@vlocode/cli`](../packages/cli/README.md) command line tool
(`vlocode`). The same APIs are used by the Vlocode VS Code extension.

## Audience

This guide is written for Salesforce developers, release engineers, and
architects who package and move Vlocity/OmniStudio metadata between orgs. It
assumes working knowledge of Salesforce (SObjects, SOQL, metadata) and of
Vlocity/OmniStudio concepts; it explains the parts that are specific to Vlocode.

## What is a datapack?

A **datapack** is a portable, file-based representation of one or more Salesforce
records and their relationships. Instead of moving records by Id — which is not
stable across orgs — a datapack identifies each record by a *source key* derived
from business data (a **matching key**). On deployment those keys are matched
back to records in the target org, so the same datapack can be deployed to many
orgs and re-deployed idempotently.

Datapacks are the unit of transport for Vlocity/OmniStudio metadata such as
OmniScripts, Integration Procedures, Product catalogs, Calculation/Decision
matrices, UI Templates, and DataRaptors, but the engine is generic and can export
any SObject graph.

## Documentation map

| Document | What it covers |
| --- | --- |
| [Concepts](./concepts.md) | Datapacks, source keys, matching keys, references, and dependencies — the vocabulary used throughout. |
| [CLI reference](./cli.md) | Installing and authenticating the `vlocode` CLI, global options, logging, exit codes, and every command. |
| [Exporting datapacks](./export.md) | Selecting records, export manifests, and the export pipeline (query → retrieve → expand → write). |
| [Building export definitions](./export-definitions.md) | Authoring export-definition YAML: matching keys, filters, embedded objects, field settings, and file expansion. |
| [Importing / deploying datapacks](./import.md) | The deployment pipeline: dependency resolution, ordering, matching, and upsert. |
| [Customizing deployment with specs](./deployment-specs.md) | The deployment-spec extension model and per-datapack-type customization. |

## Conventions

- `vlocode` is the installed command; examples assume it is on your `PATH`.
- `%vlocity_namespace%__` is a placeholder for the Vlocity managed-package
  namespace, substituted at runtime so artifacts stay portable across orgs.
- Code spans such as `Product2` denote a **datapack type**; an `objectType`
  value denotes a Salesforce **SObject API name**. See
  [Concepts](./concepts.md#datapack-type-vs-sobject-type) for the distinction.

## Quick start

```shell
# 1. Install the CLI (Node.js >= 20)
npm install --global @vlocode/cli

# 2. Export a Product2 and all its dependencies into expanded datapack files
vlocode export \
  --definitions ./export-definitions.yaml \
  --type Product2 \
  --query "SELECT Id FROM Product2 WHERE IsActive = true" \
  --depth -1 \
  --expand \
  --output ./datapacks \
  --user source-org

# 3. Deploy the exported datapacks to another org
vlocode deploy ./datapacks --user target-org
```

See the [CLI reference](./cli.md) for authentication options and the full command
surface, and [Exporting](./export.md) / [Importing](./import.md) for the
end-to-end workflows.
