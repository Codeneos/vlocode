# @vlocode/dplint

An offline linter for Vlocity/SFI DataPacks. Validate references, source keys, record types, CPQ price rule conditions, and project-specific formulas before deploying. The package includes the `dplint` executable and a TypeScript API. It does not need an org connection or modify DataPack files.

## Install and run

Requires Node.js 22 or newer.

```sh
npm install --save-dev @vlocode/dplint
npx dplint ./catalog
npx dplint 'catalog/**/*_DataPack.json' --config dplint.config.yaml
npx dplint ./catalog --format sarif --output dplint.sarif
```

The Vlocode CLI also exposes the same options through `vlocode lint`:

```sh
vlocode lint ./catalog --format json --output dplint.json
```

From a checkout of this monorepo:

```sh
pnpm --filter @vlocode/dplint build
node packages/dplint/bin/dplint.cjs ./catalog
```

## VS Code integration

The Vlocode extension runs dplint automatically and displays findings in the Problems panel and at their JSON source locations. Duplicate-key findings link to the first occurrence. Validation runs when a workspace opens and after saved JSON files or the workspace's dplint configuration change. It checks saved files on disk; unsaved edits are validated after saving.

Background linting is enabled by default. Disable it in User, Workspace, or Workspace Folder settings:

```json
{
  "vlocity.datapackLint.enabled": false
}
```

The setting takes effect immediately: disabling clears diagnostics, removes file watchers, and cancels validation; enabling starts a new check. Each workspace folder uses its own discovered dplint YAML/JSON configuration. A config's `files` setting selects the inputs; without it, the extension detects `*_DataPack.json` headers and follows their child JSON files. Workspace folders are validated independently, so related DataPacks should belong to the same workspace folder for cross-pack reference checks. Background workers run one folder at a time and release their memory after validation, keeping large catalogs off the extension host. The integration supports filesystem workspaces, including those opened in a remote extension host.

## What is a DataPack?

- **Expanded exports:** a `*_DataPack.json` header and the child JSON files it references form one logical DataPack. Child filenames are resolved relative to the file containing the filename, including strings in arrays. Children are loaded recursively, even when only the header was selected. When additional JSON files are selected from a folder with exactly one selected header, files without an explicit owner share that header's matching-reference scope, even if the header omits their filenames. Their referenced children inherit that scope as well. Explicit file references take precedence over this folder association.
- **Inline exports:** a JSON file containing records and nested children is one DataPack. Standalone files without a header are also supported.
- **Build Tools bundles:** each entry in a top-level `dataPacks` array is its own local matching-reference scope.

Selecting a directory checks all its `*.json` files recursively, including unreferenced child files. Quote globs to let the linter expand them consistently across shells. Overlapping paths are deduplicated. Files referenced by several headers are indexed once and must satisfy local references in every containing DataPack. Two independent headers in the same folder remain separate; an unreferenced file in that folder stays standalone because its owner is ambiguous. The linter's folder association does not add missing child-file fields to a header or change which files the deployment loader includes.

Only selected files and their JSON children participate in lookup resolution. Run against the full catalog when checking cross-DataPack references; selecting only changed files can report references to unchanged files as missing. Source keys are compared exactly, including case and namespace placeholders. Ordinary field values ending in `.json` are interpreted as relative child-file references, following the export loader convention. Text, scripts, and binary assets are not parsed as JSON.

## Configuration

Use `--config <path>` or place one of these files in the current directory. The first match wins; configs are not merged or inherited from parent folders:

1. `dplint.config.yaml`
2. `dplint.config.yml`
3. `dplint.config.json`
4. `.dplintrc.yaml`, `.dplintrc.yml`, `.dplintrc.json`

Paths in `files` and `ignore` are relative to the working directory, including when `--config` points elsewhere. Explicit input arguments override `files`. The default input is the current directory. Configuration files with the names above, `node_modules`, and `.git` are excluded from directory/glob discovery. Explicit configs are also excluded by the CLI. Ignored files are not loaded or indexed, including when referenced as children.

```yaml
files:
  - catalog
ignore:
  - '**/fixtures/**'
  - '**/archive/**'
rules:
  json-syntax: error
  file-reference: error
  matching-reference: error
  lookup-reference:
    - warn
    - excludeObjects: [RecordType, User, Pricebook2]
  unique-source-key: error
  datapack-type: error
  price-rule-conditions: error

  active-product-name:
    type: formula
    severity: error
    objectTypes: [Product2]
    when: IsActive = TRUE
    assert: NOT(ISBLANK(Name))
    message: Active products must have a name.
    field: Name

  positive-quantity:
    type: formula
    severity: warn
    objectTypes: [SBQQ__ProductOption__c]
    when: NOT(ISBLANK(SBQQ__Quantity__c))
    assert: SBQQ__Quantity__c > 0
    message: Product option quantity must be positive.
    field: SBQQ__Quantity__c
```

