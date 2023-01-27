# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.18.12](https://github.com/Codeneos/vlocode/compare/v0.18.11...v0.18.12) (2023-01-27)

### Bug Fixes

* deployment command hangs due to error in async result locator ([bc2f164](https://github.com/Codeneos/vlocode/commit/bc2f16409308620f4150a39434f1e6f04b9efa6c))

## [0.18.11](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.11) (2023-01-26)

### Bug Fixes

* metadata API commands hand indefinitely due to jsforce post-processing of SOAP responses ([44c6291](https://github.com/Codeneos/vlocode/commit/44c62914ad39a3d9e754be1a9d35260f0635f094))

## [0.18.10](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.10) (2023-01-25)

**Note:** Version bump only for package @vlocode/salesforce

**Note:** Version bump only for package @vlocode/salesforce

## [0.18.8](https://github.com/Codeneos/vlocode/compare/v0.18.7...v0.18.8) (2023-01-25)

### Bug Fixes

* the refreshFn cannot be set when refresh delegates is undefined ([9d5222a](https://github.com/Codeneos/vlocode/commit/9d5222a91ecb1caa910d261fec7a3a2b60542512))

### Features

* improve custom transport so it can be used with OAuth flow and stores refreshed tokens in SFDX to avoid refreshing tokens every time vlocode connects to a SFDX org with an outdated access token ([7bd75e5](https://github.com/Codeneos/vlocode/commit/7bd75e582f5cf196b1d32272ab5c1d3bba81d283))

## [0.18.7](https://github.com/Codeneos/vlocode/compare/v0.18.6...v0.18.7) (2023-01-24)

### Bug Fixes

* http transport does not support deflate properly ([5e6ca2f](https://github.com/Codeneos/vlocode/commit/5e6ca2feaee36b31f83b28a46fd7d7e934a21207))
* missing comma causing build error ([1a3ab25](https://github.com/Codeneos/vlocode/commit/1a3ab25b0302987327c816791d2eea7b88e552ca))
* not passing client id to salesforce connection ([4c5e458](https://github.com/Codeneos/vlocode/commit/4c5e458426f503c5e73eb5727deeeb46a3a18578))

### Features

* add custom HTTP transport for Salesforce connection with support for keep-alive, socket pooling, gzip, cookies and automatic retry in-case of a hung-up socket ([0ae47a9](https://github.com/Codeneos/vlocode/commit/0ae47a925eabbc8184413372282accd3a510bf01))

## [0.18.6](https://github.com/Codeneos/vlocode/compare/v0.18.5...v0.18.6) (2022-12-12)

**Note:** Version bump only for package @vlocode/salesforce

## [0.18.5](https://github.com/Codeneos/vlocode/compare/v0.18.4...v0.18.5) (2022-11-23)

### Bug Fixes

* wrong date-time format ([669cf27](https://github.com/Codeneos/vlocode/commit/669cf27340da39d2258feb76e47d98253ca264c8))

## [0.18.4](https://github.com/Codeneos/vlocode/compare/v0.18.3...v0.18.4) (2022-11-23)

### Bug Fixes

* references returned as boolean values in record factory ([8ac959e](https://github.com/Codeneos/vlocode/commit/8ac959ea9e89d782c377bb83bc163b3c4a93f74c))
* using old moment date formats with luxon ([4f99eb3](https://github.com/Codeneos/vlocode/commit/4f99eb3984fddca44b221b281c72e28312647582))

## [0.18.3](https://github.com/Codeneos/vlocode/compare/v0.18.2...v0.18.3) (2022-11-22)

### Bug Fixes

* incorrectly report sandboxes as production orgs blocking Salesforce deployments ([0efcc8c](https://github.com/Codeneos/vlocode/commit/0efcc8c951d01926010f53454ed1fdb3903bb9c2))

## [0.18.2](https://github.com/Codeneos/vlocode/compare/v0.18.1...v0.18.2) (2022-11-22)

**Note:** Version bump only for package @vlocode/salesforce

## [0.18.1](https://github.com/Codeneos/vlocode/compare/v0.18.0...v0.18.1) (2022-11-21)

### Bug Fixes

* clear debug logs commands does not complete ([2ae7d6c](https://github.com/Codeneos/vlocode/commit/2ae7d6c20fa70cf7e1816f359d9a04d6ee3d81ea))

# [0.18.0](https://github.com/Codeneos/vlocode/compare/v0.17.12...v0.18.0) (2022-11-21)

### Bug Fixes

* remove debug statement from queryBuilder ([7e7ee17](https://github.com/Codeneos/vlocode/commit/7e7ee175398a1ba117c36cb56e9b7c6fdfdb6bb8))

### Features

* await batch classes executed by Vlocity Admin commands and report their progress in vscode ([16453df](https://github.com/Codeneos/vlocode/commit/16453df7eaee34805e63c51a2f101daf2f0296da))
* do not update ContentVersion when the version data is unchanged ([e998a86](https://github.com/Codeneos/vlocode/commit/e998a8648c097bc87e5c71366a1e78a65788be88))
* do not use sfdx connection and upgrade to @salesforce/core@3 ([be6add4](https://github.com/Codeneos/vlocode/commit/be6add401f29131e4769feb8f9b7a59787285edf))
* report progress of developer logs deletion in vscode progress dialog ([f522a7a](https://github.com/Codeneos/vlocode/commit/f522a7ac9a9b5203376083b9a7843617088b71a3))
* support queryTooling through queryService ([9f599ef](https://github.com/Codeneos/vlocode/commit/9f599efd62f2123d67ad574efe388b188a3d63c3))
* update Vlocity datapack deployment hooks (specs) to allow them to run on record level and support for changing deployment action from a spec ([06b2500](https://github.com/Codeneos/vlocode/commit/06b25000ad47cdce83bd00468e5ecaabf8bba596))
* use standard vscode icons for activities and support hiding of activities in the activity overview ([eacc4b9](https://github.com/Codeneos/vlocode/commit/eacc4b9dd49daff3e78c31444c6083fbe29de0fc))

## [0.17.11](https://github.com/Codeneos/vlocode/compare/v0.17.10...v0.17.11) (2022-10-11)

### Bug Fixes

* ensure consistent behavior for `SalesforceSchemaService` with the new `CompositeSchemaAccess` that can throws Errors ([4aa5cb7](https://github.com/Codeneos/vlocode/commit/4aa5cb7a7d4511f76d0b6c91618bd99db1548c04))

## [0.17.9](https://github.com/Codeneos/vlocode/compare/v0.17.8...v0.17.9) (2022-09-29)

**Note:** Version bump only for package @vlocode/salesforce

## [0.17.8](https://github.com/Codeneos/vlocode/compare/v0.17.7...v0.17.8) (2022-09-27)

### Bug Fixes

* stand alone vlocode does not correctly assume the API version of the connection ([eb757f8](https://github.com/Codeneos/vlocode/commit/eb757f834c2438389ea27392f0a0191aec0b21ad))
* when not using an SFDX connection the content headers are not set by JSON by default ([8e95c14](https://github.com/Codeneos/vlocode/commit/8e95c149d0023a649514f5e6ba2bd8bb24bce36a))

## [0.17.7](https://github.com/Codeneos/vlocode/compare/v0.17.6...v0.17.7) (2022-09-27)

### Bug Fixes

* `transfrom` was renamed to `mapKeys` in core package but not updated in salesforce package ([8098fe0](https://github.com/Codeneos/vlocode/commit/8098fe06d953c332c4e8f154f7e4797e69774d50))
* double tooling desicribes ([9434936](https://github.com/Codeneos/vlocode/commit/9434936dc25c0d0692b3b4b1bcb0d18b72e2bf37))

### Features

* add options to skip OmniScript LWC deployment ([a86d227](https://github.com/Codeneos/vlocode/commit/a86d2279324e82912b7ab2b259c8b61f6c2feff7))
* expose `deploy` as separate function making it easier to invoke from external libraries ([37312d8](https://github.com/Codeneos/vlocode/commit/37312d8216c301007e17ca6800338e97987e2158))
* integrate omniscript LWC compiler and activation ([8c5bfaf](https://github.com/Codeneos/vlocode/commit/8c5bfaf6755358275997376c9d83ee169be10986))

## [0.17.6](https://github.com/Codeneos/vlocode/compare/v0.17.5...v0.17.6) (2022-08-31)

### Bug Fixes

* multiple parallel connection tests executed on reconnect instead a single one ([572b7dd](https://github.com/Codeneos/vlocode/commit/572b7dd1f7b55fb53fa6a3cce590497d81497e36))

## [0.17.3](https://github.com/Codeneos/vlocode/compare/v0.17.2...v0.17.3) (2022-08-15)

**Note:** Version bump only for package @vlocode/salesforce

## [0.17.2](https://github.com/Codeneos/vlocode/compare/v0.16.22...v0.17.2) (2022-08-12)

### Bug Fixes

* duplicate fields in query generation and not replacing namespaces for query formater ([951a2eb](https://github.com/Codeneos/vlocode/commit/951a2eb960d95712781fa6912b4b037aa191aa78))
* incorrectly detect sandbox orgs as production instance (v0.17.x issue) ([4e01648](https://github.com/Codeneos/vlocode/commit/4e0164880fc9455908a5c8ff310dd236ba5208ea))
* issue datapack record factory fails to convert JSON objects into strings ([5570c39](https://github.com/Codeneos/vlocode/commit/5570c3974fca48ce2bc8def9ba9aea7b4dbf87bd))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([debeed8](https://github.com/Codeneos/vlocode/commit/debeed8db4df22764f228a07ffc4ca86b23d5a55))
* json files are not included NPM packages ([f67a75d](https://github.com/Codeneos/vlocode/commit/f67a75de03a008dd6f6825c948489f375c2ab35c))
* properly report failed records in the log when using the record batch for deployment ([29c1424](https://github.com/Codeneos/vlocode/commit/29c1424d622221cc36942408b6d6dd3c81da7f1f))

### Features

* add query parser to manipulate and analyze SOQL queries ([3f1a922](https://github.com/Codeneos/vlocode/commit/3f1a922d9394398a30cdd55595d2b6c2ab674ff9))
* support creating connection provider from an existing jsforce connection whilst keeping all fixes and patches to jsforce active ([2da0dd6](https://github.com/Codeneos/vlocode/commit/2da0dd6437f7cea180dbdddc2b4d60cdd584caa9))

## [0.17.1](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* duplicate fields in query generation and not replacing namespaces for query formater ([c1c89a6](https://github.com/Codeneos/vlocode/commit/c1c89a6b6089d037670574dcc51d93b9115cd546))
* incorrectly detect sandbox orgs as production instance (v0.17.x issue) ([1ef44c5](https://github.com/Codeneos/vlocode/commit/1ef44c5942331d7c7107c8d82ff949b1646b210a))
* issue datapack record factory fails to convert JSON objects into strings ([9781fd4](https://github.com/Codeneos/vlocode/commit/9781fd4e19c3f83fd0e693e8b6ec398d69abeec6))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/Codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))
* properly report failed records in the log when using the record batch for deployment ([759196b](https://github.com/Codeneos/vlocode/commit/759196b3fc6d8daa34aba86eaff7488b5ea7fcd1))

### Features

* add query parser to manipulate and analyze SOQL queries ([5a371bd](https://github.com/Codeneos/vlocode/commit/5a371bdda56e79ad565bed6f36495b3aaf1a0833))

# [0.17.0](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.0) (2022-08-01)

### Bug Fixes

* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/Codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))

### Features

* add query parser to manipulate and analyze SOQL queries ([5a371bd](https://github.com/Codeneos/vlocode/commit/5a371bdda56e79ad565bed6f36495b3aaf1a0833))

## [0.16.36](https://github.com/Codeneos/vlocode/compare/v0.16.35...v0.16.36) (2022-07-18)

**Note:** Version bump only for package @vlocode/salesforce

## [0.16.35](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.35) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.34](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.34) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.33](https://github.com/Codeneos/vlocode/compare/v0.16.32...v0.16.33) (2022-07-14)

### Features

* support creating connection provider from an existing jsforce connection whilst keeping all fixes and patches to jsforce active ([7280d18](https://github.com/Codeneos/vlocode/commit/7280d184f6538e0331ed053c5fc57cab03b5162b))

## [0.16.32](https://github.com/Codeneos/vlocode/compare/v0.16.31...v0.16.32) (2022-07-13)

**Note:** Version bump only for package @vlocode/salesforce

## [0.16.31](https://github.com/Codeneos/vlocode/compare/v0.16.21...v0.16.31) (2022-07-13)

**Note:** Version bump only for package @vlocode/salesforce
