# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
