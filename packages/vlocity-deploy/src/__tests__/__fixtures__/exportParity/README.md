# Issue #476: Build Tools / direct export parity

These six fixtures lock the expanded-output contract of **Vlocity Build Tools 1.14.18** for native and managed OmniStudio. All records, IDs, names and payloads are synthetic. No org data or credentials are included.

Each fixture contains:

- `input`: fake Salesforce records, field-reference metadata and matching-key fields.
- `expectedFiles`: the actual files produced by Build Tools, including filenames and JSON text. These are generated independently of Vlocode's direct exporter.

The `Build Tools 1.14.18 export parity (#476)` tests in `datapackExporter.test.ts` run the real direct exporter, definition store and expander with only Salesforce schema/data and matching-key retrieval mocked. They compare all file paths and contents against this frozen oracle. JSON whitespace is disregarded; property order, array order, field presence, value types, source keys and filenames are checked.

Coverage of the four reported differences:

1. Parent/child traversal with multiple parents and repeated sibling sequence numbers; ignored order/level fields must survive until sorting.
2. Mapping priority order, numeric zero, empty fields, and formula mappings tied on every configured sort field, requiring the legacy canonical-JSON tiebreaker.
3. Versionless root and child export identities and matching references, with version 64 still present in the input and deployment matching definition.
4. DataRaptor empty strings, omitted empty script fields, JSON-as-text, recursively ordered JSON properties, positional JSON arrays, IP `_SampleInput.json`, OS `_JavaScript.js`, and XML filenames/content.

## Explicit comparison boundaries

Only two known optional metadata differences are normalized by the test:

- Extra matching fields on **internal** `VlocityMatchingKeyObject` references. Their object type and source-key value are still compared. External lookup objects are not normalized.
- A source key on an unreferenced managed `DRMapItem__c` record. Build Tools omits it; direct export can retain it. Mapping fields, record count and order are still compared.

The fixtures do not represent byte-identical output in those two respects and do not test Salesforce's server-side DataPack export API or deployment. The tools transport adapter provides SObject/reference envelopes from synthetic records, using the empty-string transport convention and native DataRaptor IsActive exclusion observed in the live investigation. Build Tools handles key generation, sorting, pruning, parsing and file expansion itself.

## Regeneration

From the repository root:

```sh
node packages/vlocity-deploy/src/__tests__/__fixtures__/exportParity/generate.mjs
```

This runs offline using the extension's pinned Build Tools dependency and this repository's dependency patches. It does not call the direct exporter. It checks the Build Tools version, rejects attempted network requests and removes its temporary directory afterwards. Review oracle changes rather than regenerating fixtures merely to make a failing direct-export test pass.
