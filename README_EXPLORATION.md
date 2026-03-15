# 📖 Vlocode Monorepo Exploration - Start Here

This directory now contains comprehensive documentation about the Vlocode monorepo structure, perfect for creating new packages like the proposed MCP (Model Context Protocol) package.

## 🚀 Quick Start

**Time needed:** 20 minutes to understand everything

### Step 1: Quick Overview (5 min)
Start with: **`MCP_QUICK_REFERENCE.md`**
- 10 key findings summarized
- Copy-paste templates for new packages
- Implementation checklist

### Step 2: Detailed Reference (10 min)
Use: **`MCP_EXPLORATION_INDEX.md`**
- Navigation guide for specific topics
- File path reference
- "How do I..." quick answers

### Step 3: Deep Dive (5 min)
Full details: **`VLOCODE_EXPLORATION.md`**
- 718 lines of comprehensive information
- 50+ code examples
- All 10 questions answered in depth

---

## 📋 The Three Documents

### 1. **MCP_QUICK_REFERENCE.md** ⭐ Start Here
- **Length:** 221 lines (~6 min read)
- **Best for:** Quick understanding and copy-paste templates
- **Contains:**
  - 10 key findings with emojis
  - package.json template
  - tsconfig.json template
  - DI Container pattern
  - MCP package directory structure
  - Implementation checklist

### 2. **MCP_EXPLORATION_INDEX.md** 🗺️ Navigation Guide
- **Length:** 212 lines (~5 min read)
- **Best for:** Finding specific information
- **Contains:**
  - Navigation by topic (structure, DI, APIs, config)
  - "How do I..." quick links
  - File path reference (grouped by purpose)
  - Next steps checklist
  - Key insights for MCP

### 3. **VLOCODE_EXPLORATION.md** 📚 Complete Reference
- **Length:** 718 lines (~30 min read)
- **Best for:** Deep understanding and implementation details
- **Contains:**
  - Question 1: Monorepo structure (10 packages)
  - Question 2: MCP package status (✅ doesn't exist)
  - Question 3: VSCode extension structure
  - Question 4: Command structure (commands.yaml)
  - Question 5: API export patterns
  - Question 6: Simple package structure (@vlocode/util)
  - Question 7: Datapack APIs (@vlocode/vlocity-deploy)
  - Question 8: Salesforce APIs (@vlocode/salesforce)
  - Question 9: DI container usage patterns
  - Question 10: Configuration conventions
  - Plus: Command registration details, MCP package template

---

## 🎯 What You'll Learn

### About the Monorepo
- ✅ 10 total packages (9 @vlocode/* + 1 extension)
- ✅ pnpm workspace + Lerna Lite versioning
- ✅ TypeScript with custom DI container
- ✅ All packages follow consistent conventions

### About APIs Available
- ✅ **@vlocode/core** - IoC container, Logger, FileSystem
- ✅ **@vlocode/util** - 25+ utility modules
- ✅ **@vlocode/salesforce** - Complete Salesforce integration (SOAP, REST, Bulk, Metadata, Schema, Query)
- ✅ **@vlocode/vlocity-deploy** - Datapack deployment with 25+ component specs
- ✅ **@vlocode/vlocity** - OmniStudio/Vlocity functionality

### About Creating New Packages
- ✅ Exact package.json template
- ✅ Exact tsconfig.json configuration (with DI requirements)
- ✅ Directory structure conventions
- ✅ Export patterns (src/index.ts with export *)
- ✅ Service creation with @injectable/@inject decorators
- ✅ Testing setup with Jest

### About the Command System
- ✅ @vscodeCommand decorator pattern
- ✅ CommandRouter automatic registration
- ✅ CommandBase class usage
- ✅ 40+ existing commands as examples

---

## 📂 File Paths Quick Reference

### Must-Read Implementation Files
```
packages/core/src/di/
  ├── container.ts                 # DI container (main!)
  ├── injectable.decorator.ts      # @injectable
  └── inject.decorator.ts          # @inject

packages/vscode-extension/src/lib/
  ├── commandRouter.ts             # Command system
  ├── commandBase.ts               # Base command class
  └── vlocodeService.ts            # Main service

packages/salesforce/src/
  ├── salesforceService.ts         # Main Salesforce service
  └── schema/                      # Schema APIs

packages/vlocity-deploy/src/
  ├── datapackDeployer.ts          # Main deployer
  └── deploymentSpecs/             # 25+ specs
```

### Configuration Files
```
/tsconfig.json                      # Root config
/pnpm-workspace.yaml                # Workspace
/lerna.json                         # Versioning
```

---

## 🎬 How to Use These Documents

### If you want to understand the overall structure
→ Read: **MCP_QUICK_REFERENCE.md** Section 1️⃣
→ Then: **VLOCODE_EXPLORATION.md** Section 1-3

### If you want to create a new service
→ Read: **MCP_QUICK_REFERENCE.md** Section 9️⃣
→ Then: **VLOCODE_EXPLORATION.md** Section 9

### If you want to understand the command system
→ Read: **MCP_QUICK_REFERENCE.md** Section 4️⃣
→ Then: **VLOCODE_EXPLORATION.md** Section 4 + Command Registration

### If you want to create a new package
→ Read: **MCP_QUICK_REFERENCE.md** MCP Package Template
→ Then: **VLOCODE_EXPLORATION.md** Section 6 + 10
→ Finally: **MCP_EXPLORATION_INDEX.md** ✅ Checklist

### If you want specific information
→ Use: **MCP_EXPLORATION_INDEX.md** "How do I..." section
→ Get direct links to the right documentation

---

## ✅ 10 Questions Answered

All with file paths, code examples, and practical templates:

1. ✅ **Monorepo structure?** - 10 packages described with purposes
2. ✅ **Existing MCP package?** - No (clear opportunity!)
3. ✅ **VSCode extension structure?** - Full directory tree
4. ✅ **Command structure?** - commands.yaml format with examples
5. ✅ **API exports?** - Pattern: export * from './module'
6. ✅ **Simple package structure?** - @vlocode/util example
7. ✅ **Datapack APIs?** - @vlocode/vlocity-deploy with 25+ specs
8. ✅ **Salesforce APIs?** - SalesforceService with subservices
9. ✅ **DI container usage?** - @injectable/@inject patterns
10. ✅ **Configuration conventions?** - Complete templates

---

## 🚀 Next Steps

1. **Read MCP_QUICK_REFERENCE.md** (10 minutes)
2. **Browse MCP_EXPLORATION_INDEX.md** (5 minutes)
3. **Reference VLOCODE_EXPLORATION.md** as needed
4. **Create /packages/mcp/** directory
5. **Copy templates** from the documents
6. **Build and test** with `pnpm build` and `pnpm test`

---

## 📊 Statistics

- **Total Lines:** 1,151 lines of documentation
- **Total Size:** ~35 KB
- **Code Examples:** 50+
- **File References:** 100+
- **Questions Answered:** 10/10

---

## 💡 Key Takeaway

The Vlocode monorepo is well-structured with:
- ✨ **Consistent conventions** across all packages
- 🏗️ **Powerful DI framework** for service management
- 🔌 **Rich APIs** for Salesforce, Datapacks, and Vlocity
- 📦 **Simple export pattern** (no complex "exports" field)
- 🧪 **Full testing infrastructure** with Jest

**Ready to create the @vlocode/mcp package!** 🎉

---

**Created:** March 15, 2025
**Status:** ✅ Complete with comprehensive documentation
**Last Updated:** Latest exploration with all 10 questions answered
