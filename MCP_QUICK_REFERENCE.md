# Vlocode Monorepo - Quick Reference for MCP Package Creation

## 📦 10 Key Findings

### 1️⃣ Monorepo Structure
- **Type:** pnpm workspace + Lerna Lite versioning
- **Packages:** 10 total (9 @vlocode/* + 1 vlocode extension)
- **Core Stack:** TypeScript, DI Container, Logger, File System abstraction

### 2️⃣ NO Existing MCP Package ✅
- Clear opportunity for new `@vlocode/mcp` package
- No naming conflicts

### 3️⃣ VSCode Extension at `/packages/vscode-extension`
```
src/
├── commands/       # Datapack, apex, logs, metadata, profiles commands
├── lib/
│   ├── commandRouter.ts     # Command registration & routing
│   ├── commandBase.ts       # Base command class
│   ├── vlocodeService.ts    # Main extension service
│   └── salesforce/vlocity/  # Domain logic
├── treeDataProviders/       # Explorer views
├── codeLensProviders/       # Code lenses
└── events/                  # File watchers, handlers
```

### 4️⃣ Commands via @vscodeCommand Decorator
```typescript
@vscodeCommand('vlocode.selectOrg')
export class SelectOrgCommand extends CommandBase {
  public async execute(...args) { }
}
// Commands automatically registered by CommandRouter
```

### 5️⃣ API Export Pattern (Simple)
All packages use:
```typescript
// src/index.ts
export * from './module1';
export * from './module2';
// ...
```
No `exports` field needed - direct index import pattern

### 6️⃣ Simple Package Example: @vlocode/util
```
packages/util/
├── package.json (main: "src/index.ts")
├── tsconfig.json (extends root)
├── src/
│   ├── async.ts, cache.ts, collection.ts, ...
│   └── index.ts (re-exports all)
└── dist/ (published output)
```

### 7️⃣ Datapack APIs: @vlocode/vlocity-deploy
```typescript
export * from './datapackDeployer';
export * from './datapackDeployment';
export * from './datapackDeploymentOptions';
export * from './deploymentSpecs';  // 25+ specs (OmniScript, OmniCard, etc)
export * from './export';
```
**Key Classes:** DatapackDeployer, DatapackDeployment, DatapackDeploymentSpec

### 8️⃣ Salesforce APIs: @vlocode/salesforce
```typescript
SalesforceService has:
  .schema         // SalesforceSchemaService
  .deploy         // SalesforceDeployService  
  .data           // SalesforceDataService (CRUD)
  .logs           // DeveloperLogs
  .batch          // SalesforceBatchService
  .tooling        // Tooling API service

Plus: queryBuilder, queryService, metadataRegistry, etc
```

### 9️⃣ DI Container Usage Pattern
```typescript
import { injectable, inject, container, LifecyclePolicy } from '@vlocode/core';

@injectable({ lifecycle: LifecyclePolicy.singleton })
export class MyService {
  @inject() private readonly dependency: OtherService;
  
  constructor(
    @inject(SalesforceService) private sf: SalesforceService
  ) {}
}

// Usage
const instance = container.get(MyService);
const child = container.create();  // Child container
```

### 🔟 Config Conventions
**tsconfig.json:**
```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,   // ⚠️ REQUIRED
    "experimentalDecorators": true,  // ⚠️ REQUIRED
    "useDefineForClassFields": false, // ⚠️ REQUIRED for @inject
    "module": "node20",
    "target": "es2022"
  }
}
```

**package.json:**
```json
{
  "name": "@vlocode/package-name",
  "main": "src/index.ts",
  "publishConfig": {
    "main": "dist/index.js",
    "typings": "dist/index.d.ts"
  },
  "files": ["dist/**/*.js", "dist/**/*.d.ts"],
  "dependencies": { "@vlocode/core": "workspace:*" }
}
```

---

## 📁 Key File Paths for Reference

### Core DI Framework
- `/packages/core/src/di/container.ts` - Container implementation (800+ lines)
- `/packages/core/src/di/injectable.decorator.ts` - @injectable decorator
- `/packages/core/src/di/inject.decorator.ts` - @inject decorator

### Command System
- `/packages/vscode-extension/src/lib/commandRouter.ts` - Command registration
- `/packages/vscode-extension/src/lib/commandBase.ts` - Base command class
- `/packages/vscode-extension/src/commands/selectOrgCommand.ts` - Example command

### Salesforce APIs
- `/packages/salesforce/src/salesforceService.ts` - Main service (26KB)
- `/packages/salesforce/src/schema/` - Schema APIs
- `/packages/salesforce/src/queryService.ts` - Query service

### Deployment Engine
- `/packages/vlocity-deploy/src/datapackDeployer.ts` - Main deployer
- `/packages/vlocity-deploy/src/datapackDeployment.ts` - Deployment lifecycle
- `/packages/vlocity-deploy/src/deploymentSpecs/` - 25+ component specs

### Configuration
- `/tsconfig.json` - Root config with path mappings
- `/pnpm-workspace.yaml` - Workspace configuration
- `/lerna.json` - Version management

---

## �� MCP Package Template

```
packages/mcp/
├── package.json
├── tsconfig.json
├── jest.config.js
├── CHANGELOG.md
├── README.md
└── src/
    ├── __tests__/
    │   └── mcpServer.test.ts
    ├── index.ts                 # Main exports
    ├── mcpServer.ts             # MCP server implementation
    ├── resources/
    │   ├── index.ts
    │   ├── datapackResource.ts
    │   └── schemaResource.ts
    ├── tools/
    │   ├── index.ts
    │   ├── deployTool.ts
    │   └── querySoqlTool.ts
    ├── prompts/
    │   ├── index.ts
    │   └── deploymentPrompts.ts
    └── services/
        ├── index.ts
        ├── mcpResourceManager.ts
        └── mcpToolManager.ts
```

---

## 🔗 Workspace Dependencies

Use `workspace:*` for internal dependencies:
```json
{
  "dependencies": {
    "@vlocode/core": "workspace:*",
    "@vlocode/util": "workspace:*",
    "@vlocode/salesforce": "workspace:*",
    "@vlocode/vlocity": "workspace:*",
    "@vlocode/vlocity-deploy": "workspace:*"
  }
}
```

---

## ✅ Checklist for New Package

- [ ] Create `/packages/mcp/` directory
- [ ] Copy `package.json` template and update name
- [ ] Copy `tsconfig.json` and set references
- [ ] Add `src/index.ts` with exports
- [ ] Add `src/__tests__/` with jest.config.js reference
- [ ] Add to pnpm-workspace.yaml (auto if in packages/*)
- [ ] Create services using @injectable/@inject pattern
- [ ] Run `pnpm install` to link package
- [ ] Run `pnpm build` to test compilation
- [ ] Run `pnpm test` for tests
- [ ] Update root `tsconfig.json` path mappings for "@vlocode/mcp"

