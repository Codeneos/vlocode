[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fvlocity-deploy)

# @vlocode/vlocity-deploy &mdash; a hyper-fast :rocket: Vlocity Datapack deployment library

A pure-JavaScript library that deploys **any** Vlocity / OmniStudio Datapack to Salesforce. Built from scratch to be fast and reliable, with **no dependency on Vlocity APEX REST endpoints, DataRaptors or the Vlocity Build Tools**.

This library is the engine behind the [Vlocode VS Code extension](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode) and the [`@vlocode/cli`](../cli) command-line tool.

## Why it's different

-   :rocket: **10&ndash;20&times; faster** than Vlocity Build Tools / DX on typical projects
-   :computer: Dependency resolution and Datapack &rarr; record conversion happen **client-side**
-   :rainbow: **True delta** &mdash; reliably detects org-side changes without relying on git history
-   :muscle: Battle-tested on production deployments, covered by Jest unit tests
-   :heart: Fully written in **TypeScript** with extensive in-code documentation
-   :pencil2: **Extensible** &mdash; hook into every stage of the deployment with custom specs
-   :page_with_curl: [Fully documented API](https://vlocode.curlybracket.nl/modules/_vlocode_vlocity_deploy.html)

Also:

-   Client-side OmniScript &rarr; LWC compilation and deployment
-   Client-side OmniScript activation that avoids SOQL governor limits for large scripts

## What it does *not* do

-   It deploys; it does not export/retrieve Datapacks
-   It does not yet activate FlexCards
-   It is a library &mdash; for a UI use the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode), for a CLI use [`@vlocode/cli`](../cli)

## Why is Vlocode faster?

Vlocode takes a fundamentally different approach to Datapack deployment. Instead of leaning on server-side APEX REST endpoints and DataRaptors, it does the heavy lifting locally. That removes a *lot* of round-trips: dependency resolution, Datapack-to-record conversion and matching-key lookups all happen in the client.

On large projects with many cross-Datapack dependencies the difference is dramatic. Benchmark from a real project with 1000+ datapacks and 100+ dependencies:

| Tool               | Time    |
| ------------------ | ------- |
| Vlocode            | 7m 54s  |
| Vlocity/OmniStudio | 92m 12s |

## How it works

1.  **Convert** &mdash; all Datapacks are converted into Salesforce records (~5s per 1000 datapacks). Vlocode validates fields against the target org schema and reports unknown fields or invalid values up-front.
2.  **Resolve dependencies** &mdash; Vlocode builds a virtual dependency graph at the **record** level (not the Datapack level), which lets it deploy in the optimal order and chunk aggressively (~1s per 1000 records). For Datapacks that need special handling (e.g. OmniScripts) a *deployment spec registry* lets you hook the process.
3.  **Deploy** &mdash; records are pushed via the Salesforce Collections API (default) or the Bulk API. After insert, Vlocode validates `*GlobalKey__c` field integrity since these are overwritten by Vlocity triggers; mismatches are corrected via a trigger-disabled update.
4.  **Activate** &mdash; OmniScripts and LWCs are activated in parallel via the Tooling API.

## Install

```shell
npm install @vlocode/vlocity-deploy @vlocode/salesforce @vlocode/core
```

## Quick start

`deploy()` takes either an SFDX username/alias or a JSForce-compatible connection.

```js
import { deploy } from '@vlocode/vlocity-deploy';

const deployment = await deploy('./vlocity/datapacks/', {
    sfdxUser: 'user@example.com.testOrg',
    // or: connection: existingJsForceConnection,
    // logger: { write(entry) { console.log(entry.message); } },
});

for (const message of deployment.getMessages()) {
    console.log(`${message.type}: ${message.message}`);
}
```

