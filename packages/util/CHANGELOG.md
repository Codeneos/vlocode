# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
