# Vlocode Monorepo Exploration Summary

## 1. Monorepo Structure & Packages

**Location:** `/home/runner/work/vlocode/vlocode`

**Monorepo Type:** pnpm workspace with Lerna Lite versioning

### Packages Overview:

| Package | Location | Purpose |
|---------|----------|---------|
| **@vlocode/core** | `packages/core` | IoC container framework, logging, file system abstraction |
| **@vlocode/util** | `packages/util` | Utility library with async, string, object, salesforce helpers |
| **@vlocode/salesforce** | `packages/salesforce` | Salesforce APIs (SOAP, REST, Bulk, Metadata, Query, Deploy, Schema) |
| **@vlocode/vlocity** | `packages/vlocity` | Vlocity/OmniStudio shared functionality |
| **@vlocode/vlocity-deploy** | `packages/vlocity-deploy` | Datapack deployment library (core deployment engine) |
| **@vlocode/omniscript** | `packages/omniscript` | OmniScript compilation and processing |
| **@vlocode/apex** | `packages/apex` | Apex parser and grammar |
| **@vlocode/sass** | `packages/sass` | SASS compiler for Vlocity |
| **@vlocode/cli** | `packages/cli` | CLI tool for datapack deployment |
| **vlocode** | `packages/vscode-extension` | VSCode extension for Vlocity/OmniStudio development |

---

## 2. No Existing MCP Package

**Result:** ✅ No MCP (Model Context Protocol) package exists
- Searched for "mcp", "MCP", "model-context-protocol" in all `package.json` files
- No hits found
- This is a good opportunity to create a new `@vlocode/mcp` package

---

## 3. VSCode Extension Package Structure

**Location:** `/home/runner/work/vlocode/vlocode/packages/vscode-extension`

### Key Files:
- **`package.json`** (71.1 KB) - Extension manifest with bin, publisher info
- **`commands.yaml`** - Declarative command definitions for VSCode menus
- **`src/extension.ts`** - Main entry point
- **`src/commands/`** - Command implementations
- **`src/lib/`** - Core services and utilities
- **`tsconfig.json`** - TypeScript configuration
- **`jest/`** - Test configuration

### Directory Structure:
```
packages/vscode-extension/
├── build/                    # Build output
├── commands.yaml            # Command declarations
├── jest/                    # Jest test setup
├── jest.config.js
├── loader.mjs              # Custom loader
├── package.json            # Extension manifest
├── resources/              # Static resources
├── src/
│   ├── commands/           # Command implementations
│   │   ├── apex/
│   │   ├── datapacks/
│   │   ├── developerLogs/
│   │   ├── metadata/
│   │   ├── profiles/
│   │   ├── index.ts
│   │   ├── selectOrgCommand.ts
│   │   ├── execRestApiCommand.ts
│   │   └── ...
│   ├── lib/
│   │   ├── commandBase.ts         # Base class for commands
│   │   ├── commandRouter.ts       # Command registration & routing
│   │   ├── vlocodeService.ts      # Main service
│   │   ├── vlocodeContext.ts      # Context utilities
│   │   ├── config/                # Configuration
│   │   ├── ui/                    # UI utilities
│   │   ├── vlocity/               # Vlocity-specific logic
│   │   └── salesforce/            # Salesforce-specific logic
│   ├── treeDataProviders/         # Explorers (datapacks, logs, jobs)
│   ├── codeLensProviders/         # Code lens implementations
│   ├── contentProviders/          # Virtual content providers
│   ├── events/                    # Event handlers
│   ├── symbolProviders/           # Symbol providers
│   ├── constants.ts               # Extension constants
│   └── extension.ts               # Main entry point
├── syntax/                  # Syntax definitions
├── types/                   # Type definitions
└── tsconfig.json
```

---

## 4. Commands Structure (commands.yaml)

**File:** `/home/runner/work/vlocode/vlocode/packages/vscode-extension/commands.yaml`

