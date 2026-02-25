# AGENTS: vlocode execution guide

Use this file as the canonical runtime contract for coding agents in this repo.

## Runtime contract

- Package manager: `pnpm@10.28.2` (from `packageManager` in root `package.json`)
- Node.js: `>=22` at workspace root (`engines.node`)
- Monorepo manager: `pnpm workspaces` + `lerna-lite`
- CI reference path: `.github/workflows/ci.yml`

## Workspace bootstrap

```bash
corepack enable
corepack prepare "$(node -p "require('./package.json').packageManager")" --activate
pnpm install
```

Linux CI parity (only if missing on your machine):

```bash
sudo apt update
sudo apt-get install -y libsecret-1-dev
```

## High-signal command set

Use these commands unless task-specific instructions override them.

```bash
# full workspace compile/build
pnpm build

# full test pass (same runner used in CI)
pnpm jest --ci --verbose -i

# lint all package source trees
pnpm lint
```

Fast local loop examples:

```bash
# run one test file without coverage overhead
pnpm jest packages/util/src/__tests__/string.test.ts -i --coverage=false

# build a package + its local workspace deps
pnpm run --filter @vlocode/cli... build
pnpm run --filter @vlocode/vlocity-deploy... build
```

## Build setup (what actually happens)

- Root `pnpm build` executes `pnpm run -r build` across workspace packages.
- Build systems are mixed by package:
  - `tsc -b` libraries: `apex`, `core`, `omniscript`, `salesforce`, `util`, `vlocity`, `vlocity-deploy`
  - `tsdown`: `@vlocode/cli`, `vlocode` (VSCode extension), `@vlocode/sass`
- Many packages also define `bundle` via `scripts/esbuild.mjs` for watch/bundle workflows; this emits both CJS and ESM outputs.
- Generated inputs in build flow:
  - `packages/salesforce`: `prebuild` runs `update-registry` (downloads Salesforce metadata registry into `src/registry`)
  - `packages/vlocity-deploy`: `prebuild` regenerates `src/export/exportDefinitions.schema.json`
  - `packages/vscode-extension`: `pre-build` generates command metadata from `commands.yaml`

## Test setup

- Root Jest config: `jest.config.js` (TypeScript via `ts-jest`, coverage enabled by default, reporters include `jest-junit` and `jest-sonar`).
- CI test invocation is serial/in-band: `pnpm jest --ci --verbose -i`.
- Package-specific `jest.config.js` files exist for per-package runs and special mappings (notably `salesforce` and `vscode-extension` path/module mapping).
- For quick iteration, prefer `--coverage=false` and a narrow path/test file selector.

## Important codebase patterns

- Internal package imports use workspace names (`@vlocode/*`) and TypeScript path aliases from root `tsconfig.json`.
- Dependency layering (high-level):
  - base: `@vlocode/util`
  - core: `@vlocode/core` depends on util
  - platform libs: `@vlocode/salesforce`, `@vlocode/vlocity`, `@vlocode/omniscript`
  - orchestration: `@vlocode/vlocity-deploy`
  - executables: `@vlocode/cli`, `vlocode` extension
- Dependency behavior is intentionally constrained by root `pnpm` config:
  - patched third-party deps in `/patches`
  - strict peer dependency checks
  - workspace package preference enabled

## DI container pattern (`@vlocode/core`)

This repo uses a custom DI container from `packages/core/src/di` instead of external IoC frameworks.

- Core APIs:
  - `container` / `Container` from `@vlocode/core`
  - `@injectable()` for service registration
  - `@inject(...)` for constructor/property injection
- Registration behavior:
  - `@injectable()` registers types in the root container (`container.add(...)`)
  - default lifecycle is singleton; use `@injectable.transient()` for transient behavior
  - `provides` + `priority` allow multiple implementations behind an abstract/base type
- Resolution behavior:
  - constructor params are resolved when instance is created by container (`container.get`, `container.new`, `resolve`)
  - property injection is lazy (resolved on first getter access, then cached on instance)
  - circular dependencies are supported through lazy proxy resolution (`@inject(() => Type)`)
- Child scope behavior:
  - `container.create()` creates a child container inheriting parent registrations
  - child registrations can override parent services (useful in tests and task-local overrides)
- Critical compiler requirements (already set in root `tsconfig.json`):
  - `experimentalDecorators: true`
  - `emitDecoratorMetadata: true`
  - `useDefineForClassFields: false`

Agent implications:

- Relevant when:
  - adding/changing services in `core`, `salesforce`, `vlocity*`, `omniscript`, `cli`, or extension command plumbing
  - debugging "undefined dependency" / circular reference / wrong implementation resolution bugs
  - writing tests that need service replacement (prefer child containers + `add`/`use`/factory/provider)
- Usually not relevant for:
  - pure utility code in `@vlocode/util`
  - isolated parser/algorithm changes that do not use container-managed construction

## Agent policy for edits

- Do not hand-edit generated artifacts unless the task is specifically about generated outputs.
- Prefer editing source in `packages/*/src`.
- Before finalizing non-trivial changes, run at least:
  1. `pnpm build`
  2. relevant `pnpm jest ...` scope
  3. `pnpm lint`
