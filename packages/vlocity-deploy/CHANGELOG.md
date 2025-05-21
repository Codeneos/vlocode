# Change Log
## Vlocity/Salesforce Integration for VSCode

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.28.1](https://github.com/Codeneos/vlocode/compare/v1.28.0...v1.28.1) (2025-05-21)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [1.28.0](https://github.com/Codeneos/vlocode/compare/v1.27.7...v1.28.0) (2025-05-21)

### Bug Fixes

* standard runtime global key fields are not checked for integrity after deploymeny ([e9ae852](https://github.com/Codeneos/vlocode/commit/e9ae85298bf02ccbec447369ab80d8834285d16b))

### Features

* add import multipack command to enhance datapack management ([e69ec9e](https://github.com/Codeneos/vlocode/commit/e69ec9e2210a885b210addf9aef6e6777a53913f))
* add new spec files for OmniProcess and OmniUiCard components ([08facfd](https://github.com/Codeneos/vlocode/commit/08facfd6ada59e1776754de52e260f2046a03762))
* add support for DataMapper deployment and update specs for OmniStudio components ([2113651](https://github.com/Codeneos/vlocode/commit/21136517c247d54c78efe9c540891a5aa5b6dc76))
* add support for DataRaptor to standard runtime conversion ([8500435](https://github.com/Codeneos/vlocode/commit/8500435f4f662a69c53e88c011d8a8b0777e5f9e))
* add supprto for activating OmniStudio OmniScripts ([b919563](https://github.com/Codeneos/vlocode/commit/b9195630eb24d4becfc13005594cb41bc4b70111))
* automaticly generate standard and managed package LWC components during FlexCard deployment ([c495a4b](https://github.com/Codeneos/vlocode/commit/c495a4b85b5627a0727e0aa8a47a3c00a97dfca3))
* enhance datapack deployment with error reporting on datapack loading errors which were previously not reported when continueOnError was set to true ([1aa6136](https://github.com/Codeneos/vlocode/commit/1aa61367ed7bc1f9fab3de19a354ca1495c1b5f6))
* enhance OmniStudio conversion with VlocityCard support ([fa2b4e8](https://github.com/Codeneos/vlocode/commit/fa2b4e802e6c07adf8efe698d80eb6e9da5086e1))
* generate and compile and deploy LWC component when activating a flex card ([7e79a83](https://github.com/Codeneos/vlocode/commit/7e79a83eeb0e4d22d1e3e841222d95bfea9d3746))
* improve mapping for standard OmniStudio runtime components ([69d68a0](https://github.com/Codeneos/vlocode/commit/69d68a0eb681de104f6015e0aec7c2e7c4c5aa86))
* optimize datapack loading by caching the file directory during the loading process ([f84e3b2](https://github.com/Codeneos/vlocode/commit/f84e3b2c528e4bd0d15cb5173e490c72387dd460))
* support for FlexCard activation from VSCode incl. LWC component generation ([fb61d6d](https://github.com/Codeneos/vlocode/commit/fb61d6ddcae675cab1407f38f806dd12b89e6e35))
* support generation of LWCs from OmniStudio Datapacks without deploying ([fa4c421](https://github.com/Codeneos/vlocode/commit/fa4c421d1c95592c6a590ec8ad73a0257bf4d277))

## [1.27.7](https://github.com/Codeneos/vlocode/compare/v1.27.6...v1.27.7) (2025-01-28)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.27.6](https://github.com/Codeneos/vlocode/compare/v1.27.5...v1.27.6) (2025-01-28)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.27.5](https://github.com/Codeneos/vlocode/compare/v1.27.4...v1.27.5) (2024-09-02)

### Bug Fixes

* datapack records with indentical lookup values get incorrectly marked as duplicates ([ef1a01b](https://github.com/Codeneos/vlocode/commit/ef1a01b3bea9db79883d655c3fd621e2444bdcfb))

* errors do not get stored when using just updateStatus to fail a record deployment ([2e497b1](https://github.com/Codeneos/vlocode/commit/2e497b15cf90be51691710fd401ab04965877cf4))

* record activation for matrices and calculation procedures ([dc5fe73](https://github.com/Codeneos/vlocode/commit/dc5fe735fee6474238f4e7c4e12a7df70a249399))

* specs do not use local container causing spec errors ([733c02f](https://github.com/Codeneos/vlocode/commit/733c02ffa0e3b04fb25a992e49ba2666938f0627))

## [1.27.4](https://github.com/Codeneos/vlocode/compare/v1.27.3...v1.27.4) (2024-08-28)

### Bug Fixes

* update datapackExpander.ts to normalize file names the same way as tools library does ([2b251f9](https://github.com/Codeneos/vlocode/commit/2b251f9eeee935cb0f22c0df1ee66f2ae059083c))

## [1.27.3](https://github.com/Codeneos/vlocode/compare/v1.27.2...v1.27.3) (2024-08-22)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.27.2](https://github.com/Codeneos/vlocode/compare/v1.27.1...v1.27.2) (2024-08-22)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [1.27.0](https://github.com/Codeneos/vlocode/compare/v1.26.2...v1.27.0) (2024-08-21)

### Bug Fixes

* datapack expander file and folder formats ([38e843f](https://github.com/Codeneos/vlocode/commit/38e843ff11a9585e6ca4d3b9974b007ad3ff62a5))

* datapack filenames should not contain path seperators ([ec7b6d2](https://github.com/Codeneos/vlocode/commit/ec7b6d25e2f47bbd961ff62e7bbb747ee1e32b9f))

* expanded datapacks inner file references are missing prefix ([ca9c483](https://github.com/Codeneos/vlocode/commit/ca9c4835957ca883db462c6d9dfa7708b221774b))

### Features

* support setting export query for vlocode CLI export command ([b15cc93](https://github.com/Codeneos/vlocode/commit/b15cc938678c1b131d0a1da1568bc63786c51757))

## [1.26.2](https://github.com/Codeneos/vlocode/compare/v1.26.1...v1.26.2) (2024-08-15)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.26.1](https://github.com/Codeneos/vlocode/compare/v1.26.0...v1.26.1) (2024-08-14)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [1.26.0](https://github.com/Codeneos/vlocode/compare/v1.25.0...v1.26.0) (2024-08-13)

### Features

* add folder and file expansion support ([a908273](https://github.com/Codeneos/vlocode/commit/a908273dd0b9b0166a4afb9a9284511ef4a7f23a))

* distribute JSON schema for DatapackExportDefinition object ([55e1d50](https://github.com/Codeneos/vlocode/commit/55e1d500da73b92cf98d3e932d1a3ea234f9bbc6))

# [1.25.0](https://github.com/Codeneos/vlocode/compare/v1.24.11...v1.25.0) (2024-08-07)

### Bug Fixes

* string eval functions do not work properly due to compiler changes ([cc5ade8](https://github.com/Codeneos/vlocode/commit/cc5ade8de8e79b6c77580246015c0a7b7bd84a57))

### Features

* fail records with circular dependencies before deployment starts ([f7c1580](https://github.com/Codeneos/vlocode/commit/f7c15807fb45afb9453005b2c6742b313f02f600))

* support datapack export based on configuration definitions in a YAML definitions file ([c2edd7c](https://github.com/Codeneos/vlocode/commit/c2edd7c7537a3d28312befa7ac5d7269140b5276))

## [1.24.11](https://github.com/Codeneos/vlocode/compare/v1.24.10...v1.24.11) (2024-06-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.10](https://github.com/Codeneos/vlocode/compare/v1.24.9...v1.24.10) (2024-06-24)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.9](https://github.com/Codeneos/vlocode/compare/v1.24.8...v1.24.9) (2024-06-24)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.8](https://github.com/Codeneos/vlocode/compare/v1.24.7...v1.24.8) (2024-06-24)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.7](https://github.com/Codeneos/vlocode/compare/v1.24.6...v1.24.7) (2024-06-21)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.6](https://github.com/Codeneos/vlocode/compare/v1.24.5...v1.24.6) (2024-06-12)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.5](https://github.com/Codeneos/vlocode/compare/v1.24.4...v1.24.5) (2024-06-12)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.4](https://github.com/Codeneos/vlocode/compare/v1.24.3...v1.24.4) (2024-05-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.3](https://github.com/Codeneos/vlocode/compare/v1.24.2...v1.24.3) (2024-05-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [1.24.2](https://github.com/Codeneos/vlocode/compare/v1.24.1...v1.24.2) (2024-05-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [1.24.0](https://github.com/Codeneos/vlocode/compare/v1.23.0...v1.24.0) (2024-05-09)

### Bug Fixes

* build error in CLI ([4c3f481](https://github.com/Codeneos/vlocode/commit/4c3f481653d60ca309413853bb2927ed93b5d547))

### Features

* improve support for datapack deployment in strict mode with circular datapack references ([fce234d](https://github.com/Codeneos/vlocode/commit/fce234d4da2ca3bc7880c83d2e30110348b4bc2b))

# [1.23.0](https://github.com/Codeneos/vlocode/compare/v1.22.2...v1.23.0) (2024-04-29)

### Bug Fixes

* batch service does not correctly include properties to report batch status ([e331d01](https://github.com/Codeneos/vlocode/commit/e331d014b2fac1318dd45d15e925cfa014710532))

### Features

* suppress cascade failure reporting during deployment ([6fe07d2](https://github.com/Codeneos/vlocode/commit/6fe07d25e4749917c59458d2f0a7c5794ef62eec))

## [1.22.2](https://github.com/Codeneos/vlocode/compare/v1.22.1...v1.22.2) (2024-04-11)

### Bug Fixes

* document templates are not shared with all users after deployment ([0ad9f86](https://github.com/Codeneos/vlocode/commit/0ad9f86b09e7ec1e8eb92b4c89cd3d2c431b15b0))

# [1.22.0](https://github.com/Codeneos/vlocode/compare/v0.21.7...v1.22.0) (2024-03-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.21.7](https://github.com/Codeneos/vlocode/compare/v0.21.6...v0.21.7) (2024-03-12)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.21.6](https://github.com/Codeneos/vlocode/compare/v0.21.5...v0.21.6) (2024-02-15)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.21.5](https://github.com/Codeneos/vlocode/compare/v0.21.4...v0.21.5) (2024-01-25)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.21.3](https://github.com/Codeneos/vlocode/compare/v0.21.2...v0.21.3) (2024-01-23)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.21.2](https://github.com/Codeneos/vlocode/compare/v0.21.1...v0.21.2) (2024-01-22)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.21.1](https://github.com/Codeneos/vlocode/compare/v0.21.0...v0.21.1) (2024-01-08)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [0.21.0](https://github.com/Codeneos/vlocode/compare/v0.20.12...v0.21.0) (2023-12-22)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.12](https://github.com/Codeneos/vlocode/compare/v0.20.11...v0.20.12) (2023-12-15)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.11](https://github.com/Codeneos/vlocode/compare/v0.20.10...v0.20.11) (2023-12-14)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.10](https://github.com/Codeneos/vlocode/compare/v0.20.9...v0.20.10) (2023-12-03)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.8](https://github.com/Codeneos/vlocode/compare/v0.20.7...v0.20.8) (2023-10-18)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.7](https://github.com/Codeneos/vlocode/compare/v0.20.6...v0.20.7) (2023-09-29)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.6](https://github.com/Codeneos/vlocode/compare/v0.20.5...v0.20.6) (2023-09-25)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.5](https://github.com/Codeneos/vlocode/compare/v0.20.4...v0.20.5) (2023-09-06)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.3](https://github.com/Codeneos/vlocode/compare/v0.20.2...v0.20.3) (2023-08-24)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.2](https://github.com/Codeneos/vlocode/compare/v0.20.1...v0.20.2) (2023-08-23)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.1](https://github.com/Codeneos/vlocode/compare/v0.20.1-next.0...v0.20.1) (2023-08-23)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.20.1-next.0](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.1...v0.20.1-next.0) (2023-08-20)

### Bug Fixes

* when a record groups only has skipped records it is incorrectly reported as failed ([dba71f4](https://github.com/Codeneos/vlocode/commit/dba71f4421c4fd2c5b7cc15bb19afa13e37cbfbb))

### Features

* improve build system and reduce load time of extension on startup by 40% ([692de00](https://github.com/Codeneos/vlocode/commit/692de003c677516ed13064fb4d7011be2f090225))

# [0.20.0-alpha.1](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.0...v0.20.0-alpha.1) (2023-08-14)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [0.20.0-alpha.0](https://github.com/Codeneos/vlocode/compare/v0.19.21...v0.20.0-alpha.0) (2023-08-12)

### Features

* report progress when deploying datapacks in direct deploy mode for datapacks ([3890ec1](https://github.com/Codeneos/vlocode/commit/3890ec19d2514820502efc013fb4fc45f8d8b5bc))

* support new metadata types for deployment ([f5a7139](https://github.com/Codeneos/vlocode/commit/f5a7139b30e4bd43d2d2423150c41eb6ed38429e))

## [0.19.21](https://github.com/Codeneos/vlocode/compare/v0.19.20...v0.19.21) (2023-08-02)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.20](https://github.com/Codeneos/vlocode/compare/v0.19.19...v0.19.20) (2023-08-01)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.19](https://github.com/Codeneos/vlocode/compare/v0.19.18...v0.19.19) (2023-07-30)

### Features

* report invalid matching key configuration and fail deployment when trying to update the same record twice in the same batch ([c0c0031](https://github.com/Codeneos/vlocode/commit/c0c00316ed56312a4d9b5fda57256ec5fa620391))

## [0.19.18](https://github.com/Codeneos/vlocode/compare/v0.19.17...v0.19.18) (2023-07-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.17](https://github.com/Codeneos/vlocode/compare/v0.19.16...v0.19.17) (2023-07-26)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.16](https://github.com/Codeneos/vlocode/compare/v0.19.15...v0.19.16) (2023-07-25)

### Features

* check script element validity to avoid activation of fault scripts ([692583a](https://github.com/Codeneos/vlocode/commit/692583af5cf40d2c121480b87dc0066e09318f85))

* support LWC geneation ([5f0107e](https://github.com/Codeneos/vlocode/commit/5f0107e6fe4e002809ee3b43245fff5ce7f8e6fe))

* update to typescript to version 5 and update required dependencies to match ([ccbda5c](https://github.com/Codeneos/vlocode/commit/ccbda5c228850fc91e7c605de30c202178ef55da))

* upgrade XML functions to use FXPv4 ([63c0ba9](https://github.com/Codeneos/vlocode/commit/63c0ba91989e7a87fbad5b64ee40c6672260509d))

## [0.19.15](https://github.com/Codeneos/vlocode/compare/v0.19.14...v0.19.15) (2023-07-12)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.14](https://github.com/Codeneos/vlocode/compare/v0.19.13...v0.19.14) (2023-07-10)

### Bug Fixes

* deployment fails to deploy child item overrides since v0.19.11 ([0125289](https://github.com/Codeneos/vlocode/commit/0125289b9faf9c1134f7df3aa1ea31cb39896fe9))

### Features

* **breaking:** rename `strictDependencies` to `strictOrder` to better explain what the option does ([1de5352](https://github.com/Codeneos/vlocode/commit/1de5352d195d7f6c513d9cc4302ff5660af22e17))

* do not deploy records for which a dependency did not deploy unless `allowUnresolvedDependencies` is set ([1f52fae](https://github.com/Codeneos/vlocode/commit/1f52fae9424fa258a8028557ee78fa1f358ac855))

* improve reporting when using direct deploy mode from VSCode ([5f40128](https://github.com/Codeneos/vlocode/commit/5f40128180729898bfa12289d167630939fee7d7))

## [0.19.13](https://github.com/Codeneos/vlocode/compare/v0.19.12...v0.19.13) (2023-07-05)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.12](https://github.com/Codeneos/vlocode/compare/v0.19.10...v0.19.12) (2023-07-04)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.11](https://github.com/Codeneos/vlocode/compare/v0.19.10...v0.19.11) (2023-06-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.10](https://github.com/Codeneos/vlocode/compare/v0.19.9...v0.19.10) (2023-06-21)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.19.9](https://github.com/Codeneos/vlocode/compare/v0.19.8...v0.19.9) (2023-06-21)

### Bug Fixes

* datapackLookupService does not allow namespace-less lookup fields ([eed26c4](https://github.com/Codeneos/vlocode/commit/eed26c4c26513208f42ed8223734e5ce2dc979d9))

* when deploying a Product2 datapack for the first time a duplicate Root PCI record is created when running with triggers enabled ([3461618](https://github.com/Codeneos/vlocode/commit/346161840c89e9baa10369b511d22a1a6c47c3fe))

## [0.19.8](https://github.com/Codeneos/vlocode/compare/v0.19.7...v0.19.8) (2023-05-08)

### Bug Fixes

* do not invoke controller picklist command when optionSource is not a valid controller method ([a8c5ac4](https://github.com/Codeneos/vlocode/commit/a8c5ac45be7d6f06110503916428a7b175519ef5))

## [0.19.7](https://github.com/Codeneos/vlocode/compare/v0.19.6...v0.19.7) (2023-04-25)

### Bug Fixes

* seed values of embedded scripts are not included in parent script ([cb09cf9](https://github.com/Codeneos/vlocode/commit/cb09cf9f305fcfb79a8e4de44da703a7b6206879))

## [0.19.6](https://github.com/Codeneos/vlocode/compare/v0.19.5...v0.19.6) (2023-04-24)

### Bug Fixes

* type ahead blocks are not working when activated with Vlocode ([f775f6d](https://github.com/Codeneos/vlocode/commit/f775f6da727e8588087e10e9b3be3edafecbbf41))

## [0.19.5](https://github.com/Codeneos/vlocode/compare/v0.19.4...v0.19.5) (2023-04-18)

### Bug Fixes

* reduce order warnings for script elements ([09085ad](https://github.com/Codeneos/vlocode/commit/09085adfe8e45abafb74d74071a6533ce6a48459))

## [0.19.4](https://github.com/Codeneos/vlocode/compare/v0.19.3...v0.19.4) (2023-04-18)

### Bug Fixes

* datapack deployment does not delete not updatable child records (i.e; matrix rows) ([15b5776](https://github.com/Codeneos/vlocode/commit/15b5776a40963668e6d5f93b5829bddf46356f36))

## [0.19.3](https://github.com/Codeneos/vlocode/compare/v0.19.2...v0.19.3) (2023-04-17)

### Bug Fixes

* binary data (docx etc) not properly exposed in proxy ([e7afe72](https://github.com/Codeneos/vlocode/commit/e7afe72172899ed006e60d8679ee2554287cd600))

* do not use query cache during deployment to avoid issues caused by a stale cache ([cbb45fa](https://github.com/Codeneos/vlocode/commit/cbb45fa59a13f48dd4bfae2bcdb77ed3636484e7))

* script builder does not properly generate options for picklists with custom source ([3e2aeb2](https://github.com/Codeneos/vlocode/commit/3e2aeb22ea4e513fc745da149f3dad839b3f5d34))

* versionable datapacks are not sorted by version when using export command ([757783d](https://github.com/Codeneos/vlocode/commit/757783d9a8ab9aea3a64672c6aee5e2ab2436c23))

## [0.19.2](https://github.com/Codeneos/vlocode/compare/v0.19.1...v0.19.2) (2023-04-04)

### Bug Fixes

* datapack type for integration procedures is set to OmniScript ([9c32b75](https://github.com/Codeneos/vlocode/commit/9c32b757dca4a6ee3a0c960100f7925265ac2a11))

## [0.19.1](https://github.com/Codeneos/vlocode/compare/v0.18.18...v0.19.1) (2023-04-03)

### Bug Fixes

* activate integration procedures using remote APEX ([3f79191](https://github.com/Codeneos/vlocode/commit/3f79191d7b6ae2b48b4b5f6eb29fdbd4c1d25e37))

* additional validation on OmniScript templates to avoid linking templates that are not strings ([0d66200](https://github.com/Codeneos/vlocode/commit/0d66200594de340065334a67aae3cd95e8590d07))

* before and after deploy specs do no respect record filter ([299eb4c](https://github.com/Codeneos/vlocode/commit/299eb4c5ea5450bd04914167da6e0b28dd621611))

* datapack deployment tries to delete matching key records that can be updated in exceptional cases ([43b1ce4](https://github.com/Codeneos/vlocode/commit/43b1ce43c94b5646b2e3840ef53d0af8f2476332))

* datapackLookupService does not update the namespace of the filter when comparing field values causing a bugcheck ([826205f](https://github.com/Codeneos/vlocode/commit/826205f277757fbb1f48ac719a3a17bc2cdc8bfb))

* definition builder for OmniScripts concatenates templates in a different order then APEX activation. ([5abf833](https://github.com/Codeneos/vlocode/commit/5abf833fae1e1568837b1f594b32921fe36a7c19))

* deployed OmniScript using local activation does not get updated to activated after deploying the definition and LWC ([4051b81](https://github.com/Codeneos/vlocode/commit/4051b819c869df22fc47d98116481c69e0b37cbf))

* display warning for omniscript datapacks without elements instead of an error ([62f2398](https://github.com/Codeneos/vlocode/commit/62f2398aa2730fe0c838adee29aab12db87aa605))

* do not dump old and new script definitions during activation ([81f9a17](https://github.com/Codeneos/vlocode/commit/81f9a17b83b14753635a7b96bbb062ee78991cfe))

* drop `uuid` package in favor of browser and node native `randomUUID` from `node:ctypto` ([78e954c](https://github.com/Codeneos/vlocode/commit/78e954c8cac5773962f76ea42827ab0475231ad9))

* ensure that script activation does not delete the old definitions before ensuring the new version can be activated (only when activating a new version) ([0e6631a](https://github.com/Codeneos/vlocode/commit/0e6631ad5bddf7f062185fca8f38e46040f7e920))

* exclude datapacks that are not loaded properly due to spec-function errors from the deployment and properly log and attach spec function errors to the respective datapack that causes them ([c4c7fb1](https://github.com/Codeneos/vlocode/commit/c4c7fb10cdfe3129c8ab31543e3925fa0fc053bf))

* fix several script generation errors ([eff0ef0](https://github.com/Codeneos/vlocode/commit/eff0ef01e4fc72ff2917f5250e9b879ee8f437ca))

* incorrectly mapping version to sub type  for script definition generation ([e6ff15a](https://github.com/Codeneos/vlocode/commit/e6ff15acc7ae0a6797a2ee0f3a913276e8429376))

* IPs with single elements crashed updateElementOrder due to that expecting elements to always be an array ([ae66a4a](https://github.com/Codeneos/vlocode/commit/ae66a4a332ac250b0769581b4121cbb3fccb1403))

* lookup service does not report script name/id in lookup error ([8021d97](https://github.com/Codeneos/vlocode/commit/8021d97094b3d3f89c22f19928f5dc552345882f))

* LWC compiler throws error when the tooling record is not updated as Salesforce returns a 204 status code with no body ([64e4eaf](https://github.com/Codeneos/vlocode/commit/64e4eaf319321a39317ca81bf669428827224ade))

* LWC enabled scripts with embedded scripts did not render elements inside of blocks ([d0c9b9c](https://github.com/Codeneos/vlocode/commit/d0c9b9c18e41650771579370adb0842a8b052ce9))

* only run tests for test and spec files in __tests__ folder ([65fb3a9](https://github.com/Codeneos/vlocode/commit/65fb3a975cc291fbb37b4dc04eea9afe97605924))

* only update order and level when not set in the datapack. ([a26f6e3](https://github.com/Codeneos/vlocode/commit/a26f6e3151cbb4409e8afe089c2d4185957b85f5))

* re-ordering of elements should start counting at 1 for element order instead of 0 ([1bdc38c](https://github.com/Codeneos/vlocode/commit/1bdc38c05474571a2991394e6dec6be934da04fa))

* rename sass folder to scss to avoid conflicts with sass nodejs module ([41dd5cf](https://github.com/Codeneos/vlocode/commit/41dd5cf26856ceeeaac2f1bc4d80ba6b0f6c8e0b))

* script gen crashed on invalid picklist configuration for a choice element ([89ec371](https://github.com/Codeneos/vlocode/commit/89ec3715e3337b9c2707ccb07333aa2aa050eade))

* UI layouts are incorrectly linked to UI templates ([7b949fc](https://github.com/Codeneos/vlocode/commit/7b949fc47d4d065185acba18ce36ca577352a691))

* update order and level of OmniScript elements before deployment (issue [#396](https://github.com/Codeneos/vlocode/issues/396)) ([c9c08f1](https://github.com/Codeneos/vlocode/commit/c9c08f1774fec7cda1c157fbf03c8e9e5fba8768))

* when building multiple definitions they re-use the same objects instead of deepCloning them ([24fe045](https://github.com/Codeneos/vlocode/commit/24fe0451221818b321be92ff779a453dcdbd6188))

### Features

* add support for reactivating dependent scripts ([2a8a42c](https://github.com/Codeneos/vlocode/commit/2a8a42c6725ca83905462e0c0038dc4ed7ee6b42))

* always regenerate the LWC id when building the script definitions ([2f57fc0](https://github.com/Codeneos/vlocode/commit/2f57fc06231be1969b2237150831f83e51b71e89))

* change getErrorMessage signature to accept options and allow default options to be set easily ([f1e8d46](https://github.com/Codeneos/vlocode/commit/f1e8d46132403672c3b3c87ed0bb39106a2c34bf))

* local OmniScript activation now updates the isActive flag to `true` and deactivates the old active version of the same script ([08092e4](https://github.com/Codeneos/vlocode/commit/08092e4f1f51927414a2810590c3a091b17559da))

* open LWC OmniScripts in LWC editor and classic in Angular designer ([e016d3f](https://github.com/Codeneos/vlocode/commit/e016d3f45ad1ec7ef218ce37d52bc879961c2f8e))

* report stack trace for datapack loading errors during datapack deployment while debugging ([b282180](https://github.com/Codeneos/vlocode/commit/b282180dd286116ba5bf7f55f96f8c46459218c5))

* support correctly parsing datapacks that are not in a parent folder ([ae261c2](https://github.com/Codeneos/vlocode/commit/ae261c2727d5fcc40afc78b471929a7162408d1f))

* support local OmniScript definition generation instead of using remote APEX. This speeds up OmniScript activation and avoids govern limit issue when activating large scripts. ([5bbd304](https://github.com/Codeneos/vlocode/commit/5bbd30462101d0918de34dfed7badee88d5e2dd9))

* support more datapack types in datapack explorer ([3a19411](https://github.com/Codeneos/vlocode/commit/3a1941197250a8b747cb1ae8774511ec4c4d22a9))

* support more lookup configurations for OmniScripts ([6ea32b4](https://github.com/Codeneos/vlocode/commit/6ea32b4528f9302b91765b9bba7beb5d6d679501))

* support unlimited re-usable OmniScript embedding; allows more then 1 level deep embedding of scripts ([bb23f67](https://github.com/Codeneos/vlocode/commit/bb23f677ee8e74a0ae43a067e17ed1f0b1d21bdb))

* switch from sass.js to sass-dart for scss compilation; sass.js is not unmaintained and not being updated anymore ([807e45c](https://github.com/Codeneos/vlocode/commit/807e45c593061b509309db849f66dc7188e7238a))

## [0.18.18](https://github.com/Codeneos/vlocode/compare/v0.18.17...v0.18.18) (2023-03-01)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.17](https://github.com/Codeneos/vlocode/compare/v0.18.16...v0.18.17) (2023-02-23)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.16](https://github.com/Codeneos/vlocode/compare/v0.18.15...v0.18.16) (2023-02-20)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.15](https://github.com/Codeneos/vlocode/compare/v0.18.14...v0.18.15) (2023-02-20)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.14](https://github.com/Codeneos/vlocode/compare/v0.18.13...v0.18.14) (2023-02-14)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.13](https://github.com/Codeneos/vlocode/compare/v0.18.12...v0.18.13) (2023-02-14)

### Features

* implement support bulk API 2.0 ([cd0c346](https://github.com/Codeneos/vlocode/commit/cd0c3461c4915397c2fef18aed57e84c3113a8c9))

## [0.18.12](https://github.com/Codeneos/vlocode/compare/v0.18.11...v0.18.12) (2023-01-27)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.11](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.11) (2023-01-26)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.10](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.10) (2023-01-25)

**Note:** Version bump only for package @vlocode/vlocity-deploy

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.8](https://github.com/Codeneos/vlocode/compare/v0.18.7...v0.18.8) (2023-01-25)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.7](https://github.com/Codeneos/vlocode/compare/v0.18.6...v0.18.7) (2023-01-24)

### Bug Fixes

* "spec function failed to execute" error on action activation ([84617cf](https://github.com/Codeneos/vlocode/commit/84617cf5070caa0b1581ce41525adb018433e6e7))

### Features

* ensure correct deployment order for Vlocity cards ([7758438](https://github.com/Codeneos/vlocode/commit/77584386c74375fa870bfa83a4f2acb43937a04c))

* ensure layouts are only activated after templates and cards are deployed and activated ([96ab0ce](https://github.com/Codeneos/vlocode/commit/96ab0cedd60098031d57742ec184b756cdb21f46))

## [0.18.6](https://github.com/Codeneos/vlocode/compare/v0.18.5...v0.18.6) (2022-12-12)

### Features

* support deployment of field map config with custom spec file ([44d6368](https://github.com/Codeneos/vlocode/commit/44d636845435859bbcc2fecfdd0d77650e3a81e3))

## [0.18.5](https://github.com/Codeneos/vlocode/compare/v0.18.4...v0.18.5) (2022-11-23)

### Bug Fixes

* wrong date-time format ([669cf27](https://github.com/Codeneos/vlocode/commit/669cf27340da39d2258feb76e47d98253ca264c8))

## [0.18.4](https://github.com/Codeneos/vlocode/compare/v0.18.3...v0.18.4) (2022-11-23)

### Bug Fixes

* crypto module not imported ([370dde6](https://github.com/Codeneos/vlocode/commit/370dde6e90aadcd7c12e6ac5574db1c5fa804494))

* lookup service returns incorrectly matched records in edge case (to strings ending with `-1` are considered equal due to quirks in the js-Date class) ([23fc498](https://github.com/Codeneos/vlocode/commit/23fc498cf9ee3c8ee49ed82d0472aa6df1c40130))

* only a single spec function executes for mixed deployments causing templates, scripts and other components from not being activated ([3a7f8af](https://github.com/Codeneos/vlocode/commit/3a7f8afb7b3626f6cd1bd35a6175784d86cb8c40))

* references returned as boolean values in record factory ([8ac959e](https://github.com/Codeneos/vlocode/commit/8ac959ea9e89d782c377bb83bc163b3c4a93f74c))

* using old moment date formats with luxon ([4f99eb3](https://github.com/Codeneos/vlocode/commit/4f99eb3984fddca44b221b281c72e28312647582))

### Features

* improve resolution speed by not comparing all fields of an object but exit once a single field mismatches in lookup service ([ceb32ac](https://github.com/Codeneos/vlocode/commit/ceb32aca0fbb7e90b5990a7d1df049f90a71e0c4))

## [0.18.3](https://github.com/Codeneos/vlocode/compare/v0.18.2...v0.18.3) (2022-11-22)

### Features

* add support for purging object field maps before new-ones are deployed ([48f327c](https://github.com/Codeneos/vlocode/commit/48f327c08b846219e3cc79459404cf9b1c0facba))

## [0.18.2](https://github.com/Codeneos/vlocode/compare/v0.18.1...v0.18.2) (2022-11-22)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.18.1](https://github.com/Codeneos/vlocode/compare/v0.18.0...v0.18.1) (2022-11-21)

**Note:** Version bump only for package @vlocode/vlocity-deploy

# [0.18.0](https://github.com/Codeneos/vlocode/compare/v0.17.12...v0.18.0) (2022-11-21)

### Bug Fixes

* add more unit tests for filterApplicableRecords and evalFilter ([f1d71cb](https://github.com/Codeneos/vlocode/commit/f1d71cb187ee6c3bd2027bcbc3376c56e854744b))

* container injection for vlocode standalone does not always use internal container ([a5e1ce7](https://github.com/Codeneos/vlocode/commit/a5e1ce7f9242b22cd254034316243c6e584b7cfd))

* content versions create new content documents during deployment instead of attaching to the existing content document as new version ([f7bc2b8](https://github.com/Codeneos/vlocode/commit/f7bc2b81ea9f901e41480eded09a563fbfa47323))

* datapackDeploy register queryservice from root container into child container without a valid namespace provider ([f4d11f9](https://github.com/Codeneos/vlocode/commit/f4d11f9b1b5335a6006d5e3bb1486c2f5928077d))

* deployment specs are not re-used but recreated for every spec call causing local state of specs to be lost as well as reducing performance ([866a443](https://github.com/Codeneos/vlocode/commit/866a44337512950c0bb4cba37570fa2abece5e23))

* LWC compiler doesn't work on vlocity Winter '23 release ([d9618d1](https://github.com/Codeneos/vlocode/commit/d9618d1e30db9f68807e81b2a2d41a3fd40efd1e))

* omniscript activator references vlocity_cmt namespace instead of the namespace placeholder ([b99e32e](https://github.com/Codeneos/vlocode/commit/b99e32e03947533323a20e29fc74de154d9dc3f1))

* OmniScript spec doesn't always execute ([97b42c2](https://github.com/Codeneos/vlocode/commit/97b42c2a9ea856be8130cde76618e273fc464997))

* override definitions are not correctly updated causing them to break ([b10e7f0](https://github.com/Codeneos/vlocode/commit/b10e7f0c428efe8ab2f9d5cd62834b4914e7667a))

* update all spec filters to filter on RecordType instead of on Datapack Type; Datapack type is not always reliable and depends on headers being placed in correct folders. As vlocode doesn't require datapacks to be placed in the correct folder structure having specs only trigger on datapack type is unreliable. ([6bf1a04](https://github.com/Codeneos/vlocode/commit/6bf1a0488f1f9f25a6ace6db032c32befea56dde))

* use record defined lookup keys instead of general matching keys to allow specs to modify lookupk keys on a per record level ([8370707](https://github.com/Codeneos/vlocode/commit/8370707d0cabb9aa128b8e798797b2f9ab51ee55))

* validate datapack dependency/reference integrity ([ff98a55](https://github.com/Codeneos/vlocode/commit/ff98a553404f2e066e2929e38b853cd5db9afdc0))

* vlocode crashes on start-up when packed with webpack ([bcd177f](https://github.com/Codeneos/vlocode/commit/bcd177f930b28c300370f97c0e8c53b99cc058f3))

### Features

* automatically create ContentDocumentLinks post deployment to make document templates available post-deployment without manual actions ([0c7e23c](https://github.com/Codeneos/vlocode/commit/0c7e23cc73c9396452c05827d361c29585b79b0f))

* await batch classes executed by Vlocity Admin commands and report their progress in vscode ([16453df](https://github.com/Codeneos/vlocode/commit/16453df7eaee34805e63c51a2f101daf2f0296da))

* cache Vlocity namespace prefix by org ([3978bff](https://github.com/Codeneos/vlocode/commit/3978bff73727ff90a03c6422603e46db317aa643))

* combine layout and card deployment actions ([b565f6c](https://github.com/Codeneos/vlocode/commit/b565f6c67df47c5d6807b8392d691afabc578dce))

* do not update ContentVersion when the version data is unchanged ([e998a86](https://github.com/Codeneos/vlocode/commit/e998a8648c097bc87e5c71366a1e78a65788be88))

* do not use sfdx connection and upgrade to @salesforce/core@3 ([be6add4](https://github.com/Codeneos/vlocode/commit/be6add401f29131e4769feb8f9b7a59787285edf))

* improve support for cancellation signaling during datapack deploymen ([e356132](https://github.com/Codeneos/vlocode/commit/e3561320f48c2b22c3efd5361e1d13676380a929))

* log deployment object details when running with `debug` log level ([ba7f9b1](https://github.com/Codeneos/vlocode/commit/ba7f9b125f794fd6018a0a9ea1aeff83003b722b))

* update TemplateContentDocumentId__c field when deploying templates with the latest content version ([325ebb6](https://github.com/Codeneos/vlocode/commit/325ebb6c2a43ada18f63e6a6955b9e01b58c524a))

* update Vlocity datapack deployment hooks (specs) to allow them to run on record level and support for changing deployment action from a spec ([06b2500](https://github.com/Codeneos/vlocode/commit/06b25000ad47cdce83bd00468e5ecaabf8bba596))

## [0.17.11](https://github.com/Codeneos/vlocode/compare/v0.17.10...v0.17.11) (2022-10-11)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.17.10](https://github.com/Codeneos/vlocode/compare/v0.17.9...v0.17.10) (2022-09-30)

### Bug Fixes

* OmniScript activation errors are logged as `[object object]` error ([451ae6f](https://github.com/Codeneos/vlocode/commit/451ae6f7b8649e251174899f47246142a7e12995))

### Features

* dynamically add OmniScript template and script dependencies to ensure a correct deployment order ([cb8df9f](https://github.com/Codeneos/vlocode/commit/cb8df9fbbcdab8c64ce45d50512817aacb066b09))

* use tooling API instead of metadata API for LWC omniscript deployment by default ([c7ba72c](https://github.com/Codeneos/vlocode/commit/c7ba72c2c69e6d16d3894400a155dd1603b61320))

## [0.17.9](https://github.com/Codeneos/vlocode/compare/v0.17.8...v0.17.9) (2022-09-29)

### Features

* support tooling API for deployment of LWC components ([8c6a031](https://github.com/Codeneos/vlocode/commit/8c6a031bd4930f76e7fe0076389e11b3dfd7c573))

## [0.17.8](https://github.com/Codeneos/vlocode/compare/v0.17.7...v0.17.8) (2022-09-27)

### Bug Fixes

* with `strictDependencies` enabled records of external dependencies are not correctly deployed ([cfc6e92](https://github.com/Codeneos/vlocode/commit/cfc6e9261c7c7b27339d28838bdd980a658f4245))

## [0.17.7](https://github.com/Codeneos/vlocode/compare/v0.17.6...v0.17.7) (2022-09-27)

### Bug Fixes

* double tooling desicribes ([9434936](https://github.com/Codeneos/vlocode/commit/9434936dc25c0d0692b3b4b1bcb0d18b72e2bf37))

### Features

* add options to skip OmniScript LWC deployment ([a86d227](https://github.com/Codeneos/vlocode/commit/a86d2279324e82912b7ab2b259c8b61f6c2feff7))

* expose `deploy` as separate function making it easier to invoke from external libraries ([37312d8](https://github.com/Codeneos/vlocode/commit/37312d8216c301007e17ca6800338e97987e2158))

* integrate omniscript LWC compiler and activation ([8c5bfaf](https://github.com/Codeneos/vlocode/commit/8c5bfaf6755358275997376c9d83ee169be10986))

## [0.17.6](https://github.com/Codeneos/vlocode/compare/v0.17.5...v0.17.6) (2022-08-31)

### Features

* support custom deployment specs for datapack deployment ([fed3743](https://github.com/Codeneos/vlocode/commit/fed3743e70f7b7d251d441036b6b94b56425e9a3))

## [0.17.5](https://github.com/Codeneos/vlocode/compare/v0.17.6...v0.17.5) (2022-08-19)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.17.4](https://github.com/Codeneos/vlocode/compare/v0.17.3...v0.17.4) (2022-08-16)

### Bug Fixes

* timestamps with seconds were incorrectly converted to milliseconds and milliseconds were ignored ([18f421b](https://github.com/Codeneos/vlocode/commit/18f421b21512413d3c00c2215bda3d810cd09b2c))

## [0.17.3](https://github.com/Codeneos/vlocode/compare/v0.17.2...v0.17.3) (2022-08-15)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.17.2](https://github.com/Codeneos/vlocode/compare/v0.16.22...v0.17.2) (2022-08-12)

### Bug Fixes

* datapacks with binary data are always loaded properly due to an error in the regex detection the external file types ([8d3384f](https://github.com/Codeneos/vlocode/commit/8d3384fc5f41ea9d6b5213409344c0c7003d8b9d))

* issue datapack record factory fails to convert JSON objects into strings ([5570c39](https://github.com/Codeneos/vlocode/commit/5570c3974fca48ce2bc8def9ba9aea7b4dbf87bd))

* json files are not included NPM packages ([f67a75d](https://github.com/Codeneos/vlocode/commit/f67a75de03a008dd6f6825c948489f375c2ab35c))

* properly report failed records in the log when using the record batch for deployment ([29c1424](https://github.com/Codeneos/vlocode/commit/29c1424d622221cc36942408b6d6dd3c81da7f1f))

### Features

* add strictDependencies option when deploying datapacks ([d884b1d](https://github.com/Codeneos/vlocode/commit/d884b1d5b9793825c8e1279b08886c08b656c535))

* improve datapack rename and clone commands to look at matching keys ([2d025a1](https://github.com/Codeneos/vlocode/commit/2d025a17ed93e177358de91ac648302e2a4f36d7))

* initialize datapack services when switching org to speed up any Vlocode datapack commands ([107ea6b](https://github.com/Codeneos/vlocode/commit/107ea6bb3df652e3f5bafd854885eb1ebc7e2a98))

## [0.17.1](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* datapacks with binary data are always loaded properly due to an error in the regex detection the external file types ([5486ed1](https://github.com/Codeneos/vlocode/commit/5486ed140436b1c8b2ead506b3b145ebb4802c6a))

* issue datapack record factory fails to convert JSON objects into strings ([9781fd4](https://github.com/Codeneos/vlocode/commit/9781fd4e19c3f83fd0e693e8b6ec398d69abeec6))

* properly report failed records in the log when using the record batch for deployment ([759196b](https://github.com/Codeneos/vlocode/commit/759196b3fc6d8daa34aba86eaff7488b5ea7fcd1))

### Features

* add strictDependencies option when deploying datapacks ([211d776](https://github.com/Codeneos/vlocode/commit/211d7764e4351560f3addfbee1c4c6ed8a3597e7))

* improve datapack rename and clone commands to look at matching keys ([c895408](https://github.com/Codeneos/vlocode/commit/c895408748348c94c1dba2cb996c70d9722ddf66))

* initialize datapack services when switching org to speed up any Vlocode datapack commands ([210627d](https://github.com/Codeneos/vlocode/commit/210627d0f5eb78316921fdb4242bd7beeff8c479))

# [0.17.0](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.0) (2022-08-01)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.16.36](https://github.com/Codeneos/vlocode/compare/v0.16.35...v0.16.36) (2022-07-18)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.16.35](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.35) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.34](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.34) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.33](https://github.com/Codeneos/vlocode/compare/v0.16.32...v0.16.33) (2022-07-14)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.16.32](https://github.com/Codeneos/vlocode/compare/v0.16.31...v0.16.32) (2022-07-13)

**Note:** Version bump only for package @vlocode/vlocity-deploy

## [0.16.31](https://github.com/Codeneos/vlocode/compare/v0.16.21...v0.16.31) (2022-07-13)

**Note:** Version bump only for package @vlocode/vlocity-deploy
