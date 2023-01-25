# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