| Option       | Description |
| ------------ | --- |
| `connection` | A JSForce-compatible connection. If it was not built through `@vlocode/salesforce`, Vlocode will wrap it in a new `vlocode.salesforceConnection` to work around several JSForce bugs that would otherwise break deployments. |
| `sfdxUser`   | When set, Vlocode opens a new SFDX-authenticated connection for you. |
| `logger`     | Custom log writer. See [Custom logging](#custom-logging). |

`deploy()` returns a [`DatapackDeployment`](https://vlocode.curlybracket.nl/classes/_vlocode_vlocity_deploy.DatapackDeployment.html) with full info on every deployed record plus warnings and errors (see `getMessages()`).

## Deploy options

| Option                        | Default | Description |
| ----------------------------- | ------- | --- |
| `disableTriggers`             | `false` | Disable all Vlocity triggers before starting; they are re-enabled when the deployment completes. |
| `maxRetries`                  | `1`     | Number of times to retry a failed insert/update before giving up. |
| `retryChunkSize`              | `5`     | Chunk size used when retrying failed records. Reduces the chance of governor-limit failures from active triggers. |
| `lookupFailedDependencies`    | `false` | If a dependency record fails to deploy, look up an existing org record matching the lookup requirements. Can resolve issues where the parent record cannot be updated, but risks linking to the wrong record. |
| `purgeMatchingDependencies`   | `false` | Delete dependent records (PCIs, attribute assignments, ...) that are linked through a matching dependency before re-deploying. Useful when you want stale child records gone. |
| `purgeLookupOptimization`     | `true`  | When purging embedded Datapacks without matching keys, delete in bulk. Faster, but errors are not attributable to a specific Datapack. |
| `deltaCheck`                  | `false` | Compare each record against the org and update only changed fields. |
| `continueOnError`             | `false` | Keep going on fatal errors. **Do not enable on production**. |
| `strictOrder`                 | `false` | Wait for all records in a Datapack to finish before deploying any dependents. Slower but guarantees Datapack-level ordering. Enable if you see deployment errors caused by ordering. |
| `allowUnresolvedDependencies` | `false` | Allow records with unresolved dependencies to deploy anyway. **Only enable if you know the records are safe to deploy without their dependencies.** |
| `skipLwcActivation`           | `false` | Do not compile/deploy LWC components for OmniScripts during this deployment. |
| `useMetadataApi`              | `false` | Deploy LWC components via the Metadata API instead of the (faster) Tooling API. |
| `remoteScriptActivation`      | `false` | Activate OmniScripts via anonymous APEX on the server instead of generating script definitions locally. |

## Custom logging

Pass a `logger` with a `write(entry)` method &mdash; sync or async &mdash; and Vlocode will hand every log entry to it.

```ts
import { deploy, LogWriter, LogEntry } from '@vlocode/vlocity-deploy';

const logger: LogWriter = {
    write(entry: LogEntry) {
        console.log(`[${entry.level}] ${entry.category}: ${entry.message}`);
    },
};

await deploy('./datapacks', { sfdxUser: 'alias', logger });
```

```ts
interface LogEntry {
    level: LogLevel;
    time: Date;
    category: string;
    message: string;
}
```

## Matching keys

Matching keys decide whether the deployment inserts a new record or updates an existing one. They are loaded from the `DRMatchingKey__mdt` custom metadata in the target org: `MatchingKeyFields__c` lists the fields that uniquely identify a record, and `vlocity_cmt__ObjectAPIName__c` (or the OmniStudio equivalent) names the SObject.

-   **Primary Datapack records must have a matching key.** Without one, every deployment inserts a new record.
-   **Embedded records without a matching key** are treated as fully owned by the parent: existing rows are deleted and replaced. This is convenient for child records that cannot be uniquely identified or whose deletes should propagate from source (e.g. `ProductChildItem__c`).
-   **Non-unique matching keys** trigger a warning and force inserts &mdash; Vlocode will not attempt to match. For example, a `Product2` matching key built only from `ProductFamily` is too coarse and would create duplicates.

## Customising the deployment

Vlocode runs every Datapack through a registry of **deployment specs**. A spec contains Datapack- or SObject-specific logic, and can hook into the deployment lifecycle to mutate records, run pre/post-deployment actions or handle activation.

Specs live in the `DatapackDeploymentSpecRegistry`. Register your own before calling `deploy()`. Defaults for the standard Datapacks ship under `./deploymentSpecs`.

### Example

```js
import { DatapackDeploymentSpecRegistry } from '@vlocode/vlocity-deploy';

// Rewrite "Apple" to "Pear" in Product2 names before deployment.
// Note: this changes the in-memory datapack, not the source file.
DatapackDeploymentSpecRegistry.register(
    { recordFilter: /^Product2$/i },
    {
        preprocess(datapack) {
            datapack.Name = datapack.Name.replace('Apple', 'Pear');
        },
    }
);

// Warn on suspicious records after conversion.
DatapackDeploymentSpecRegistry.register(
    { recordFilter: /^Product2$/i },
    {
        afterRecordConversion(records) {
            for (const record of records) {
                if (record.Name?.includes('Apple')) {
                    record.addWarning('you should not deploy apples');
                }
            }
        },
    }
);

// Register a single hook function inline.
DatapackDeploymentSpecRegistry.register('Product2', 'afterDeploy', event => {
    for (const record of event.records) {
        console.log(`${record.recordId}: ${record.status} (${record.deployTime}ms)`);
    }
});
```

### Hooks

| Hook                    | Params                                | When |
| ----------------------- | ------------------------------------- | --- |
| `preprocess`            | `VlocityDatapack`                     | Before the Datapack is converted into records. Best place to scrub bad field values or auto-populate fields (e.g. OmniScript element ordering). |
| `afterRecordConversion` | `readonly DatapackDeploymentRecord[]` | After conversion, before dependency resolution. You can mutate records but not add or remove them. |
| `beforeDeploy`          | `DatapackDeploymentEvent`             | Once per Datapack, just before its first record is deployed. Equivalent to a Vlocity *pre-step*. |
| `afterDeploy`           | `DatapackDeploymentEvent`             | Once per Datapack, after all its records are deployed. Equivalent to a Vlocity *post-step*. Run activation logic here. |
| `beforeDeployRecord`    | `readonly DatapackDeploymentRecord[]` | Just before a batch of records is sent to Salesforce. All record-level dependencies are resolved at this point. |
| `afterDeployRecord`     | `readonly DatapackDeploymentRecord[]` | After a batch of records is deployed. Use for post-deployment validation; record fields are no longer mutable. |

### Spec interface

```ts
export type DatapackFilter =
    | { recordFilter?: RegExp | string; datapackFilter: RegExp | string }
    | { recordFilter: RegExp | string; datapackFilter?: RegExp | string };

interface DatapackDeploymentSpec {
    preprocess?(datapack: VlocityDatapack): Promise<any> | any;
    afterRecordConversion?(records: readonly DatapackDeploymentRecord[]): Promise<any> | any;
    beforeDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
    afterDeploy?(event: DatapackDeploymentEvent): Promise<any> | any;
    beforeDeployRecord?(event: readonly DatapackDeploymentRecord[]): Promise<any> | any;
    afterDeployRecord?(event: readonly DatapackDeploymentRecord[]): Promise<any> | any;
}
```