The equivalent JSON uses the same structure:

```json
{
  "files": ["catalog"],
  "rules": {
    "lookup-reference": ["warn", { "excludeObjects": ["RecordType", "User"] }],
    "price-rule-conditions": "off",
    "product-name": {
      "type": "formula",
      "objectTypes": ["Product2"],
      "assert": "NOT(ISBLANK(Name))",
      "message": "Products must have a name.",
      "field": "Name"
    }
  }
}
```

Every built-in rule defaults to `error`. Use `off` to disable a rule, `warn` for warnings, or `error` for failures. Configurable built-ins use `[severity, options]`. Formula rules use their `severity` property (default `error`); set it to `off` to disable the formula. Rule IDs must be unique. Unknown rule IDs, invalid settings, unsupported options, and invalid enabled formulas are configuration errors, even when no records match the formula.

Quote formulas such as `"TRUE"`, `"FALSE"`, or `"1"` in YAML so they remain strings instead of being interpreted as YAML Boolean or numeric values.

## Built-in rules

| Rule ID | Validation / options |
| --- | --- |
| `json-syntax` | Strict JSON parsing, including child files. Comments and trailing commas are rejected. Invalid files produce diagnostics and other files are still checked. |
| `file-reference` | Referenced child JSON files must exist. Circular child-file references are reported. |
| `matching-reference` | `VlocityMatchingRecordSourceKey` must match a record's `VlocityRecordSourceKey` inside the same logical DataPack. |
| `lookup-reference` | `VlocityLookupRecordSourceKey` must match a record's `VlocityRecordSourceKey` anywhere in the validated input. `excludeObjects` defaults to `[RecordType, User]`; a configured list replaces the defaults. The object type comes from `VlocityRecordSObjectType`, falling back to the key prefix. |
| `unique-source-key` | No two record occurrences may declare the same `VlocityRecordSourceKey`, including within a file. Each occurrence after the first is reported with the first location attached. References are not record declarations. |
| `datapack-type` | Records must declare `SObject`; matching references must declare `VlocityMatchingKeyObject`; lookup references must declare `VlocityLookupKeyObject` or the existing Vlocity spelling `VlocityLookupMatchingKeyObject`. Keys must be non-empty strings and key roles cannot be combined. Keyless `SObject` children remain valid. |
| `price-rule-conditions` | For `SBQQ__PriceRule__c` with `SBQQ__ConditionsMet__c = Custom`, require valid advanced logic and ensure every referenced index belongs to that rule's `SBQQ__PriceCondition__c` records. Indexes use `SBQQ__Index__c`, not array positions. |

For strict lookup-type spelling, configure:

```yaml
rules:
  datapack-type:
    - error
    - lookupTypes: [VlocityLookupKeyObject]
```

CPQ advanced logic supports positive condition indexes, parentheses, `AND`, `OR`, and `NOT`, for example `1 AND (2 OR 3)`. Every branch is checked. Conditions are associated using their `SBQQ__Rule__c` reference, or their containing rule for inline children without that reference. Conditions belonging to another rule cannot satisfy the expression.

Disabling or downgrading `json-syntax` skips invalid files for other checks. References into those files can consequently be reported as missing.

## Formula rules

A formula applies to record objects with `VlocityRecordSObjectType`, including nested children. Lookup and matching reference objects are skipped. `objectTypes` optionally restricts the rule to exact object type names. `when` defaults to true. When it is true, `assert` must evaluate to **true** for the record to pass. `field` optionally attaches the diagnostic to a field in the original JSON; otherwise it points to the record.

