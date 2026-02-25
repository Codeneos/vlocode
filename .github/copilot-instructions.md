# Copilot Agent Bootstrap

Primary instruction source: [`AGENTS.md`](../AGENTS.md)

## Mandatory defaults

- Use `pnpm` (not npm/yarn).
- Use Node `>=22`.
- Execute from repo root unless task explicitly requires package-local context.

## Validate changes with CI-equivalent commands

```bash
pnpm build
pnpm jest --ci --verbose -i
pnpm lint
```

## Fast scoped execution

```bash
# package + dependencies
pnpm run --filter @vlocode/cli... build

# focused test file, faster local loop
pnpm jest packages/<pkg>/src/__tests__/<name>.test.ts -i --coverage=false
```

## Generated-output guardrails

- Do not manually edit generated files when a generator exists.
- Regenerated artifacts include:
  - Salesforce registry files (`@vlocode/salesforce` prebuild/prepare)
  - `exportDefinitions.schema.json` (`@vlocode/vlocity-deploy` prebuild)
  - extension command metadata generated from `packages/vscode-extension/commands.yaml`

