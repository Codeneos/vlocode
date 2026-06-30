# Customizing deployment with specs

A **deployment spec** is the extension point for the import/deploy pipeline. It
contains datapack-specific logic and lets you hook into the deployment process
to manipulate what gets deployed and to run post-deployment activation. Specs are
how Vlocode handles the quirks of OmniScripts, Products, matrices, UI templates
and so on, and they are how you add your own behaviour.

The interface and registry live in
[`datapackDeploymentSpec.ts`](../packages/vlocity-deploy/src/datapackDeploymentSpec.ts)
and
[`datapackDeploymentSpecRegistry.ts`](../packages/vlocity-deploy/src/datapackDeploymentSpecRegistry.ts).
The built-in specs are under
[`deploymentSpecs/`](../packages/vlocity-deploy/src/deploymentSpecs/index.ts).

## The spec lifecycle

A spec implements one or more hooks. Every hook is **optional** — only the ones
you implement run. They fire at these points in the deployment (see the full
pipeline in [Importing / deploying datapacks](./import.md#how-deployment-works)):

| Hook | When it runs | Typical use |
| --- | --- | --- |
| `preprocess(datapack)` | Before the datapack is converted to records. | Patch/clean field values, drop fields, set generated values (e.g. OmniScript element order). |
| `afterRecordConversion(records)` | After conversion, before dependency resolution. | Inspect or mutate individual records; add dependencies. Records cannot be removed here. |
| `beforeDependencyResolution(records)` | Before dependencies are resolved. | Adjust lookups/dependencies before resolution runs. |
| `beforeDeploy(event)` | Once per datapack, before its first record deploys. | Group-level setup. |
| `beforeDeployRecord(records)` | Before each batch of records is deployed. | Last-chance field adjustments. |
| `beforeRetryRecord(records)` | Before a failed record is retried. | Adjust state to make a retry succeed. |
| `afterDeployRecord(records)` | After each batch is deployed. | React to deployed Ids. |
| `afterDeploy(event)` | Once per datapack, after all its records deploy. | Activation, compilation, purge, verification. |
| `onRecordError(records)` | When a record fails. | Custom error handling/diagnostics. |

Hooks may be synchronous or return a `Promise`. The `event` passed to
`beforeDeploy`/`afterDeploy` is a
[`DatapackDeploymentEvent`](../packages/vlocity-deploy/src/datapackDeploymentEvent.ts)
that exposes the datapack's records — e.g. `event.getRecords(sobjectType)` and
`event.getDeployedRecords(sobjectType)` (SObject type given without the namespace
prefix).

## Writing a spec

Decorate a class with `@deploymentSpec(filter)` and implement the hooks you need.
The decorator both registers the spec and adds it to the DI container as a
transient service, so the spec can itself receive injected dependencies.

```ts
import { deploymentSpec } from '../datapackDeploymentSpecRegistry';
import type { DatapackDeploymentSpec } from '../datapackDeploymentSpec';
import { VlocityDatapack } from '@vlocode/vlocity';
import { DatapackDeploymentEvent } from '../datapackDeploymentEvent';

@deploymentSpec({ recordFilter: /^Product2$/i })
export class Product2 implements DatapackDeploymentSpec {

  // Fix invalid dates that a Vlocity trigger would otherwise rewrite.
  public preprocess(datapack: VlocityDatapack) {
    // ...mutate datapack fields...
  }

  // Run activation once the whole datapack is deployed.
  public async afterDeploy(event: DatapackDeploymentEvent) {
    const products = event.getDeployedRecords('Product2');
    // ...post-deploy work...
  }
}
```

This mirrors the real
[`Product2`](../packages/vlocity-deploy/src/deploymentSpecs/product2.ts) spec,
which patches selling/effective/fulfillment dates in `preprocess` so they survive
Vlocity's post-insert triggers.

## The filter

`@deploymentSpec` takes a `DatapackFilter` that decides which datapacks or
records the spec applies to. You must provide at least one of:

- `recordFilter` — a `RegExp` or string matched against each record's **SObject
  type**.
- `datapackFilter` — a `RegExp` or string matched against the **datapack type**.

```ts
// Applies to several related record types
@deploymentSpec({ recordFilter: /^(Product2|Price(ListEntry__c|bookEntry))$/i })

// Applies to a whole datapack type
@deploymentSpec({ datapackFilter: 'OmniScript' })
```

Filters are matched against **normalized** (namespace-stripped) names, so write
`Product2`, not `vlocity_cmt__Product2__c`.

## Registration

Specs are registered in one of two ways:

1. **Decorator (recommended).** `@deploymentSpec(...)` registers the class on the
   global
   [`DatapackDeploymentSpecRegistry`](../packages/vlocity-deploy/src/datapackDeploymentSpecRegistry.ts).
   Built-in specs are wired up by importing them in
   [`deploymentSpecs/index.ts`](../packages/vlocity-deploy/src/deploymentSpecs/index.ts);
   importing that module (which `@vlocode/vlocity-deploy` does) triggers their
   decorators. To register your own spec, make sure its module is imported before
   you create a deployment.

2. **Programmatic.** Call the registry directly:

   ```ts
   import { DatapackDeploymentSpecRegistry } from '@vlocode/vlocity-deploy';

   DatapackDeploymentSpecRegistry.register(
     { datapackFilter: 'MyCustomType' },
     MyCustomSpec,            // class or instance
   );
   ```

   A bare string is treated as a `datapackFilter`. You can also register a single
   hook function with `registerFunction(datapackType, functionName, executor)`.

When a datapack is deployed, every spec whose filter matches participates, so
multiple specs can layer behaviour onto the same datapack.

## Built-in specs as examples

The bundled specs are the best reference for real-world patterns. A sampling:

- **OmniStudio** — `OmniScript`, `OmniProcess`, `OmniUiCard`,
  `OmniDataTransform`: script/LWC activation and element ordering.
- **Vlocity classic** — `VlocityCard`, `VlocityUILayout`, `VlocityUITemplate`,
  `DataRaptor`, `CalculationMatrix`, `DecisionMatrix`.
- **Standard objects** — `Product2` (date fixups), `ProductChildItem`
  (price-book dependencies), `ContentVersion` (attachments), `RecordType`
  visibility.
- **Utilities** — `MatchingFields`, `PreprocessorMessages`, `RecordActivator`.

Browse [`deploymentSpecs/`](../packages/vlocity-deploy/src/deploymentSpecs/index.ts) to
see how each one uses the hooks above.

## Customizing export

The export side has its own, lighter extension model rather than specs:

- **Export definitions** are the primary customization surface — matching keys,
  filters, embedded objects, file expansion. See
  [Building export definitions](./export-definitions.md).
- **Field processors** (`processor:` in a field definition) run a JavaScript
  snippet to transform a value during export.
- **Scoped definitions.** The
  [`DatapackExportDefinitionStore`](../packages/vlocity-deploy/src/export/exportDefinitionStore.ts)
  supports loading definitions under a named *scope* (e.g. an industry or
  org-specific overlay) that overrides the global definitions for a given
  export. Load scoped definitions with `store.load(defs, { scope })` and pass the
  matching `scope` in the export context.

Both engines are built on the `@vlocode/core` dependency-injection container, so
services they depend on (Salesforce access, matching-key resolution, logging) can
be substituted by registering alternative implementations in the container.