This is a deliberately small, deterministic subset inspired by [Salesforce formulas](https://help.salesforce.com/s/articleView?id=sf.customize_functions_parent.htm&language=en_US&type=5). It is not a complete Salesforce formula engine and does not evaluate stored Salesforce formula strings automatically.

| Feature | Supported syntax |
| --- | --- |
| Literals | Numbers, single/double quoted strings, `TRUE`, `FALSE`, `NULL` |
| Fields | `Name`, `SBQQ__Quantity__c`, `Parent.Name`, `$Record.Name` |
| Comparisons | `=`, `==`, `!=`, `<>`, `<`, `<=`, `>`, `>=` |
| Boolean logic | `AND(...)`, `OR(...)`, `NOT(...)`, infix `AND`/`OR`, `&&`, `||`, `!` |
| Arithmetic | `+`, `-`, `*`, `/`, `%`, unary `+`/`-`, parentheses |
| Text concatenation | `&` |
| Conditional / blank checks | `IF`, `ISBLANK`, `BLANKVALUE` |
| Text / conversion | `TEXT`, `VALUE`, `LEN`, `LOWER`, `UPPER`, `TRIM`, `CONTAINS`, `BEGINS`, `ISPICKVAL` |
| Numeric functions | `ABS`, `MIN`, `MAX` |

Function names, Boolean literals, and field identifiers are case-insensitive; text equality is case-sensitive. Missing fields are blank. `ISBLANK` is true for missing values, `null`, and the empty string; it is false for `0`, `false`, and whitespace. Equality compares types without coercion, treating missing fields as `null`. Numeric operations and ordered comparisons accept numbers or numeric strings; other values cause an evaluation diagnostic. Use `TEXT` for explicit text conversion and `VALUE` for numeric conversion. Nested field access reads the JSON object as stored; it does not dereference source keys or child filenames. Object/array values cannot be used as scalar operands.

`IF`, `AND`, and `OR` short-circuit. Both `when` and `assert` require Boolean results. Invalid runtime values, division by zero, and non-Boolean assertions produce diagnostics at the rule's configured severity. There is no JavaScript evaluation, access to process globals, arbitrary function execution, dates, regular expressions, or Salesforce database access.

## Output and CI

```sh
dplint catalog --max-warnings 0
dplint catalog --format json --output artifacts/dplint.json
dplint catalog --format sarif --output artifacts/dplint.sarif
```

Create the output directory first. `--output` writes the report to that file; otherwise stdout contains only the requested report. Operational errors go to stderr. Findings are ordered by file, line, column, rule, and message.

| Format | Intended use |
| --- | --- |
| `text` (default) | Terminal output with `file:line:column`, severity, rule ID, JSON pointer, and summary. |
| `json` | Structured results with `files`, `diagnostics`, `errorCount`, `warningCount`, and rule metadata. Paths are absolute; lines and columns are one-based; pointers follow JSON Pointer escaping. |
| `sarif` | [SARIF 2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/os/sarif-v2.1.0-os.html) results for code-scanning integrations. Includes rule metadata, source regions, and related duplicate locations. Paths inside the working directory use a source-root URI base. |

Exit codes:

- `0`: no errors; warnings are allowed unless `--max-warnings` is exceeded.
- `1`: lint errors or too many warnings. The report is still complete.
- `2`: configuration, usage, file I/O, or rule execution failure. An unmatched input glob or empty selection is an error, preventing accidental empty CI checks.

Use `--help`, `--version`, and `--list-rules` for executable details. CI can gate deployment directly on the exit status. Upload report artifacts even after exit code `1`; for code scanning, send the SARIF report to your platform's SARIF upload step. Keep generated reports outside the input directory or ignore them.

## Library API and extension rules

```ts
import { lint, loadConfig, formatResult } from '@vlocode/dplint';

const result = await lint(['catalog'], {
    cwd: process.cwd(),
    config: await loadConfig('dplint.config.yaml')
});
console.log(formatResult(result, 'text'));
process.exitCode = result.errorCount ? 1 : 0;
```

`lint` does not automatically load config files: pass a config object or call `loadConfig`. It returns findings without logging or changing process exit status. Operational/configuration failures reject the promise. Configured formula rules work identically through the API and CLI.

For checks that need more than formulas, supply `RuleDefinition` objects:

```ts
import { lint, type RuleDefinition } from '@vlocode/dplint';

const productCode: RuleDefinition = {
    id: 'product-code',
    description: 'Products must have a product code',
    defaultSeverity: 'warn',
    create() {
        return context => {
            for (const node of context.nodes) {
                if (node.value.VlocityDataPackType === 'SObject' &&
                    node.value.VlocityRecordSObjectType === 'Product2' &&
                    !node.value.ProductCode) {
                    context.report(node, 'ProductCode is required', 'ProductCode');
                }
            }
        };
    }
};

const result = await lint(['catalog'], {
    rules: [productCode],
    config: { rules: { 'product-code': 'error' } }
});
```

`create(options)` runs once per enabled rule, before input loading. Validate your options there and return a synchronous or asynchronous check. The context provides record/reference nodes, parent nodes, logical `packIds`, the global `sourceKeys` index, `location(node, field?)`, and `report(nodeOrLocation, message, field?, relatedLocations?)`. Treat node values and indexes as read-only. Put run-specific state in `create`, not in shared module variables. Additional rules cannot replace built-ins or each other.

The public package also exports configuration/result types, `builtinRules`, `createFormulaRule`, `compileFormula`, `formatResult`, and the CLI helpers `lintCommandOptions`, `executeLint`, and `runCli`. Custom JavaScript rules are supplied by the embedding application; config files contain only data and formula definitions and do not load executable plugins.
