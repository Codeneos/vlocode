# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.1](https://github.com/Codeneos/vlocode/compare/v0.18.18...v0.19.1) (2023-04-03)

### Bug Fixes

* bug in schema normalization not working properly for arrays ([44cec8f](https://github.com/Codeneos/vlocode/commit/44cec8f29f44a12b70cde1c8a90b3ac20b517660))
* bulk queriy results do not include related object details ([6fd7e4f](https://github.com/Codeneos/vlocode/commit/6fd7e4f5e1c6050ff5a0057da16f5c8f48e0c53e))
* bulkJob compiler error due to `info` being readonly type ([c32f014](https://github.com/Codeneos/vlocode/commit/c32f014bc6136266795cf0940e1d31b333a4aefe))
* datapack deployment tries to delete matching key records that can be updated in exceptional cases ([43b1ce4](https://github.com/Codeneos/vlocode/commit/43b1ce43c94b5646b2e3840ef53d0af8f2476332))
* datapack explorer does not list certain datapacks due to query parser error ([d031866](https://github.com/Codeneos/vlocode/commit/d031866ac9b39d91cc02e0ae80009dcb6f67b17b))
* display warning for omniscript datapacks without elements instead of an error ([62f2398](https://github.com/Codeneos/vlocode/commit/62f2398aa2730fe0c838adee29aab12db87aa605))
* do not exit when async interator has 0 results ([71ed265](https://github.com/Codeneos/vlocode/commit/71ed2653e29a681d71f17c69fa22f1e51159b59f))
* drop `uuid` package in favor of browser and node native `randomUUID` from `node:ctypto` ([78e954c](https://github.com/Codeneos/vlocode/commit/78e954c8cac5773962f76ea42827ab0475231ad9))
* encodeRFC3986URI does not encode `&` character causing queries with an & to fail ([029b607](https://github.com/Codeneos/vlocode/commit/029b6079d6a8a871a20ceb44841a5ccfd036f09c))
* fix QueryService test mocks `query` operation instead of underlying transport ([5e33d7b](https://github.com/Codeneos/vlocode/commit/5e33d7bc8a0160e69a8b0e9bf84abaa6cc57dd23))
* fix several script generation errors ([eff0ef0](https://github.com/Codeneos/vlocode/commit/eff0ef01e4fc72ff2917f5250e9b879ee8f437ca))
* QueryService resolves namespace from base container ([e07b578](https://github.com/Codeneos/vlocode/commit/e07b578b136207a1903999515a47d751a0d65d54))
* relationship incorrectly cast to arrays in iterator ([e9a5e03](https://github.com/Codeneos/vlocode/commit/e9a5e03a05934c7569f5612ab621fd9a69e8bebf))
* retrieveMetadata command does not request zip file causing no files from being refreshed ([e137dfd](https://github.com/Codeneos/vlocode/commit/e137dfd253fc8bd2e46920f2ad42f945eaac99a3))
* toolingApiSchemaAccess transforms nested results which are already processed by query2 ([825a0b6](https://github.com/Codeneos/vlocode/commit/825a0b61da7fc1b33b0b3846ae8dffc70113ee36))
* use getSObjectType in query cache to avoid errors when caching complex queries not yet supported by the parser ([57aea51](https://github.com/Codeneos/vlocode/commit/57aea5194c0e83899fd6717b6b0136e5b7711842))

### Features

* add support for reactivating dependent scripts ([2a8a42c](https://github.com/Codeneos/vlocode/commit/2a8a42c6725ca83905462e0c0038dc4ed7ee6b42))
* change getErrorMessage signature to accept options and allow default options to be set easily ([f1e8d46](https://github.com/Codeneos/vlocode/commit/f1e8d46132403672c3b3c87ed0bb39106a2c34bf))
* expose job info on bulk/bulkJob.ts as readonly object from the job ([0b777be](https://github.com/Codeneos/vlocode/commit/0b777bec0bdb4c1e13655aa58dca073b699c53cf))
* improve query parser correctness by enforcing keyword order on SOQL syntax parser ([04dc796](https://github.com/Codeneos/vlocode/commit/04dc796445cbb3ec538837066e53199ee5cf6f65))
* include logging of queries in debug mode ([296395a](https://github.com/Codeneos/vlocode/commit/296395ab06d3eb019daab957d340efc3aa711cd5))
* introduce new uniform query API for data and tooling objects; update query service to use new query API. ([775ca10](https://github.com/Codeneos/vlocode/commit/775ca100f41cc72c73387f1b46da3681831a72b3))
* support local OmniScript definition generation instead of using remote APEX. This speeds up OmniScript activation and avoids govern limit issue when activating large scripts. ([5bbd304](https://github.com/Codeneos/vlocode/commit/5bbd30462101d0918de34dfed7badee88d5e2dd9))
* support more datapack types in datapack explorer ([3a19411](https://github.com/Codeneos/vlocode/commit/3a1941197250a8b747cb1ae8774511ec4c4d22a9))
* support unary operators, with condition and braces for query parsing and generation ([87d56c8](https://github.com/Codeneos/vlocode/commit/87d56c86fcd2f7faf0677bacef391f1e2f4cba94))

## [0.18.18](https://github.com/Codeneos/vlocode/compare/v0.18.17...v0.18.18) (2023-03-01)

### Bug Fixes

* createMetadata incorrectly sends metadata as tag in payload ([8ea0aa2](https://github.com/Codeneos/vlocode/commit/8ea0aa25deee6ba2479cb87a2cae1bc45f7ef63f))

## [0.18.17](https://github.com/Codeneos/vlocode/compare/v0.18.16...v0.18.17) (2023-02-23)

### Bug Fixes

* ensure xsi:type is set for all metadata operations ([1a63abb](https://github.com/Codeneos/vlocode/commit/1a63abbd8b237b610c7055f58ce7cf7c82542c9e))

## [0.18.16](https://github.com/Codeneos/vlocode/compare/v0.18.15...v0.18.16) (2023-02-20)

### Bug Fixes

* fix change managed package detection to use both readMetadata instead of only listMetadata ([60ef988](https://github.com/Codeneos/vlocode/commit/60ef988bb6486018962cb1afaedf44a94853f098))
* linking of schemas overrides default field types ([6d9c783](https://github.com/Codeneos/vlocode/commit/6d9c7838ccc7391f787477bb1ad200de9ce4a891))

### Features

* force defaults for SOAP items according to the schema ([2fce17e](https://github.com/Codeneos/vlocode/commit/2fce17e3742e62419fc6c0d10d1c40ef6f0cdcf1))
* support reading more then 10 metadata records and all metadata from a certain type (readAll) ([87f4045](https://github.com/Codeneos/vlocode/commit/87f404596b3a8a16a72d015d8dc5e2173afcecb5))

## [0.18.15](https://github.com/Codeneos/vlocode/compare/v0.18.14...v0.18.15) (2023-02-20)

### Bug Fixes

* metadata API calls do not return response body when response path undefined ([44cc277](https://github.com/Codeneos/vlocode/commit/44cc2777f078fdac890734f9931ab66ab7e471cf))

### Features

* expose more properties the bulk jobs ([5ae1f1a](https://github.com/Codeneos/vlocode/commit/5ae1f1a309cab99119a13175775af4f1ccf727ec))
* strongly typed metadata API and metadata API Schema validations ([dd1022f](https://github.com/Codeneos/vlocode/commit/dd1022ff94e47d6e3a896283fa3657896bb5697f))
* support composite requests and dynamic API versions on connection ([4036718](https://github.com/Codeneos/vlocode/commit/4036718b06ca2c2c70af9f9e6e1ea16cb5d6c939))

## [0.18.14](https://github.com/Codeneos/vlocode/compare/v0.18.13...v0.18.14) (2023-02-14)

**Note:** Version bump only for package @vlocode/salesforce

## [0.18.13](https://github.com/Codeneos/vlocode/compare/v0.18.12...v0.18.13) (2023-02-14)

### Bug Fixes

* refresh access token on connection does not emit event ([37098dd](https://github.com/Codeneos/vlocode/commit/37098ddddef1056d878ec9ad340c272dfe46dccc))
* soap client does not detect access token expiry causing error when token is expired instead of issuing a token refresh ([2cb1b2f](https://github.com/Codeneos/vlocode/commit/2cb1b2f76834de22b418d09755b0c22652c16ecf))

### Features

* adjust deployment options for production deployments and prevent deployments with incorrect configuration from starting ([ade5fe9](https://github.com/Codeneos/vlocode/commit/ade5fe90988e2faf59896ab7be4604dab2ff19a2))
* do not bundle jsforce anymore; jsforce patches have been incorperated into Salesforce connection ([718e89d](https://github.com/Codeneos/vlocode/commit/718e89d5ac19973c3f972bb5662d2e1c54052d10))
* enable response and request logging for http-transport using static transport flag ([56116ca](https://github.com/Codeneos/vlocode/commit/56116ca9792eff50fd03eaa2163578800a87bb52))
* implement support bulk API 2.0 ([cd0c346](https://github.com/Codeneos/vlocode/commit/cd0c3461c4915397c2fef18aed57e84c3113a8c9))
* support both metadata REST and SOAP APIs for deployment ([5846c2e](https://github.com/Codeneos/vlocode/commit/5846c2e1c448493888b1e1d7996626716277cf20))
* support replacement tokens in URL ([9e359a9](https://github.com/Codeneos/vlocode/commit/9e359a9c121195705b62a470641abc8cb7505dce))

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
