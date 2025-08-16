# Change Log
## Vlocity/Salesforce Integration for VSCode

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.32.0](https://github.com/Codeneos/vlocode/compare/v1.31.10...v1.32.0) (2025-08-16)

### Bug Fixes

* labels in MultiLanguage OmniScript are not added properly to the OmniScript definition ([83f9ea8](https://github.com/Codeneos/vlocode/commit/83f9ea81ee050fd31d229afef971e6f6812d8ae9))

### Features

* enhanced support for metadata refresh and export in decomposed source format ([5daeb09](https://github.com/Codeneos/vlocode/commit/5daeb0977ee4418415ca61ae5847d38bcb0416f5))
* expand static resources with the proper file extension based on the contents mime type ([e2ff339](https://github.com/Codeneos/vlocode/commit/e2ff339cece4bd3ef118e5ad52511d075e14c5ef))
* support refreshing Salesforce metadata in SF(DX) format ([b2309c1](https://github.com/Codeneos/vlocode/commit/b2309c1cfd6a7a155b4261d3169f2359d1f3489e))

## [1.31.10](https://github.com/Codeneos/vlocode/compare/v1.31.9...v1.31.10) (2025-07-28)

### Bug Fixes

* metadata isn't refreshed in the correct path and is missing -meta.xml. Also fix refresh of metadata doesn't include -meta.xml ([fa1589b](https://github.com/Codeneos/vlocode/commit/fa1589b11381f67f05390d9ec59a1fca88f112bd))

## [1.31.8](https://github.com/Codeneos/vlocode/compare/v1.31.7...v1.31.8) (2025-07-23)

### Bug Fixes

* API 64.0 does not properly print deployment results ([c436e81](https://github.com/Codeneos/vlocode/commit/c436e813134db6ede43574ab2f5432b082e5d1c6))
* execute REST API does not return failed API responses properly ([0deb817](https://github.com/Codeneos/vlocode/commit/0deb817d1da89d59fff22b3f34526bb8b933bda0))
* spread component messages into allComponentMessages for proper aggregation ([f1a674b](https://github.com/Codeneos/vlocode/commit/f1a674bffe44783cab1cb2149d0c2b43957bec98))

## [1.31.5](https://github.com/Codeneos/vlocode/compare/v1.31.4...v1.31.5) (2025-07-08)

### Features

* support for a new code lens that shows the status of an APEX class file compared to the org and allows to show the diff with the file in the org ([c1593ff](https://github.com/Codeneos/vlocode/commit/c1593ff4b3402007dd32f6dc14654766f8c85cc0))

## [1.31.4](https://github.com/Codeneos/vlocode/compare/v1.31.3...v1.31.4) (2025-07-03)

### Bug Fixes

* deploying an APEX class or Metadata file with unsaved changes causes it to deploy the version of the metadata before the changes are saved. ([e907c68](https://github.com/Codeneos/vlocode/commit/e907c688320a09e40a81ddc4226855dbd9bec18f))

## [1.31.3](https://github.com/Codeneos/vlocode/compare/v1.31.2...v1.31.3) (2025-06-27)

**Note:** Version bump only for package @vlocode/salesforce

## [1.31.1](https://github.com/Codeneos/vlocode/compare/v1.31.0...v1.31.1) (2025-06-17)

### Bug Fixes

* inconsistent imports causing build errors in 1.31.0 ([db05d9a](https://github.com/Codeneos/vlocode/commit/db05d9a72fc73936023ed52685ee204dd5e5ad0d))

# [1.30.0](https://github.com/Codeneos/vlocode/compare/v1.29.5...v1.30.0) (2025-06-14)

### Bug Fixes

* do not print object label lists or describe details when not in verbose mode ([a1226b4](https://github.com/Codeneos/vlocode/commit/a1226b45c9237b24163b8f7e3a14cc33d785f387))

* make getPackageMetadata backward compatible to resolve build errors ([150489d](https://github.com/Codeneos/vlocode/commit/150489db2f10fdee09b4752017c7c6fb23c67ba9))

* update test cases to use getPackage() instead of build() for file retrieval ([182e0b9](https://github.com/Codeneos/vlocode/commit/182e0b9c393665f510101c7cc8b6297f1345b454))

### Features

* add new profile manipulation service which can persist profiles changes as delta ([7334499](https://github.com/Codeneos/vlocode/commit/7334499fd30bcb6deba25d872c400207d0974bde))

* support token replacement after adding files to a package ([53d9f7a](https://github.com/Codeneos/vlocode/commit/53d9f7a078ff0a4fe48a0953c62673b34f201f46))

## [1.29.5](https://github.com/Codeneos/vlocode/compare/v1.29.4...v1.29.5) (2025-05-26)

**Note:** Version bump only for package @vlocode/salesforce

## [1.29.4](https://github.com/Codeneos/vlocode/compare/v1.29.3...v1.29.4) (2025-05-26)

### Bug Fixes

* JSON files missing in NPM packages ([5f61f62](https://github.com/Codeneos/vlocode/commit/5f61f62d42e4d473f2eabfafdaced5748eb9afc6))

## [1.29.3](https://github.com/Codeneos/vlocode/compare/v1.29.2...v1.29.3) (2025-05-26)

### Bug Fixes

* revert ESM changes with ESBuild as ESBuild does not emit proper decorator data for use IoC framework ([a80f136](https://github.com/Codeneos/vlocode/commit/a80f13675e0fcb7e90bcccbfaedb089aeda07930))

## [1.29.2](https://github.com/Codeneos/vlocode/compare/v1.29.1...v1.29.2) (2025-05-26)

**Note:** Version bump only for package @vlocode/salesforce

# [1.29.0](https://github.com/Codeneos/vlocode/compare/v1.28.2...v1.29.0) (2025-05-25)

### Features

* upgrade all packages to publish in ESM format as well as CommonJS ([5c77946](https://github.com/Codeneos/vlocode/commit/5c779467497cba0940b5a6934febe7f1b631edb8))

## [1.28.2](https://github.com/Codeneos/vlocode/compare/v1.28.1...v1.28.2) (2025-05-22)

**Note:** Version bump only for package @vlocode/salesforce

## [1.28.1](https://github.com/Codeneos/vlocode/compare/v1.28.0...v1.28.1) (2025-05-21)

**Note:** Version bump only for package @vlocode/salesforce

# [1.28.0](https://github.com/Codeneos/vlocode/compare/v1.27.7...v1.28.0) (2025-05-21)

### Bug Fixes

* getMetadataInfo doesn't detect namespaces for CustomApplication metadata ([e6da44a](https://github.com/Codeneos/vlocode/commit/e6da44a8772d3b1ade02b4e9ce09b83ab47e522b))

* record proxy field mapping not store in cache ([628c121](https://github.com/Codeneos/vlocode/commit/628c121964f39cd482e2f08a94bf4ce35d1ac31f))

* set default compression level to 4 in getBuffer method ([4e5e81c](https://github.com/Codeneos/vlocode/commit/4e5e81cb6efea62a4a3952d38fe68a52fd4d5441))

* update antlr4ng dependency versions and improve type definitions in icon path handling ([3bc215a](https://github.com/Codeneos/vlocode/commit/3bc215a3472984eb7ae65768b467c0739125db81))

### Features

* add CustomApplication metadata URL with tooling strategy ([13e36d3](https://github.com/Codeneos/vlocode/commit/13e36d37beebfaa661e21fd77e8fda4565d9300e))

* add filterIds method to filter Salesforce IDs by SObject type ([27bc4c7](https://github.com/Codeneos/vlocode/commit/27bc4c7ffb7df5c69b7187182d125b712e1ac77b))

* add functions to deploy recent validations ([33a340c](https://github.com/Codeneos/vlocode/commit/33a340c226fb86ddfb9cd71e1123b91d465c0ce4))

* add getNameField method to schema service to get name field of an object ([560b0b6](https://github.com/Codeneos/vlocode/commit/560b0b66194000b75e3fa387d57a3160edcb1225))

* add import multipack command to enhance datapack management ([e69ec9e](https://github.com/Codeneos/vlocode/commit/e69ec9e2210a885b210addf9aef6e6777a53913f))

* add isSelected method to QueryBuilder for field selection checking ([3a94596](https://github.com/Codeneos/vlocode/commit/3a945963ec84c05e557cfc696df768229435ad6e))

* add static method to create SalesforceDeployment instance from existing deployment ID ([744c44c](https://github.com/Codeneos/vlocode/commit/744c44c9fb7a81ffa10139fdf267d13cfc7a1553))

* add writeToFile method to write SF package to a file ([67a7d0a](https://github.com/Codeneos/vlocode/commit/67a7d0a4f590d82c44d0451353eef4a1aaa187de))

* enhance QueryBuilder select and sort functions ([de40433](https://github.com/Codeneos/vlocode/commit/de40433481329059522d9979f376cc539eb6ca22))

* list recent validations with quick deploy functionality ([0660abe](https://github.com/Codeneos/vlocode/commit/0660abe518622bab25fea07e087a813e3b9afaff))

* refactor query handling and enhance iterable operations in Salesforce connection and deployment services ([f3de249](https://github.com/Codeneos/vlocode/commit/f3de24973bd4c19dfdf41e5f3313289c95419d8e))

* support for using labels in OmniScript deployment. Currently uses the default language of the label and not the translations. ([e4aa309](https://github.com/Codeneos/vlocode/commit/e4aa3096dbba646ec76f76e652b0163c34a273d6))

* support generation of LWCs from OmniStudio Datapacks without deploying ([fa4c421](https://github.com/Codeneos/vlocode/commit/fa4c421d1c95592c6a590ec8ad73a0257bf4d277))

## [1.27.6](https://github.com/Codeneos/vlocode/compare/v1.27.5...v1.27.6) (2025-01-28)

**Note:** Version bump only for package @vlocode/salesforce

## [1.27.5](https://github.com/Codeneos/vlocode/compare/v1.27.4...v1.27.5) (2024-09-02)

### Bug Fixes

* record activation for matrices and calculation procedures ([dc5fe73](https://github.com/Codeneos/vlocode/commit/dc5fe735fee6474238f4e7c4e12a7df70a249399))

* timeout calculation for httpRequest ([cb6449c](https://github.com/Codeneos/vlocode/commit/cb6449cbdddf07200a3d774d25dfe3c421877560))

# [1.27.0](https://github.com/Codeneos/vlocode/compare/v1.26.2...v1.27.0) (2024-08-21)

### Bug Fixes

* line ending differences in text files can cause delta compare to fail ([595ccb9](https://github.com/Codeneos/vlocode/commit/595ccb984616ed32dceb98087994cdae2b710b01))

* order of arguments in isPackageNewer function ([4850446](https://github.com/Codeneos/vlocode/commit/4850446a640d776a6f502f87c79ad5c7f62dee93))

### Features

* add replacement token support to deployment package builder ([467c586](https://github.com/Codeneos/vlocode/commit/467c586d67f6ec3947fd80570ec0655cbfa777a9))

* add support for replacement tokens ([2332df5](https://github.com/Codeneos/vlocode/commit/2332df56e04de89b89f6c020de00bc0c4ae212b5))

## [1.26.2](https://github.com/Codeneos/vlocode/compare/v1.26.1...v1.26.2) (2024-08-15)

### Bug Fixes

* installed packages fail to deploy ([a198601](https://github.com/Codeneos/vlocode/commit/a198601acb06ace0b45d66e42f61c9e7d6973ac9))

## [1.26.1](https://github.com/Codeneos/vlocode/compare/v1.26.0...v1.26.1) (2024-08-14)

**Note:** Version bump only for package @vlocode/salesforce

# [1.26.0](https://github.com/Codeneos/vlocode/compare/v1.25.0...v1.26.0) (2024-08-13)

### Bug Fixes

* Update evalExpr function to allow undefined values in context ([d225281](https://github.com/Codeneos/vlocode/commit/d225281b7552afd1ca8205866836e2311bdf6373))

* Update objectEquals function to ignore extra elements in arrays ([25fecdb](https://github.com/Codeneos/vlocode/commit/25fecdbd19e4b877fea4c6d100b53fd4af76f75d))

# [1.25.0](https://github.com/Codeneos/vlocode/compare/v1.24.11...v1.25.0) (2024-08-07)

### Features

* improve extension start-up performance by not pre loading tooling API object data ([9be0283](https://github.com/Codeneos/vlocode/commit/9be028385d334602210e4666eed7fcd00bda5da3))

* support datapack export based on configuration definitions in a YAML definitions file ([c2edd7c](https://github.com/Codeneos/vlocode/commit/c2edd7c7537a3d28312befa7ac5d7269140b5276))

## [1.24.11](https://github.com/Codeneos/vlocode/compare/v1.24.10...v1.24.11) (2024-06-27)

### Features

* add metadataUrls for Flow, ValidationRule, RecordType, and CompactLayout ([d890a75](https://github.com/Codeneos/vlocode/commit/d890a751ea1d4bbfd2f456d3dd9f8d073d385ce5))

## [1.24.10](https://github.com/Codeneos/vlocode/compare/v1.24.9...v1.24.10) (2024-06-24)

### Bug Fixes

* switching org, API version or user didn't fully reset cached data causing issues during deployment, viewing developer logs, etc ([34d1c06](https://github.com/Codeneos/vlocode/commit/34d1c068f4b0aeb862f5e404002948f7d7674175))

## [1.24.9](https://github.com/Codeneos/vlocode/compare/v1.24.8...v1.24.9) (2024-06-24)

### Bug Fixes

* remove empty metadata members from package manifest ([c04653d](https://github.com/Codeneos/vlocode/commit/c04653d86c1edf787a10a3587db51594fec2fd9d))

* update manifest.remove() to use componentName instead of componentType ([841c40c](https://github.com/Codeneos/vlocode/commit/841c40cbdd84c34dd39f9d5dea5558e14a85831e))

## [1.24.8](https://github.com/Codeneos/vlocode/compare/v1.24.7...v1.24.8) (2024-06-24)

### Bug Fixes

* delta deploy doesn't uses binary compare for certain meta.xml files causing it to incorrectly mark objects as changed ([ad3b757](https://github.com/Codeneos/vlocode/commit/ad3b757eb504bc8cfaee733ebb6eb44190d15ae4))

* only consider extra properties of installed package when versions match ([53f1988](https://github.com/Codeneos/vlocode/commit/53f19881cc78d80fafdc1c1be1ab9d4dae801b31))

### Features

* add support for removing components from metadata package ([789eeee](https://github.com/Codeneos/vlocode/commit/789eeee9c547fd8372a9a9316656d57af19e4f9b))

* skip deploy installed package if newer is installed in org ([0a8a26c](https://github.com/Codeneos/vlocode/commit/0a8a26c5680f159aa1bb3e379178e31950c8cdff))

## [1.24.7](https://github.com/Codeneos/vlocode/compare/v1.24.6...v1.24.7) (2024-06-21)

### Bug Fixes

* instance URL changes during token refresh do not update transport layer URL ([00e649a](https://github.com/Codeneos/vlocode/commit/00e649a092dc0677e5eab1731e96ac613265b3d0))

* OAuath2 incorrect URLs causes token refresh errors ([ab96a3d](https://github.com/Codeneos/vlocode/commit/ab96a3d94f5685e3588c8eed3e864959f3c9f32b))

* remove scopes from introspect request ([a35cddb](https://github.com/Codeneos/vlocode/commit/a35cddbaef23def3a29dfd480ac8cd2ef9a0435a))

## [1.24.6](https://github.com/Codeneos/vlocode/compare/v1.24.5...v1.24.6) (2024-06-12)

### Bug Fixes

* once method not overloaded with proper event types for bulk job V2 ([458b1e9](https://github.com/Codeneos/vlocode/commit/458b1e9873beb64704968bcd432912dee5345bbc))

* stack overflow when loading more then 3 million records due to array spreading ([75dba0a](https://github.com/Codeneos/vlocode/commit/75dba0a46273fb13ad544952b4bd3c0e4c721b81))

## [1.24.5](https://github.com/Codeneos/vlocode/compare/v1.24.4...v1.24.5) (2024-06-12)

### Features

* improve bulk API v2 client with event emitters and record count aggregation ([1994486](https://github.com/Codeneos/vlocode/commit/1994486818e7da77fe98d8d2badf9ea637f248ba))

## [1.24.4](https://github.com/Codeneos/vlocode/compare/v1.24.3...v1.24.4) (2024-05-27)

**Note:** Version bump only for package @vlocode/salesforce

## [1.24.3](https://github.com/Codeneos/vlocode/compare/v1.24.2...v1.24.3) (2024-05-27)

**Note:** Version bump only for package @vlocode/salesforce

## [1.24.2](https://github.com/Codeneos/vlocode/compare/v1.24.1...v1.24.2) (2024-05-27)

### Bug Fixes

* deployments incorrectly match 1 record records ([374461d](https://github.com/Codeneos/vlocode/commit/374461d755218da1a25b5c5e1aae440bc22c6ae3))

# [1.24.0](https://github.com/Codeneos/vlocode/compare/v1.23.0...v1.24.0) (2024-05-09)

### Features

* improve support for datapack deployment in strict mode with circular datapack references ([fce234d](https://github.com/Codeneos/vlocode/commit/fce234d4da2ca3bc7880c83d2e30110348b4bc2b))

# [1.23.0](https://github.com/Codeneos/vlocode/compare/v1.22.2...v1.23.0) (2024-04-29)

### Bug Fixes

* batch service does not correctly include properties to report batch status ([e331d01](https://github.com/Codeneos/vlocode/commit/e331d014b2fac1318dd45d15e925cfa014710532))

* on certain rare SF errors metadata deployment errors would not be caught expiring the promise ([a473b26](https://github.com/Codeneos/vlocode/commit/a473b26aa84c5f67b6c6fa20b70c6fc31ae1f9b0))

### Features

* improve handling of connection errors ([758de02](https://github.com/Codeneos/vlocode/commit/758de02856e484914d5f207d82ff8033bb585a24))

* suppress cascade failure reporting during deployment ([6fe07d2](https://github.com/Codeneos/vlocode/commit/6fe07d25e4749917c59458d2f0a7c5794ef62eec))

# [1.22.0](https://github.com/Codeneos/vlocode/compare/v0.21.7...v1.22.0) (2024-03-27)

**Note:** Version bump only for package @vlocode/salesforce

## [0.21.7](https://github.com/Codeneos/vlocode/compare/v0.21.6...v0.21.7) (2024-03-12)

### Features

* avoid logging duplicate "Dependent class is invalid" errors ([0ce1d12](https://github.com/Codeneos/vlocode/commit/0ce1d12c5457a41bac5e5442f7fbb29bee192df4))

## [0.21.6](https://github.com/Codeneos/vlocode/compare/v0.21.5...v0.21.6) (2024-02-15)

### Bug Fixes

* view-in-org command does not work for most metadata types ([d892590](https://github.com/Codeneos/vlocode/commit/d89259046161e0a37a83ae70d0c3b254f3a14732))

### Features

* use shared agent and for all SF connections for more efficient socket pooling Increase timeout values so that larger deploy requests using POST REST do not cause a timeout, allow changing and overwriting the shared agent to increase socket pool or strategy ([a2961ff](https://github.com/Codeneos/vlocode/commit/a2961ff9bb34fea78c7959b2fe60d072166c7ed1))

## [0.21.5](https://github.com/Codeneos/vlocode/compare/v0.21.4...v0.21.5) (2024-01-25)

### Bug Fixes

* test coverage lens shows "NaN%" ([67e229d](https://github.com/Codeneos/vlocode/commit/67e229da792574380c6dd5c262644fcda8e5fdb9))

## [0.21.3](https://github.com/Codeneos/vlocode/compare/v0.21.2...v0.21.3) (2024-01-23)

### Features

* option for showing test coverage in VSCode using lens ([eb90406](https://github.com/Codeneos/vlocode/commit/eb9040601ab551168881683488ce86564a80e20f))

## [0.21.2](https://github.com/Codeneos/vlocode/compare/v0.21.1...v0.21.2) (2024-01-22)

### Bug Fixes

* metadata folder types get packaged incorrectly ([e2ac4f6](https://github.com/Codeneos/vlocode/commit/e2ac4f649ebe9aac6243bcf3d64d5a17700b5111))

## [0.21.1](https://github.com/Codeneos/vlocode/compare/v0.21.0...v0.21.1) (2024-01-08)

### Bug Fixes

* bulk jobs incorrectly set LineEnding to CRLF instead of LF when not defined ([3703f65](https://github.com/Codeneos/vlocode/commit/3703f657cc6f171e26674659d3bb1c90bf951a57))

* ingest job doesn't properly validate `chunkDataSize` causing it to exceeds the API limit ([074dfe2](https://github.com/Codeneos/vlocode/commit/074dfe2e7e7a0f2f6e5af7bc79e585a7c610eaf8))

# [0.21.0](https://github.com/Codeneos/vlocode/compare/v0.20.12...v0.21.0) (2023-12-22)

### Bug Fixes

* SF API version selection does not display latest org supported API versions ([7e7463d](https://github.com/Codeneos/vlocode/commit/7e7463d9909e4f14fb6aa7ecea5a1a92bac0a192))

### Features

* enhance org selection and displaying all more org details ([cfab40e](https://github.com/Codeneos/vlocode/commit/cfab40e7a81c482947d793f9dcf5d92cec43ec5e))

## [0.20.12](https://github.com/Codeneos/vlocode/compare/v0.20.11...v0.20.12) (2023-12-15)

### Features

* update bulk API v2 ingest job to support large imports (100mb+) ([c6846bb](https://github.com/Codeneos/vlocode/commit/c6846bb0f150cebb56be80657ca5491118b1b01d))

## [0.20.11](https://github.com/Codeneos/vlocode/compare/v0.20.10...v0.20.11) (2023-12-14)

### Bug Fixes

* `IngestJobInfo.getFailedRecords` returns wrong type ([2a27930](https://github.com/Codeneos/vlocode/commit/2a2793080649869d38510a2b77fe8d4b2de86d08))

* uploadData logs results of `put` to debug console ([3bf8942](https://github.com/Codeneos/vlocode/commit/3bf89428bd820ff0a87470e9a22ca1ef4c4cde10))

## [0.20.10](https://github.com/Codeneos/vlocode/compare/v0.20.9...v0.20.10) (2023-12-03)

**Note:** Version bump only for package @vlocode/salesforce

## [0.20.8](https://github.com/Codeneos/vlocode/compare/v0.20.7...v0.20.8) (2023-10-18)

### Bug Fixes

* V2 bulk job ctor fails when compiled with ES2019 ([46a1276](https://github.com/Codeneos/vlocode/commit/46a1276bb02a16d2aa91e2fa4e2c8f7ae27dc829))

## [0.20.7](https://github.com/Codeneos/vlocode/compare/v0.20.6...v0.20.7) (2023-09-29)

**Note:** Version bump only for package @vlocode/salesforce

## [0.20.6](https://github.com/Codeneos/vlocode/compare/v0.20.5...v0.20.6) (2023-09-25)

### Bug Fixes

* `RecordFactory.useRecordProxy` static is incorrectly marked as readonly ([9efb07f](https://github.com/Codeneos/vlocode/commit/9efb07f39240d71ab8ca758d995b78c0d9648869))

## [0.20.5](https://github.com/Codeneos/vlocode/compare/v0.20.4...v0.20.5) (2023-09-06)

### Bug Fixes

* CustomObjectTranslations are not deployable ([3dbd9ed](https://github.com/Codeneos/vlocode/commit/3dbd9ed2b0c74221e44fcbb4e627ea9b0cfdcc6b))

* deployment command does not clear errors after they are resolved and fails to save source files before starting a deployment ([02b75c7](https://github.com/Codeneos/vlocode/commit/02b75c7c031cb8db48dde575171957051e027c62))

* destructive changes are not added during delta deployment ([898fe76](https://github.com/Codeneos/vlocode/commit/898fe76184e1c751a9e8a25202ba25c531b61114))

* unaddressed child metadata child does not include parent ([1deb30a](https://github.com/Codeneos/vlocode/commit/1deb30a856e5650c26d980b9d12f598ab8ee4d8d))

### Features

* improve detection differences by ignoring extra properties in metadata files retrieved from org ([44b7332](https://github.com/Codeneos/vlocode/commit/44b733223458f0088286870a606b386589b05641))

## [0.20.3](https://github.com/Codeneos/vlocode/compare/v0.20.2...v0.20.3) (2023-08-24)

### Bug Fixes

* XML-like metadata header does not deploy ([016cd9d](https://github.com/Codeneos/vlocode/commit/016cd9d54f373141203f62c31b26d5d50d1bf3ae))

## [0.20.2](https://github.com/Codeneos/vlocode/compare/v0.20.1...v0.20.2) (2023-08-23)

### Bug Fixes

* delta deploy strategy does not correctly fallback to default comparison when attempting XML compare on none XML file ([d17cf6e](https://github.com/Codeneos/vlocode/commit/d17cf6e557e8d6b7d952d88f14379641698c8c06))

### Features

* when doing a delta deploy do mark a component as changed when the managed package version is missing from the Class meta file ([f9c8cf3](https://github.com/Codeneos/vlocode/commit/f9c8cf3f0b3f48ccbb409ec6bb51d37162f6285b))

## [0.20.1](https://github.com/Codeneos/vlocode/compare/v0.20.1-next.0...v0.20.1) (2023-08-23)

**Note:** Version bump only for package @vlocode/salesforce

## [0.20.1-next.0](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.1...v0.20.1-next.0) (2023-08-20)

### Bug Fixes

* decomposed metadata fragments do are not deploy without a parent ([a2e187c](https://github.com/Codeneos/vlocode/commit/a2e187cd0bd451dc4c71ce6023ff8c52d7148d3f))

### Features

* add deploy difference command which only pushes changed metadata files to the org ([ed21dad](https://github.com/Codeneos/vlocode/commit/ed21dad82f93f822ddb6f6c72d397cd35b15a36e))

* determining the differences between the deployed and retrieved data used to depend on the order of the elements in the XML; now the order is only considered relevant for layouts and flexipages which use the order of the elements in the XML as order of the elements on the screen. ([0dd7048](https://github.com/Codeneos/vlocode/commit/0dd70482e36b9e70e19c75c8ff0a30dbd8572ebe))

* improve build system and reduce load time of extension on startup by 40% ([692de00](https://github.com/Codeneos/vlocode/commit/692de003c677516ed13064fb4d7011be2f090225))

# [0.20.0-alpha.1](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.0...v0.20.0-alpha.1) (2023-08-14)

**Note:** Version bump only for package @vlocode/salesforce

# [0.20.0-alpha.0](https://github.com/Codeneos/vlocode/compare/v0.19.21...v0.20.0-alpha.0) (2023-08-12)

### Bug Fixes

* access token is not updated on refresh on SFDX store due to syntax mismatch ([a017ad6](https://github.com/Codeneos/vlocode/commit/a017ad6cc940e61f7a3e9252f527a3ceca2d56ab))

* error code not mapped correctly in transport layer ([9cf22f0](https://github.com/Codeneos/vlocode/commit/9cf22f03816866383db146a8edb12c2004a32d46))

* open in org does not work for Vlocity Cards without a version ([738b2c9](https://github.com/Codeneos/vlocode/commit/738b2c9a3006a5615071272d6ee5680af28324e7))

* retrieve metadata command does work ([4e57901](https://github.com/Codeneos/vlocode/commit/4e57901898fdc254c6bfbcbcd309e4dfa046987b))

* support thenCall on promise returned by request for backward compatibility ([9cd3afc](https://github.com/Codeneos/vlocode/commit/9cd3afcd3ff761dabef38a5578f92bad88a33583))

* when trace flags are remove outside of VSCode an error is thrown during trace flags refresh ([6cd7abc](https://github.com/Codeneos/vlocode/commit/6cd7abcc2b952e5c7a0295049d6c3e223124e341))

### Features

* report progress when deploying datapacks in direct deploy mode for datapacks ([3890ec1](https://github.com/Codeneos/vlocode/commit/3890ec19d2514820502efc013fb4fc45f8d8b5bc))

* support instances of delta strategy ([414e328](https://github.com/Codeneos/vlocode/commit/414e328eaf3c3c01162975a692c9e3f1a4882e8d))

* support new metadata types for deployment ([f5a7139](https://github.com/Codeneos/vlocode/commit/f5a7139b30e4bd43d2d2423150c41eb6ed38429e))

## [0.19.21](https://github.com/Codeneos/vlocode/compare/v0.19.20...v0.19.21) (2023-08-02)

### Bug Fixes

* HTTP transport does not handle timeout properly ([ac36631](https://github.com/Codeneos/vlocode/commit/ac3663147e105d1bdb2efa6e55b280fffec217cb))

### Features

* handle expired refresh tokens properly and reset the connection when the Access token updates; should also address issues [#405](https://github.com/Codeneos/vlocode/issues/405) and [#401](https://github.com/Codeneos/vlocode/issues/401) ([f3184c3](https://github.com/Codeneos/vlocode/commit/f3184c3961dfc627921f2f4d9db699c075be751a))

* re-implement OAuth2 authentication ([a344767](https://github.com/Codeneos/vlocode/commit/a344767d341641c10b2e6964a9193a812db714f4))

## [0.19.20](https://github.com/Codeneos/vlocode/compare/v0.19.19...v0.19.20) (2023-08-01)

### Bug Fixes

* XML metadata with boolean attributes is not deployed correctly ([7389674](https://github.com/Codeneos/vlocode/commit/738967418225ff1abcd02cedebb88fc611bbd66b))

## [0.19.19](https://github.com/Codeneos/vlocode/compare/v0.19.18...v0.19.19) (2023-07-30)

### Features

* report invalid matching key configuration and fail deployment when trying to update the same record twice in the same batch ([c0c0031](https://github.com/Codeneos/vlocode/commit/c0c00316ed56312a4d9b5fda57256ec5fa620391))

## [0.19.18](https://github.com/Codeneos/vlocode/compare/v0.19.17...v0.19.18) (2023-07-27)

### Bug Fixes

* destructive changes do not get added to deployment package ([5bf3603](https://github.com/Codeneos/vlocode/commit/5bf3603a6fe8f47da3091c99cd2ac153e1d40593))

## [0.19.17](https://github.com/Codeneos/vlocode/compare/v0.19.16...v0.19.17) (2023-07-26)

**Note:** Version bump only for package @vlocode/salesforce

## [0.19.16](https://github.com/Codeneos/vlocode/compare/v0.19.15...v0.19.16) (2023-07-25)

### Bug Fixes

* getTestClasses doesn't return test classes due to new data structure of Salesforce package ([db526dc](https://github.com/Codeneos/vlocode/commit/db526dc6080dbceae9ca5f7a1f98dd2649deedf2))

* recordBatch is verbose about it's actions when logging level is set to info ([f77b887](https://github.com/Codeneos/vlocode/commit/f77b887be925221c46241bd1dfa300c8a72d4e94))

### Features

* support LWC geneation ([5f0107e](https://github.com/Codeneos/vlocode/commit/5f0107e6fe4e002809ee3b43245fff5ce7f8e6fe))

* update output type for extension to es2022 modules ([75fbca5](https://github.com/Codeneos/vlocode/commit/75fbca5370f912ef21d2035d0cef196ce0340aec))

* update to typescript to version 5 and update required dependencies to match ([ccbda5c](https://github.com/Codeneos/vlocode/commit/ccbda5c228850fc91e7c605de30c202178ef55da))

* upgrade XML functions to use FXPv4 ([63c0ba9](https://github.com/Codeneos/vlocode/commit/63c0ba91989e7a87fbad5b64ee40c6672260509d))

## [0.19.15](https://github.com/Codeneos/vlocode/compare/v0.19.14...v0.19.15) (2023-07-12)

### Features

* support more specific filtering in the batch service to limit the jobs picked up ([acfc3e9](https://github.com/Codeneos/vlocode/commit/acfc3e96a8ff8f5605af213652ce57fc2041fe3f))

## [0.19.14](https://github.com/Codeneos/vlocode/compare/v0.19.13...v0.19.14) (2023-07-10)

### Bug Fixes

* "add to profile" command command does not work properly ([2e27e1e](https://github.com/Codeneos/vlocode/commit/2e27e1e55f46b807b9bb8545c1135715e5d18c77))

* HTTP Transport should not log features at info log level ([a58f779](https://github.com/Codeneos/vlocode/commit/a58f779380b788e1708722fd68e5dffa3343ebd9))

* refresh token is updated twice on due to double refresh event being emitted ([0eefe60](https://github.com/Codeneos/vlocode/commit/0eefe60c7a8a38f1b6e13e077610b4715d7f6029))

* unable to use openInOrg on MDT fields profiles, roles and certain custom fields. ([75c3060](https://github.com/Codeneos/vlocode/commit/75c3060b28651319c443456880fbbe37a6402369))

## [0.19.13](https://github.com/Codeneos/vlocode/compare/v0.19.12...v0.19.13) (2023-07-05)

**Note:** Version bump only for package @vlocode/salesforce

## [0.19.12](https://github.com/Codeneos/vlocode/compare/v0.19.10...v0.19.12) (2023-07-04)

### Bug Fixes

* soap client does not log due to null logger being used ([4f0f5f4](https://github.com/Codeneos/vlocode/commit/4f0f5f4987cf030f76e86a933c9844ed83b18545))

* support `getDeltaPackage` with out having to create the strategy from the container, instead the builder will create the strategy ([5fbc313](https://github.com/Codeneos/vlocode/commit/5fbc313ad36b8979280db860841fbeb2880a3904))

### Features

* add package builder logging to understand why some data is marked as changed ([8dc215b](https://github.com/Codeneos/vlocode/commit/8dc215bd397704ca94333b745f598959f50cb273))

* support creation of PackageManifest from XML ([779df29](https://github.com/Codeneos/vlocode/commit/779df29bb6e6c4f7fa77c9ab4208080920ca9ca0))

* support detecting changed in object metadata when using retrieve strategy ([a31d170](https://github.com/Codeneos/vlocode/commit/a31d170757108ce76ff7ff7344eff704a294420a))

## [0.19.11](https://github.com/Codeneos/vlocode/compare/v0.19.10...v0.19.11) (2023-06-27)

### Bug Fixes

* soap client does not log due to null logger being used ([3b69d7d](https://github.com/Codeneos/vlocode/commit/3b69d7d5af65be0ace2620676d84a0046295a0a6))

### Features

* add package builder logging to understand why some data is marked as changed ([7e0eddb](https://github.com/Codeneos/vlocode/commit/7e0eddbe136482f81dfb0d077428fe2a7f5fee28))

* support creation of PackageManifest from XML ([eaf7830](https://github.com/Codeneos/vlocode/commit/eaf7830b4b69b954bf1fb7229d913be03ac8a3d5))

* support detecting changed in object metadata when using retrieve strategy ([87aa5d4](https://github.com/Codeneos/vlocode/commit/87aa5d42de4545c28ef7e8ed70b7247018ad8781))

## [0.19.10](https://github.com/Codeneos/vlocode/compare/v0.19.9...v0.19.10) (2023-06-21)

### Bug Fixes

* issues with parsing destructive changes containing a single component ([3dbe9b3](https://github.com/Codeneos/vlocode/commit/3dbe9b320713dbd27179021956ffc2bc67e5b375))

### Features

* support deploying of destructive changes to an org ([d229035](https://github.com/Codeneos/vlocode/commit/d229035f2cf9a5eaabaaa4771d5abfa17c83ac6d))

## [0.19.9](https://github.com/Codeneos/vlocode/compare/v0.19.8...v0.19.9) (2023-06-21)

### Bug Fixes

* do not cause deployment loop when changing the same metadata then t=what is being deployed ([f1fa238](https://github.com/Codeneos/vlocode/commit/f1fa238435d79901bbb7f3fc5647e0bd6a208619))

* metadata API read command can return undefined records when there are no records matching the full names ([236912a](https://github.com/Codeneos/vlocode/commit/236912a933309da6150fbde073ee6ebf3bf5088f))

* queryService.test.ts test fails due to DST adjustments ([fe729ca](https://github.com/Codeneos/vlocode/commit/fe729caea3c17969ea30f0339294c2f05dbf8f1c))

* when deploying a Product2 datapack for the first time a duplicate Root PCI record is created when running with triggers enabled ([3461618](https://github.com/Codeneos/vlocode/commit/346161840c89e9baa10369b511d22a1a6c47c3fe))

## [0.19.8](https://github.com/Codeneos/vlocode/compare/v0.19.7...v0.19.8) (2023-05-08)

### Bug Fixes

* lookup service fails when looking objects with date-time values stored as Date like object ([e0c6828](https://github.com/Codeneos/vlocode/commit/e0c6828233d896c4027268272fa1407335113d11))

### Features

* improve consistency of `formatFieldValue` for queryService to better handle date and number types ([f27e913](https://github.com/Codeneos/vlocode/commit/f27e91323ca4068ea748a06088114924fd9227e7))

## [0.19.7](https://github.com/Codeneos/vlocode/compare/v0.19.6...v0.19.7) (2023-04-25)

**Note:** Version bump only for package @vlocode/salesforce

## [0.19.3](https://github.com/Codeneos/vlocode/compare/v0.19.2...v0.19.3) (2023-04-17)

### Bug Fixes

* disable verbose logging of HTTP transport class ([09c8e0b](https://github.com/Codeneos/vlocode/commit/09c8e0bfc4e86275d5b0cd14d5dce286562734b1))

* update xml2js 0.5.0 to address CVE-2023-0842 ([85bda4e](https://github.com/Codeneos/vlocode/commit/85bda4ee84fdeba2d9f35243eb245ae65986544e))

## [0.19.2](https://github.com/Codeneos/vlocode/compare/v0.19.1...v0.19.2) (2023-04-04)

**Note:** Version bump only for package @vlocode/salesforce

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
