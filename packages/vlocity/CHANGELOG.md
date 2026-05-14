# Change Log
## Vlocity/Salesforce Integration for VSCode

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.3](https://github.com/Codeneos/vlocode/compare/v2.0.2...v2.0.3) (2026-05-14)

### Bug Fixes

* DatapackConfigAccess doesn't preserve lookup proxy ([e0258b4](https://github.com/Codeneos/vlocode/commit/e0258b47fe0b20384a5615283a63b61dffe1c173))
* improve error logging for DataPack configuration loading failure ([d7908ea](https://github.com/Codeneos/vlocode/commit/d7908eaaf8862e44ca4f29c548492299dfd27e21))
* improve namespace initialization logic in VlocityNamespaceService to ensure proper handling of installed packages ([53a8455](https://github.com/Codeneos/vlocode/commit/53a845524fa153c693c1303012667dd935c90688))
* missing replaceNamespace logic for Vlocity namespace ([bf381b5](https://github.com/Codeneos/vlocode/commit/bf381b59fcb03f8642e9b00ffeeb4bd24867833d))

### Features

* add new Datapack Webview editor that allows editing of Datapacks through a simple SF like experience ([daf2a51](https://github.com/Codeneos/vlocode/commit/daf2a5156ac18def396c7882ab7b9b7f3a2d836b))

## [2.0.2](https://github.com/Codeneos/vlocode/compare/v2.0.1...v2.0.2) (2026-05-13)

### Bug Fixes

* when there are multiple Vlocity packages installed the code picked the first package even if that had no namespace. This fix changes the bevahior to only pickup packages that have a namespace (fixes [#449](https://github.com/Codeneos/vlocode/issues/449)) ([c9f2a1f](https://github.com/Codeneos/vlocode/commit/c9f2a1ff9f3cc0413f92a216c046e414bb4f98fb))

## [2.0.1](https://github.com/Codeneos/vlocode/compare/v2.0.0...v2.0.1) (2026-05-13)

### Bug Fixes

* improve argument parsing in FormulaParser to handle parentheses and commas correctly ([eda98fd](https://github.com/Codeneos/vlocode/commit/eda98fd8f7cb9cc402ff7dd666f295af7fec829e))

# [2.0.0](https://github.com/Codeneos/vlocode/compare/v1.42.0...v2.0.0) (2026-05-11)

### Bug Fixes

* correct metadata id resolution and merge-field concat ([#447](https://github.com/Codeneos/vlocode/issues/447)) ([4d10570](https://github.com/Codeneos/vlocode/commit/4d10570b63b78a52bd76e34687b79dde308d118d))
* improve robustness on windows of path related functions ([18f7e11](https://github.com/Codeneos/vlocode/commit/18f7e118bc7087a35796f5f3aaa63f2dfc6782c8))
* resolve 4 bugs found in recent commits ([#444](https://github.com/Codeneos/vlocode/issues/444)) ([1adf631](https://github.com/Codeneos/vlocode/commit/1adf631c43547e29ad40be8b064141259f340061))
* restore build infrastructure and eliminate duplicate builds ([#445](https://github.com/Codeneos/vlocode/issues/445)) ([34431fb](https://github.com/Codeneos/vlocode/commit/34431fbda827f02ea001db8d72e4e75195d091bf))

### Features

* add OmniStudio formula language service and related components ([203bd0c](https://github.com/Codeneos/vlocode/commit/203bd0cf520109745f6eb8571b1ff90cc5bf41e6))
* **datamapper:** add data mapper execution support running/previewing a data mapper ([da4f679](https://github.com/Codeneos/vlocode/commit/da4f6791e15873ce6bb9749b7dd46ab64e2586ef))
* enhance datapack export functionality and configuration ([ceb1a01](https://github.com/Codeneos/vlocode/commit/ceb1a01ebabd8c4ed120f2c1f8d7be8a02894d13))
* improve direct export functions to match standard datapack export ([110d966](https://github.com/Codeneos/vlocode/commit/110d9668c1e94fda7dd735ca94c2d98802e3ab86))
* integrate vlocity package and enhance formula evaluation types ([8e4fdac](https://github.com/Codeneos/vlocode/commit/8e4fdacb9aa284f765bddce4be54a8d0cef6ce1e))

# [1.42.0](https://github.com/Codeneos/vlocode/compare/v1.41.2...v1.42.0) (2026-05-06)

### Features

* add new data mapper UI to edit data mappers from VS Code ([9c81874](https://github.com/Codeneos/vlocode/commit/9c81874938721d532ba45fa346278c96a543bac4))
* add tests for DatapackExporter and DatapackExpander functionality ([6eb5a4b](https://github.com/Codeneos/vlocode/commit/6eb5a4bd5db8ca80d04591b98cc6837d4c958109))
* refactor datapack export logic to support non omnistudio orgs ([5bcf434](https://github.com/Codeneos/vlocode/commit/5bcf434cb43c4eb82cbfb42b774dfade3a93cccf))

## [1.41.1](https://github.com/Codeneos/vlocode/compare/v1.41.0...v1.41.1) (2026-02-26)

**Note:** Version bump only for package @vlocode/vlocity

# [1.41.0](https://github.com/Codeneos/vlocode/compare/v1.40.1-rc.0...v1.41.0) (2026-02-25)

**Note:** Version bump only for package @vlocode/vlocity

## [1.40.1-rc.0](https://github.com/Codeneos/vlocode/compare/v1.40.0-beta-4...v1.40.1-rc.0) (2026-02-25)

### Bug Fixes

* do not report error when Vlocity package is missing to allow use of Vlocode without vlocity ([70a4f84](https://github.com/Codeneos/vlocode/commit/70a4f847f405eb76e64c0e7ee0118431b19f477d))

# [1.40.0-rc.1](https://github.com/Codeneos/vlocode/compare/v1.40.0-beta-4...v1.40.0-rc.1) (2026-02-23)

### Bug Fixes

* do not report error when Vlocity package is missing to allow use of Vlocode without vlocity ([70a4f84](https://github.com/Codeneos/vlocode/commit/70a4f847f405eb76e64c0e7ee0118431b19f477d))

# [1.40.0-beta-4](https://github.com/Codeneos/vlocode/compare/v1.40.0-beta-3...v1.40.0-beta-4) (2025-11-10)

**Note:** Version bump only for package @vlocode/vlocity

# [1.40.0-beta-3](https://github.com/Codeneos/vlocode/compare/v1.40.0-beta-2...v1.40.0-beta-3) (2025-10-11)

**Note:** Version bump only for package @vlocode/vlocity

# [1.40.0-beta-2](https://github.com/Codeneos/vlocode/compare/v1.40.0-beta-1...v1.40.0-beta-2) (2025-10-02)

**Note:** Version bump only for package @vlocode/vlocity

# [1.40.0-beta-1](https://github.com/Codeneos/vlocode/compare/v1.32.0...v1.40.0-beta-1) (2025-09-29)

**Note:** Version bump only for package @vlocode/vlocity

# [1.32.0](https://github.com/Codeneos/vlocode/compare/v1.31.10...v1.32.0) (2025-08-16)

### Bug Fixes

* OmniScript doesn't open in correct editor when using open-in-org command ([61ae903](https://github.com/Codeneos/vlocode/commit/61ae9036cf60b28faeaceef6a74978f1e32bfef1))

## [1.31.10](https://github.com/Codeneos/vlocode/compare/v1.31.9...v1.31.10) (2025-07-28)

**Note:** Version bump only for package @vlocode/vlocity

## [1.31.8](https://github.com/Codeneos/vlocode/compare/v1.31.7...v1.31.8) (2025-07-23)

**Note:** Version bump only for package @vlocode/vlocity

## [1.31.6](https://github.com/Codeneos/vlocode/compare/v1.31.5...v1.31.6) (2025-07-11)

### Features

* segregate DocumentTemplates and DocumentTemplate datapacks based on the CLM or SFC being used ([b6f99ed](https://github.com/Codeneos/vlocode/commit/b6f99edbc40dacf412fdee2ca56c760db542e12f))

## [1.31.5](https://github.com/Codeneos/vlocode/compare/v1.31.4...v1.31.5) (2025-07-08)

**Note:** Version bump only for package @vlocode/vlocity

## [1.31.4](https://github.com/Codeneos/vlocode/compare/v1.31.3...v1.31.4) (2025-07-03)

**Note:** Version bump only for package @vlocode/vlocity

## [1.31.3](https://github.com/Codeneos/vlocode/compare/v1.31.2...v1.31.3) (2025-06-27)

### Bug Fixes

* do not report invalid `datapack configuration` as error but instead as warning ([2099f10](https://github.com/Codeneos/vlocode/commit/2099f109a859ded8a0432984e29b390339719f56))

### Features

* remove Salesforce username from VSCode configuration and use username from SFDX project file instead ([953ab28](https://github.com/Codeneos/vlocode/commit/953ab286d51fba07cfe55632d89d2306838341aa))

## [1.31.1](https://github.com/Codeneos/vlocode/compare/v1.31.0...v1.31.1) (2025-06-17)

**Note:** Version bump only for package @vlocode/vlocity

# [1.30.0](https://github.com/Codeneos/vlocode/compare/v1.29.5...v1.30.0) (2025-06-14)

**Note:** Version bump only for package @vlocode/vlocity

## [1.29.5](https://github.com/Codeneos/vlocode/compare/v1.29.4...v1.29.5) (2025-05-26)

**Note:** Version bump only for package @vlocode/vlocity

## [1.29.4](https://github.com/Codeneos/vlocode/compare/v1.29.3...v1.29.4) (2025-05-26)

### Bug Fixes

* JSON files missing in NPM packages ([5f61f62](https://github.com/Codeneos/vlocode/commit/5f61f62d42e4d473f2eabfafdaced5748eb9afc6))

## [1.29.3](https://github.com/Codeneos/vlocode/compare/v1.29.2...v1.29.3) (2025-05-26)

### Bug Fixes

* revert ESM changes with ESBuild as ESBuild does not emit proper decorator data for use IoC framework ([a80f136](https://github.com/Codeneos/vlocode/commit/a80f13675e0fcb7e90bcccbfaedb089aeda07930))

## [1.29.2](https://github.com/Codeneos/vlocode/compare/v1.29.1...v1.29.2) (2025-05-26)

**Note:** Version bump only for package @vlocode/vlocity

# [1.29.0](https://github.com/Codeneos/vlocode/compare/v1.28.2...v1.29.0) (2025-05-25)

### Features

* upgrade all packages to publish in ESM format as well as CommonJS ([5c77946](https://github.com/Codeneos/vlocode/commit/5c779467497cba0940b5a6934febe7f1b631edb8))

## [1.28.2](https://github.com/Codeneos/vlocode/compare/v1.28.1...v1.28.2) (2025-05-22)

**Note:** Version bump only for package @vlocode/vlocity

## [1.28.1](https://github.com/Codeneos/vlocode/compare/v1.28.0...v1.28.1) (2025-05-21)

**Note:** Version bump only for package @vlocode/vlocity

# [1.28.0](https://github.com/Codeneos/vlocode/compare/v1.27.7...v1.28.0) (2025-05-21)

### Features

* add import multipack command to enhance datapack management ([e69ec9e](https://github.com/Codeneos/vlocode/commit/e69ec9e2210a885b210addf9aef6e6777a53913f))

* optimize datapack loading by caching the file directory during the loading process ([f84e3b2](https://github.com/Codeneos/vlocode/commit/f84e3b2c528e4bd0d15cb5173e490c72387dd460))

* support generation of LWCs from OmniStudio Datapacks without deploying ([fa4c421](https://github.com/Codeneos/vlocode/commit/fa4c421d1c95592c6a590ec8ad73a0257bf4d277))

## [1.27.6](https://github.com/Codeneos/vlocode/compare/v1.27.5...v1.27.6) (2025-01-28)

**Note:** Version bump only for package @vlocode/vlocity

## [1.27.5](https://github.com/Codeneos/vlocode/compare/v1.27.4...v1.27.5) (2024-09-02)

**Note:** Version bump only for package @vlocode/vlocity

# [1.27.0](https://github.com/Codeneos/vlocode/compare/v1.26.2...v1.27.0) (2024-08-21)

**Note:** Version bump only for package @vlocode/vlocity

## [1.26.2](https://github.com/Codeneos/vlocode/compare/v1.26.1...v1.26.2) (2024-08-15)

**Note:** Version bump only for package @vlocode/vlocity

## [1.26.1](https://github.com/Codeneos/vlocode/compare/v1.26.0...v1.26.1) (2024-08-14)

**Note:** Version bump only for package @vlocode/vlocity

# [1.26.0](https://github.com/Codeneos/vlocode/compare/v1.25.0...v1.26.0) (2024-08-13)

**Note:** Version bump only for package @vlocode/vlocity

# [1.25.0](https://github.com/Codeneos/vlocode/compare/v1.24.11...v1.25.0) (2024-08-07)

### Bug Fixes

* switching orgs causes developer logs panel to misbehave ([9ea7261](https://github.com/Codeneos/vlocode/commit/9ea7261f0c349711c9eae16634e9fa002803f2a5))

### Features

* support datapack export based on configuration definitions in a YAML definitions file ([c2edd7c](https://github.com/Codeneos/vlocode/commit/c2edd7c7537a3d28312befa7ac5d7269140b5276))

## [1.24.11](https://github.com/Codeneos/vlocode/compare/v1.24.10...v1.24.11) (2024-06-27)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.10](https://github.com/Codeneos/vlocode/compare/v1.24.9...v1.24.10) (2024-06-24)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.9](https://github.com/Codeneos/vlocode/compare/v1.24.8...v1.24.9) (2024-06-24)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.8](https://github.com/Codeneos/vlocode/compare/v1.24.7...v1.24.8) (2024-06-24)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.7](https://github.com/Codeneos/vlocode/compare/v1.24.6...v1.24.7) (2024-06-21)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.6](https://github.com/Codeneos/vlocode/compare/v1.24.5...v1.24.6) (2024-06-12)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.5](https://github.com/Codeneos/vlocode/compare/v1.24.4...v1.24.5) (2024-06-12)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.4](https://github.com/Codeneos/vlocode/compare/v1.24.3...v1.24.4) (2024-05-27)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.3](https://github.com/Codeneos/vlocode/compare/v1.24.2...v1.24.3) (2024-05-27)

**Note:** Version bump only for package @vlocode/vlocity

## [1.24.2](https://github.com/Codeneos/vlocode/compare/v1.24.1...v1.24.2) (2024-05-27)

**Note:** Version bump only for package @vlocode/vlocity

# [1.24.0](https://github.com/Codeneos/vlocode/compare/v1.23.0...v1.24.0) (2024-05-09)

### Features

* document and expect DatapackReference object ([741cf0d](https://github.com/Codeneos/vlocode/commit/741cf0dd0f17c41f4c8ad8028a3131cc9010b35b))

# [1.23.0](https://github.com/Codeneos/vlocode/compare/v1.22.2...v1.23.0) (2024-04-29)

**Note:** Version bump only for package @vlocode/vlocity

# [1.22.0](https://github.com/Codeneos/vlocode/compare/v0.21.7...v1.22.0) (2024-03-27)

**Note:** Version bump only for package @vlocode/vlocity

## [0.21.7](https://github.com/Codeneos/vlocode/compare/v0.21.6...v0.21.7) (2024-03-12)

**Note:** Version bump only for package @vlocode/vlocity

## [0.21.6](https://github.com/Codeneos/vlocode/compare/v0.21.5...v0.21.6) (2024-02-15)

**Note:** Version bump only for package @vlocode/vlocity

## [0.21.5](https://github.com/Codeneos/vlocode/compare/v0.21.4...v0.21.5) (2024-01-25)

**Note:** Version bump only for package @vlocode/vlocity

## [0.21.3](https://github.com/Codeneos/vlocode/compare/v0.21.2...v0.21.3) (2024-01-23)

**Note:** Version bump only for package @vlocode/vlocity

## [0.21.2](https://github.com/Codeneos/vlocode/compare/v0.21.1...v0.21.2) (2024-01-22)

**Note:** Version bump only for package @vlocode/vlocity

## [0.21.1](https://github.com/Codeneos/vlocode/compare/v0.21.0...v0.21.1) (2024-01-08)

**Note:** Version bump only for package @vlocode/vlocity

# [0.21.0](https://github.com/Codeneos/vlocode/compare/v0.20.12...v0.21.0) (2023-12-22)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.12](https://github.com/Codeneos/vlocode/compare/v0.20.11...v0.20.12) (2023-12-15)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.11](https://github.com/Codeneos/vlocode/compare/v0.20.10...v0.20.11) (2023-12-14)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.10](https://github.com/Codeneos/vlocode/compare/v0.20.9...v0.20.10) (2023-12-03)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.8](https://github.com/Codeneos/vlocode/compare/v0.20.7...v0.20.8) (2023-10-18)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.7](https://github.com/Codeneos/vlocode/compare/v0.20.6...v0.20.7) (2023-09-29)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.6](https://github.com/Codeneos/vlocode/compare/v0.20.5...v0.20.6) (2023-09-25)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.5](https://github.com/Codeneos/vlocode/compare/v0.20.4...v0.20.5) (2023-09-06)

### Bug Fixes

* VlocityInterfaceInvoker is not serializing input correctly ([8f02b91](https://github.com/Codeneos/vlocode/commit/8f02b914bba3dc0b6b31380cbe425fe9c4307e12))

## [0.20.3](https://github.com/Codeneos/vlocode/compare/v0.20.2...v0.20.3) (2023-08-24)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.2](https://github.com/Codeneos/vlocode/compare/v0.20.1...v0.20.2) (2023-08-23)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.1](https://github.com/Codeneos/vlocode/compare/v0.20.1-next.0...v0.20.1) (2023-08-23)

**Note:** Version bump only for package @vlocode/vlocity

## [0.20.1-next.0](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.1...v0.20.1-next.0) (2023-08-20)

### Features

* improve build system and reduce load time of extension on startup by 40% ([692de00](https://github.com/Codeneos/vlocode/commit/692de003c677516ed13064fb4d7011be2f090225))

# [0.20.0-alpha.1](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.0...v0.20.0-alpha.1) (2023-08-14)

**Note:** Version bump only for package @vlocode/vlocity
