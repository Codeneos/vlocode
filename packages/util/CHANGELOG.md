# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.13](https://github.com/Codeneos/vlocode/compare/v0.19.12...v0.19.13) (2023-07-05)

**Note:** Version bump only for package @vlocode/util

## [0.19.12](https://github.com/Codeneos/vlocode/compare/v0.19.10...v0.19.12) (2023-07-04)

### Features

* add forEach function to iterable ([ffc6bed](https://github.com/Codeneos/vlocode/commit/ffc6bed9bf552056e36f3457e748412ef1a5719a))
* add XML text range and node utility functions ([ee80736](https://github.com/Codeneos/vlocode/commit/ee80736f3c9855c81f19bfb7d0666b4694c43a1f))
* added new dedicated ignore case string compare ([822eb02](https://github.com/Codeneos/vlocode/commit/822eb020ce62ca7a55f13849bf14675a402b1036))
* extend object comparison to allow comparing of objects with unequal array element order. ([46a24c7](https://github.com/Codeneos/vlocode/commit/46a24c77193a522ed687a789f532df4d1379948a))
* support detecting changed in object metadata when using retrieve strategy ([a31d170](https://github.com/Codeneos/vlocode/commit/a31d170757108ce76ff7ff7344eff704a294420a))

## [0.19.11](https://github.com/Codeneos/vlocode/compare/v0.19.10...v0.19.11) (2023-06-27)

### Features

* add forEach function to iterable ([b7cc28c](https://github.com/Codeneos/vlocode/commit/b7cc28c5da9cf6680abdfadf6b96e14fd93ac388))
* added new dedicated ignore case string compare ([f84ecf0](https://github.com/Codeneos/vlocode/commit/f84ecf04042be6d10927b263125d3fb214a0948c))
* extend object comparison to allow comparing of objects with unequal array element order. ([d28f898](https://github.com/Codeneos/vlocode/commit/d28f898fd6dcae70b169651d5dd0b3bf570a657b))
* support detecting changed in object metadata when using retrieve strategy ([87aa5d4](https://github.com/Codeneos/vlocode/commit/87aa5d42de4545c28ef7e8ed70b7247018ad8781))

## [0.19.10](https://github.com/Codeneos/vlocode/compare/v0.19.9...v0.19.10) (2023-06-21)

### Bug Fixes

* issues with parsing destructive changes containing a single component ([3dbe9b3](https://github.com/Codeneos/vlocode/commit/3dbe9b320713dbd27179021956ffc2bc67e5b375))

## [0.19.9](https://github.com/Codeneos/vlocode/compare/v0.19.8...v0.19.9) (2023-06-21)

### Bug Fixes

* deepClone does not clone date objects as they are immutable ([e133380](https://github.com/Codeneos/vlocode/commit/e1333802c24f4f4f880a8bcf6553601536acad4a))

## [0.19.8](https://github.com/Codeneos/vlocode/compare/v0.19.7...v0.19.8) (2023-05-08)

### Bug Fixes

* improve performance of fs code ([0e8aeb9](https://github.com/Codeneos/vlocode/commit/0e8aeb918439a3fea5cfefce94700cf59970fe92))

## [0.19.7](https://github.com/Codeneos/vlocode/compare/v0.19.6...v0.19.7) (2023-04-25)

**Note:** Version bump only for package @vlocode/util

## [0.19.3](https://github.com/Codeneos/vlocode/compare/v0.19.2...v0.19.3) (2023-04-17)

### Bug Fixes

* binary data (docx etc) not properly exposed in proxy ([e7afe72](https://github.com/Codeneos/vlocode/commit/e7afe72172899ed006e60d8679ee2554287cd600))

## [0.19.2](https://github.com/Codeneos/vlocode/compare/v0.19.1...v0.19.2) (2023-04-04)

**Note:** Version bump only for package @vlocode/util

## [0.19.1](https://github.com/Codeneos/vlocode/compare/v0.18.18...v0.19.1) (2023-04-03)

### Bug Fixes

* add unit test for proxy transformer ([4a3d1c9](https://github.com/Codeneos/vlocode/commit/4a3d1c91b2773a02d3f3483e870458ae937cba5a))
* calculateHash does incorrectly references `this` from a static context ([0575fd3](https://github.com/Codeneos/vlocode/commit/0575fd36bdb190010e5346bc5bd4d667562c96f1))
* drop `uuid` package in favor of browser and node native `randomUUID` from `node:ctypto` ([78e954c](https://github.com/Codeneos/vlocode/commit/78e954c8cac5773962f76ea42827ab0475231ad9))
* fix several script generation errors ([eff0ef0](https://github.com/Codeneos/vlocode/commit/eff0ef01e4fc72ff2917f5250e9b879ee8f437ca))
* getErrorMessage does not use defaults when set ([00868ec](https://github.com/Codeneos/vlocode/commit/00868ecbc8be149232a6afc06f63577a6f00f5db))
* lookup service does not report script name/id in lookup error ([8021d97](https://github.com/Codeneos/vlocode/commit/8021d97094b3d3f89c22f19928f5dc552345882f))
* mapGetOrCreate does not play nice with sync-initializers ([d06d5cf](https://github.com/Codeneos/vlocode/commit/d06d5cfb52fdcb3ce3901ff06ad6408d8f79f9f4))
* normalizeSalesforceName transforms uppercase acronyms to `xML` instead of `xml` ([8f3df44](https://github.com/Codeneos/vlocode/commit/8f3df44f8e55bab1a82c93ba1fbc80b1b479d443))
* transform proxy does not transform array methods properly ([e7be106](https://github.com/Codeneos/vlocode/commit/e7be1064c77f93fc0806a9607354ca094693adec))

### Features

* add new mapBy function to easily map arrays by key ([23083b6](https://github.com/Codeneos/vlocode/commit/23083b683253fb4ab73a20c830b1438f08408878))
* change getErrorMessage signature to accept options and allow default options to be set easily ([f1e8d46](https://github.com/Codeneos/vlocode/commit/f1e8d46132403672c3b3c87ed0bb39106a2c34bf))
* introduce new uniform query API for data and tooling objects; update query service to use new query API. ([775ca10](https://github.com/Codeneos/vlocode/commit/775ca100f41cc72c73387f1b46da3681831a72b3))
* open LWC OmniScripts in LWC editor and classic in Angular designer ([e016d3f](https://github.com/Codeneos/vlocode/commit/e016d3f45ad1ec7ef218ce37d52bc879961c2f8e))
* support local OmniScript definition generation instead of using remote APEX. This speeds up OmniScript activation and avoids govern limit issue when activating large scripts. ([5bbd304](https://github.com/Codeneos/vlocode/commit/5bbd30462101d0918de34dfed7badee88d5e2dd9))
* update calculateHash to also work on strings for convenience ([b5fd2c1](https://github.com/Codeneos/vlocode/commit/b5fd2c1e4e089cf9b63dce40286214f3e7785632))

## [0.18.17](https://github.com/Codeneos/vlocode/compare/v0.18.16...v0.18.17) (2023-02-23)

### Bug Fixes

* ensure xsi:type is set for all metadata operations ([1a63abb](https://github.com/Codeneos/vlocode/commit/1a63abbd8b237b610c7055f58ce7cf7c82542c9e))

## [0.18.16](https://github.com/Codeneos/vlocode/compare/v0.18.15...v0.18.16) (2023-02-20)

### Features

* add chunkArray and chunkAsyncParallel helper functions to chunk work into smaller chunks and process the chunks in parallel ([3f13eab](https://github.com/Codeneos/vlocode/commit/3f13eabe304415eb6cf8f036a5819ddb8d06ac8d))

## [0.18.15](https://github.com/Codeneos/vlocode/compare/v0.18.14...v0.18.15) (2023-02-20)

### Bug Fixes

* do not ignore SFDX entries without an orgId; derive orgId from access token instead ([44baded](https://github.com/Codeneos/vlocode/commit/44baded238999881ebc41075407eae0311cc6bc4))

## [0.18.14](https://github.com/Codeneos/vlocode/compare/v0.18.13...v0.18.14) (2023-02-14)

### Bug Fixes

* getRootTagName also detects root tags in files that have XML like strings ([4dcbd72](https://github.com/Codeneos/vlocode/commit/4dcbd72eb2871244cb1917d79bf0ef184cabbcbe))

## [0.18.13](https://github.com/Codeneos/vlocode/compare/v0.18.12...v0.18.13) (2023-02-14)

### Bug Fixes

* updateAccessToken stores updated access tokens under alias instead of under username ([7410ed4](https://github.com/Codeneos/vlocode/commit/7410ed4844c66fa3edf219c11e3bd082b350433a))
* visitObject does not visit properties that have object values ([a140204](https://github.com/Codeneos/vlocode/commit/a14020413a8d7076298a43ad15d561feb3bada44))
* xml type nill is not parsed as null value ([6617c88](https://github.com/Codeneos/vlocode/commit/6617c8840f2fd3d5b545c76c08a045a3bf9912b7))

### Features

* implement support bulk API 2.0 ([cd0c346](https://github.com/Codeneos/vlocode/commit/cd0c3461c4915397c2fef18aed57e84c3113a8c9))

## [0.18.12](https://github.com/Codeneos/vlocode/compare/v0.18.11...v0.18.12) (2023-01-27)

**Note:** Version bump only for package @vlocode/util

## [0.18.11](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.11) (2023-01-26)

### Bug Fixes

* avoid sfdx.log file locks by disabling file logging for the SFDX root logger ([c799ca9](https://github.com/Codeneos/vlocode/commit/c799ca96c7a404d31af9cef0b0fc9aee57b86532))

## [0.18.10](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.10) (2023-01-25)

### Bug Fixes

* avoid sfdx.log file locks by disabling file logging for the SFDX root logger ([c799ca9](https://github.com/Codeneos/vlocode/commit/c799ca96c7a404d31af9cef0b0fc9aee57b86532))

**Note:** Version bump only for package @vlocode/util

## [0.18.8](https://github.com/Codeneos/vlocode/compare/v0.18.7...v0.18.8) (2023-01-25)

### Features

* improve custom transport so it can be used with OAuth flow and stores refreshed tokens in SFDX to avoid refreshing tokens every time vlocode connects to a SFDX org with an outdated access token ([7bd75e5](https://github.com/Codeneos/vlocode/commit/7bd75e582f5cf196b1d32272ab5c1d3bba81d283))
* support refreshing OAuth tokens and prefilling the username on the refresh tokens action ([b31a419](https://github.com/Codeneos/vlocode/commit/b31a4198044a4dd701adbe0aacdb15c157af75f8))

## [0.18.7](https://github.com/Codeneos/vlocode/compare/v0.18.6...v0.18.7) (2023-01-24)

### Bug Fixes

* deferred promise does not allow resolving with a promise ([e3d670b](https://github.com/Codeneos/vlocode/commit/e3d670b94db268bb5f04c722c2d09a8ca6b9fa9c))

### Features

* ensure correct deployment order for Vlocity cards ([7758438](https://github.com/Codeneos/vlocode/commit/77584386c74375fa870bfa83a4f2acb43937a04c))

## [0.18.6](https://github.com/Codeneos/vlocode/compare/v0.18.5...v0.18.6) (2022-12-12)

**Note:** Version bump only for package @vlocode/util

## [0.18.3](https://github.com/Codeneos/vlocode/compare/v0.18.2...v0.18.3) (2022-11-22)

### Features

* add support for purging object field maps before new-ones are deployed ([48f327c](https://github.com/Codeneos/vlocode/commit/48f327c08b846219e3cc79459404cf9b1c0facba))

## [0.18.2](https://github.com/Codeneos/vlocode/compare/v0.18.1...v0.18.2) (2022-11-22)

### Bug Fixes

* do not bundle @salesforce/core in util library ([4d0cbc4](https://github.com/Codeneos/vlocode/commit/4d0cbc4a63284aa579d2fbd909c6cac9ccd8cfdc))

## [0.18.1](https://github.com/Codeneos/vlocode/compare/v0.18.0...v0.18.1) (2022-11-21)

**Note:** Version bump only for package @vlocode/util

# [0.18.0](https://github.com/Codeneos/vlocode/compare/v0.17.12...v0.18.0) (2022-11-21)

### Bug Fixes

* do not mark string as iterable to avoid unintended behavior. ([db32e48](https://github.com/Codeneos/vlocode/commit/db32e48be0027203a52b44c0cd1683ec73d5e480))
* improve groupBy and mapGetOrCreate types ([24ff881](https://github.com/Codeneos/vlocode/commit/24ff881f196f241069a3921ee2e734954278d582))
* lazy does not properly return type of initializer ([f960e08](https://github.com/Codeneos/vlocode/commit/f960e08040b124a2ef8e2a535499d9490af7dacf))
* vlocode can hang during initialization or org-switching ([7c95c2c](https://github.com/Codeneos/vlocode/commit/7c95c2c6259e94e8c951e9f069473ddf8ad94fea))

### Features

* add objectEquals utility method for comparing objects ([819c97f](https://github.com/Codeneos/vlocode/commit/819c97fbae04bab3febf6b9ae512bfc7eb2a9251))
* do not use sfdx connection and upgrade to @salesforce/core@3 ([be6add4](https://github.com/Codeneos/vlocode/commit/be6add401f29131e4769feb8f9b7a59787285edf))
* improve support for cancellation signaling during datapack deploymen ([e356132](https://github.com/Codeneos/vlocode/commit/e3561320f48c2b22c3efd5361e1d13676380a929))
* store global cache as global and improve cache clear command ([ebd0e6d](https://github.com/Codeneos/vlocode/commit/ebd0e6dd62dad1c0301e56615ab97b9a2fa87f3e))
* support printing timer duration in multiple formats ([a010e9d](https://github.com/Codeneos/vlocode/commit/a010e9db35ba7775355063b60e07114c255822e6))
* update Vlocity datapack deployment hooks (specs) to allow them to run on record level and support for changing deployment action from a spec ([06b2500](https://github.com/Codeneos/vlocode/commit/06b25000ad47cdce83bd00468e5ecaabf8bba596))

## [0.17.9](https://github.com/Codeneos/vlocode/compare/v0.17.8...v0.17.9) (2022-09-29)

### Bug Fixes

* not using latest API version for SFDX ([42f703a](https://github.com/Codeneos/vlocode/commit/42f703a6200ff35ffc6924b7b1a3a75748f13ffe))

## [0.17.8](https://github.com/Codeneos/vlocode/compare/v0.17.7...v0.17.8) (2022-09-27)

**Note:** Version bump only for package @vlocode/util

## [0.17.7](https://github.com/Codeneos/vlocode/compare/v0.17.6...v0.17.7) (2022-09-27)

### Bug Fixes

* [@cache](https://github.com/cache) does not handle arrays and object-like parameters properly causing incorrect cached entries to be returned ([a2fcaea](https://github.com/Codeneos/vlocode/commit/a2fcaea57e8f1ce7e98c89752026060cc43b4a11))

### Features

* add object walk and set properties methods ([69dd5f8](https://github.com/Codeneos/vlocode/commit/69dd5f86ca3df0095c539f07b80994bfec3e26a7))
* integrate omniscript LWC compiler and activation ([8c5bfaf](https://github.com/Codeneos/vlocode/commit/8c5bfaf6755358275997376c9d83ee169be10986))

## [0.17.6](https://github.com/Codeneos/vlocode/compare/v0.17.5...v0.17.6) (2022-08-31)

### Features

* change poll to not return an error when the callback time's out and allow throwing a custom error message on rejection ([242f5d0](https://github.com/Codeneos/vlocode/commit/242f5d085e2dd8aa68b76b286776ab9eee2b82d1))

## [0.17.3](https://github.com/Codeneos/vlocode/compare/v0.17.2...v0.17.3) (2022-08-15)

**Note:** Version bump only for package @vlocode/util

## [0.17.2](https://github.com/Codeneos/vlocode/compare/v0.16.22...v0.17.2) (2022-08-12)

### Bug Fixes

* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([debeed8](https://github.com/Codeneos/vlocode/commit/debeed8db4df22764f228a07ffc4ca86b23d5a55))
* json files are not included NPM packages ([f67a75d](https://github.com/Codeneos/vlocode/commit/f67a75de03a008dd6f6825c948489f375c2ab35c))

## [0.17.1](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/Codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))

# [0.17.0](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.0) (2022-08-01)

### Bug Fixes

* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/Codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))

## [0.16.36](https://github.com/Codeneos/vlocode/compare/v0.16.35...v0.16.36) (2022-07-18)

**Note:** Version bump only for package @vlocode/util

## [0.16.35](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.35) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.34](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.34) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.33](https://github.com/Codeneos/vlocode/compare/v0.16.32...v0.16.33) (2022-07-14)

**Note:** Version bump only for package @vlocode/util

## [0.16.32](https://github.com/Codeneos/vlocode/compare/v0.16.31...v0.16.32) (2022-07-13)

**Note:** Version bump only for package @vlocode/util

## [0.16.31](https://github.com/Codeneos/vlocode/compare/v0.16.21...v0.16.31) (2022-07-13)

**Note:** Version bump only for package @vlocode/util