### Structure:
```yaml
# Command ID: vlocode.selectOrg
vlocode.selectOrg:
  title: 'Vlocode: Select Salesforce Org'
  group: v_vlocity
  menus:
    - menu: commandPalette

# Datapack commands with conditionals
vlocode.refreshDatapack:
  title: 'Datapack: Refresh from Org'
  group: v_vlocity
  when: 'vlocode.conditionalContextMenus == false || resourcePath in vlocode.datapacks'
  menus:
    - menu: commandPalette
    - menu: explorer/context
    - menu: editor/context

vlocode.deployDatapack:
  title: 'Datapack: Deploy to Org'
  # ... similar structure

vlocode.openSalesforce:
  title: 'Datapack: Open in Org'

vlocode.renameDatapack:
  title: 'Datapack: Rename...'

vlocode.cloneDatapack:
  title: 'Datapack: Clone...'

vlocode.exportDatapack:
  title: 'Datapack: Export from Org'
```

### Key Examples:
- **Extension setup:** `vlocode.selectOrg` - Org selection
- **Vlocity basics:** Refresh, Deploy, Open, Rename, Clone, Export datapacks
- **Developer tools:** Execute Anonymous, REST API execution, Logs
- **Metadata:** Operations on Salesforce metadata
- **Groups:** Commands grouped with `group: v_vlocity` for organization

---

## 5. API Export Patterns

### @vlocode/util (Simple Utility Package)

**File:** `/home/runner/work/vlocode/vlocode/packages/util/src/index.ts`

```typescript
export * from './async';              // Promise utilities
export * from './cache';              // Caching
export * from './cancellationToken';  // Cancellation support
export * from './collection';         // Collection utilities
export * from './compiler';           // Compilation utilities
export * from './decorator';          // Decorator utilities
export * from './events';             // Event management
export * from './fs';                 // File system
export * from './object';             // Object utilities
export * from './string';             // String utilities
export * from './salesforce';         // Salesforce-specific
export * from './sfdx';               // SFDX utilities
export * from './types';              // Type definitions
```

**Package Structure:**
- Uses `main: "src/index.ts"` for development
- Published to `dist/index.js` with `dist/index.d.ts` types
- No `exports` field (direct index export pattern)
- Include `dist/**/*.js`, `dist/**/*.d.ts` in files

### @vlocode/core (DI Container Package)

**File:** `/home/runner/work/vlocode/vlocode/packages/core/src/index.ts`

```typescript
export * from './di/container';
export * from './di/injectable.decorator';
export * from './di/inject.decorator';
export * from './fs';
export * from './logging';
export * from './logging/writers';
export * from './deferredWorkQueue';
```

**Key Exports:**
- Container class (DI framework)
- `@injectable` decorator
- `@inject` decorator
- Logger, LogManager
- FileSystem abstractions
- DeferredWorkQueue

### @vlocode/salesforce (Complex API Package)

**File:** `/home/runner/work/vlocode/vlocode/packages/salesforce/src/index.ts`

```typescript
export * from './bulk';
export * from './connection';
export * from './deploy';
export * from './schema';
export * from './queryBuilder';
export * from './queryService';
export * from './salesforceService';
export * from './salesforceSchemaService';
export * from './metadataRegistry';
// ... 30+ exports total
```

**Main Services:**
- **SalesforceService** - Main service with connections, APIs, batch, tooling, logs
- **SalesforceSchemaService** - Schema operations
- **SalesforceDataService** - Data operations
- **SalesforceBatchService** - Batch operations
- **QueryService**, **QueryBuilder** - SOQL operations
- **RestClient**, **SoapClient** - API clients

---

## 6. Simple Package Structure (@vlocode/util)

**Location:** `/home/runner/work/vlocode/vlocode/packages/util`

### Directory Layout:
```
packages/util/
├── CHANGELOG.md
├── jest.config.js
├── package.json                # Main configuration
├── tsconfig.json               # TypeScript config
└── src/
    ├── __tests__/              # Jest test directory
    ├── async.ts               # ~15KB - async utilities
    ├── cache.ts               # ~9KB - caching
    ├── cancellationToken.ts   # ~2.6KB
    ├── collection.ts          # ~24KB - collection utils
    ├── compiler.ts            # ~4.4KB
    ├── decorator.ts           # ~7.4KB
    ├── events.ts              # ~12KB - event system
    ├── fs.ts                  # ~3.9KB
    ├── lazy.ts                # ~1.6KB
    ├── object.ts              # ~31KB - object utilities
    ├── salesforce.ts          # ~6.9KB
    ├── sfdx.ts                # ~26KB - SFDX integration
    ├── string.ts              # ~16KB - string utilities
    └── index.ts               # Main export file
```

### package.json Pattern:
```json
{
  "name": "@vlocode/util",
  "version": "1.41.1",
  "description": "Vlocode utility library",
  "main": "src/index.ts",
  "publishConfig": {
    "main": "dist/index.js",
    "typings": "dist/index.d.ts",
    "access": "public"
  },
  "scripts": {
    "build": "tsc -b",
    "watch": "tsc -b --watch",
    "test": "jest"
  },
  "files": [
    "dist/**/*.d.ts",
    "!dist/**/*.test.d.ts",
    "dist/**/*.js",
    "dist/**/*.json",
    "!dist/**/*.test.js"
  ],
  "dependencies": {
    "@salesforce/core": "3.31.18"
  }
}
```

### tsconfig.json Pattern:
```json
{
  "extends": "../../tsconfig",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": false
  },
  "include": ["src/**/*"]
}
```

---

## 7. Datapack Deployment APIs (@vlocode/vlocity-deploy)

**Location:** `/home/runner/work/vlocode/vlocode/packages/vlocity-deploy/src`

### Main Exports:
```typescript
export * from './deploymentSpecs';
export * from './types';
export * from './convert';
export * from './export';
export * from './export/definition-converter';
export * from './flexCard';
export * from './datapackDeploy';
export * from './datapackDeployer';
export * from './datapackDeployment';
export * from './datapackDeploymentEvent';
export * from './datapackDeploymentError';
export * from './datapackDeploymentOptions';
export * from './datapackDeploymentRecord';
export * from './datapackDeploymentRecordGroup';
export * from './datapackDeploymentSpec';
export * from './datapackDeploymentSpecRegistry';
export * from './datapackDeploymentStatus';
export * from './datapackRecordFactory';
export * from './datapackLookupService';
```

### Key Classes:
- **DatapackDeployer** - Main deployment orchestrator
- **DatapackDeployment** - Deployment instance with lifecycle
- **DatapackDeploymentOptions** - Configuration
- **DatapackDeploymentStatus** - Status tracking
- **DatapackRecordFactory** - Record creation
- **DatapackLookupService** - Lookup resolution

### Deployment Specs (25+ specs):
Located in `packages/vlocity-deploy/src/deploymentSpecs/`:
- **Vlocity Components:** OmniScript, OmniUI Card, OmniDataTransform, DataRaptor, VlocityCard
- **OmniStudio:** omniScriptElementOrder, omniProcess, omniUICard
- **Salesforce:** decisionMatrix, Product2, contentVersion
- **Specialized:** calculationMatrix, customObjectMap, recordActivator, vlocityAction

Each spec file defines deployment logic for its component type.

---

## 8. Salesforce APIs for Objects & Fields

**Location:** `/home/runner/work/vlocode/vlocode/packages/salesforce/src`

### Schema-Related APIs:
```typescript
// packages/salesforce/src/schema/index.ts
export * from './types';
export * from './compositeSchemaAccess';
export * from './describeSchemaAccess';
export * from './schemaDataStore';
export * from './sobjectSchemaInfo';
export * from './toolingApiSchemaAccess';
```

### Key Services:
- **SalesforceSchemaService** - Main schema service
- **SalesforceDataService** - Data operations (CRUD)
- **SalesforceProfileService** - User profiles
- **SalesforceUserPermissions** - Permission handling

### Available in SalesforceService:
```typescript
@injectable()
class SalesforceService {
  // Properties providing subservices
  get schema(): SalesforceSchemaService
  get deploy(): SalesforceDeployService
  get logs(): DeveloperLogs
  get data(): SalesforceDataService
  get tooling(): SalesforceDataService
  get batch(): SalesforceBatchService
  
  // Key methods
  async getOrganizationDetails()
  async isPackageInstalled(packageName)
  async getInstalledPackageDetails(packageName)
  async isProductionOrg()
  getJsForceConnection()
}
```

---

## 9. DI Container Usage Patterns

**Location:** `/home/runner/work/vlocode/vlocode/packages/core/src/di/container.ts`

### Key Concepts:

#### Lifecycle Policies:
```typescript
enum LifecyclePolicy {
  singleton = 1,      // Single instance reused
  transient = 2       // New instance per resolution
}
```

#### Decorators:

**@injectable() - Mark class as injectable:**
```typescript
@injectable()
class MyService {
  constructor(private dependency: OtherService) {}
}

@injectable({ lifecycle: LifecyclePolicy.transient })
class TransientService {}

@injectable.singleton()
class SingletonService {}
```

**@inject() - Inject dependency:**
```typescript
class MyClass {
  @inject() private readonly myService: SomeService;  // Property injection
  
  constructor(@inject(SomeService) private service: SomeService) {}  // Constructor injection
}
```

#### Usage Examples from codebase:

**From datapackDeployer.ts:**
```typescript
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackDeployer {
  @inject() private readonly container: Container;
  @inject() private readonly specRegistry: DatapackDeploymentSpecRegistry;
  
  // Services are injected and available
  public async deploy(datapacks, options) {
    this.container.get(SalesforceService).data.cache.configure({ enabled: false });
  }
}
```

**From datapackDeploy.ts:**
```typescript
const localContainer = container.create();
localContainer.add(new Logger(...), ...options);
localContainer.add(new JsForceConnectionProvider(...), { 
  provides: [SalesforceConnectionProvider] 
});
localContainer.add(new VlocityNamespaceService());

const datapackLoader = localContainer.new(DatapackLoader);
return await localContainer.new(DatapackDeployer).deploy(datapacks, options);
```

#### Container Methods:
```typescript
// Global container
container.get(ServiceType)           // Get instance
container.new(ServiceType)           // Create new instance
container.add(instance, options)     // Add service
container.create()                   // Create child container
container.resolveProperty(obj, key)  // Resolve property

// Class methods
Container.root                        // Access root container
Container.scope                       // Get current scope
```

---

## 10. Configuration Conventions (tsconfig.json & package.json)

### Root tsconfig.json
**Location:** `/home/runner/work/vlocode/vlocode/tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "node20",
    "target": "es2022",
    "lib": ["ES2023", "DOM"],
    "outDir": "out",
    "sourceMap": true,
    "alwaysStrict": true,
    "strictPropertyInitialization": false,
    "useDefineForClassFields": false,         // ⚠️ REQUIRED for @inject
    "strictNullChecks": true,
    "moduleResolution": "node16",
    "emitDecoratorMetadata": true,             // ⚠️ REQUIRED for DI
    "experimentalDecorators": true,            // ⚠️ REQUIRED for DI
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "paths": {
      "@vlocode/apex": ["./packages/apex/src"],
      "@vlocode/core": ["./packages/core/src"],
      "@vlocode/util": ["./packages/util/src"],
      "@vlocode/salesforce": ["./packages/salesforce/src"],
      "@vlocode/vlocity": ["./packages/vlocity/src"],
      "@vlocode/vlocity-deploy": ["./packages/vlocity-deploy/src"],
      "@vlocode/omniscript": ["./packages/omniscript/src"]
    }
  }
}
```

### Package tsconfig.json Pattern
**Location:** `/home/runner/work/vlocode/vlocode/packages/*/tsconfig.json`

```json
{
  "extends": "../../tsconfig",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": false  // Can be true for packages with deps
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../util" }]  // Only if has dependencies
}
```

### Standard package.json Pattern
```json
{
  "name": "@vlocode/package-name",
  "version": "1.41.1",
  "description": "Short description",
  "main": "src/index.ts",
  "publishConfig": {
    "main": "dist/index.js",
    "typings": "dist/index.d.ts",
    "access": "public"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "build": "tsc -b",
    "watch": "tsc -b --watch",
    "test": "jest"
  },
  "files": [
    "dist/**/*.d.ts",
    "!dist/**/*.test.d.ts",
    "dist/**/*.js",
    "!dist/**/*.test.js"
  ],
  "dependencies": {
    "@vlocode/core": "workspace:*"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.3.4"
  }
}
```

### Root pnpm-workspace.yaml
**Location:** `/home/runner/work/vlocode/vlocode/pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - '!**/test/**'

publicHoistPattern:
  - 'eslint'
  - 'tslib'
  - 'eslint-config-*'
  - 'eslint-plugin-*'
  - 'prettier'
  - '@rollup/*'
  - 'rollup'

resolutionMode: highest
dedupeDirectDeps: true
preferWorkspacePackages: true
strictPeerDependencies: true

catalog:
  typescript: "5.9.3"
```

---

## Command Registration in VSCode Extension

**File:** `/home/runner/work/vlocode/vlocode/packages/vscode-extension/src/lib/commandRouter.ts`

### Command Registration Pattern:

```typescript
// 1. Define command class with @vscodeCommand decorator
@vscodeCommand(VlocodeCommand.selectOrg)
export default class SelectOrgCommand extends CommandBase {
    public validate(): void {
        // Validation logic
    }
    
    public async execute(...args: any[]): Promise<void> {
        // Command logic
    }
}

// 2. CommandRouter automatically registers from decorator
@injectable({ lifecycle: LifecyclePolicy.singleton })
export default class CommandRouter {
    constructor(private readonly logger: Logger) {
        // Iterates through commandRegistry and registers all commands
        for (const [id, {command, options}] of Object.entries(commandRegistry)) {
            this.register(id, command, options);
        }
    }
    
    public async execute(commandName: string, args?: any[]): Promise<void> {
        const command = this.commands.get(commandName);
        if (command) {
            await command.execute(...args);
        }
    }
}

// 3. Base class provides utilities
export abstract class CommandBase implements Command {
    protected readonly logger = LogManager.get(this.getName());
    protected readonly vlocode = lazy(() => container.get(VlocodeService));
    
    public abstract execute(...args: any[]): any | Promise<any>;
    public validate?(...args: any[]): any | Promise<any>;
}
```

### CommandOptions:
```typescript
interface CommandOptions {
  params?: any[];              // Constructor parameters
  executeParams?: any[];       // Execute method parameters
  focusLog?: boolean;          // Focus output channel on execution
  showProductionWarning?: boolean;  // Warn if production org
}
```

### Example Command Usage (DeployDatapackCommand):
```typescript
@vscodeCommand(VlocodeCommand.deployDatapack, { 
  focusLog: true, 
  showProductionWarning: true 
})
export class DeployDatapackCommand extends DatapackCommand {
    private get strategy(): VlocityDeploy {
        if (this.vlocode.config.deploymentMode === 'direct') {
            return container.get(VlocodeDirectDeployment);
        }
        return container.get(VlocityToolsDeployment);
    }
    
    public execute(...args: any[]): void | Promise<void> {
        // Implementation
    }
}
```

---

## Summary for Creating New MCP Package

Based on this exploration, here's what you need for a new `@vlocode/mcp` package:

### File Structure:
```
packages/mcp/
├── package.json                      # Standard pattern from @vlocode/util
├── tsconfig.json                     # Extends root, composite: true
├── jest.config.js
├── src/
│   ├── __tests__/                    # Jest tests
│   ├── index.ts                      # Main exports
│   ├── mcpServer.ts                  # Main MCP server
│   ├── resources/                    # MCP resource handlers
│   ├── tools/                        # MCP tools
│   ├── prompts/                      # MCP prompts
│   └── services/                     # Business logic
└── CHANGELOG.md
```

### Key Dependencies:
- `@vlocode/core` - For DI container, Logger
- `@vlocode/util` - For utilities
- `@vlocode/salesforce` - For Salesforce APIs
- `@vlocode/vlocity-deploy` - For datapack APIs
- Core MCP library

### TSConfig DI Requirements:
```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

### Service Pattern:
```typescript
import { injectable, inject, Logger } from '@vlocode/core';
import { SalesforceService } from '@vlocode/salesforce';

@injectable()
export class MCPService {
  @inject() private readonly logger: Logger;
  @inject() private readonly sfService: SalesforceService;
  
  // Implementation using DI
}
```

