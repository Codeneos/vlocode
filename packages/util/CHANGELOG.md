# Change Log
## Vlocity/Salesforce Integration for VSCode

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.31.8](https://github.com/Codeneos/vlocode/compare/v1.31.7...v1.31.8) (2025-07-23)

### Bug Fixes

* vlocode doesn't update sf extension username ([aab9f12](https://github.com/Codeneos/vlocode/commit/aab9f12066371b3115686354d3e419e4129ea64e))

## [1.31.3](https://github.com/Codeneos/vlocode/compare/v1.31.2...v1.31.3) (2025-06-27)

### Features

* remove Salesforce username from VSCode configuration and use username from SFDX project file instead ([953ab28](https://github.com/Codeneos/vlocode/commit/953ab286d51fba07cfe55632d89d2306838341aa))

## [1.31.1](https://github.com/Codeneos/vlocode/compare/v1.31.0...v1.31.1) (2025-06-17)

### Bug Fixes

* inconsistent imports causing build errors in 1.31.0 ([db05d9a](https://github.com/Codeneos/vlocode/commit/db05d9a72fc73936023ed52685ee204dd5e5ad0d))

# [1.30.0](https://github.com/Codeneos/vlocode/compare/v1.29.5...v1.30.0) (2025-06-14)

### Bug Fixes

* improve type definition for ArrayElement to allow non-readonly arrays ([d317530](https://github.com/Codeneos/vlocode/commit/d317530eae772373f417429885d0599503c7e18c))

## [1.29.5](https://github.com/Codeneos/vlocode/compare/v1.29.4...v1.29.5) (2025-05-26)

**Note:** Version bump only for package @vlocode/util

## [1.29.4](https://github.com/Codeneos/vlocode/compare/v1.29.3...v1.29.4) (2025-05-26)

### Bug Fixes

* JSON files missing in NPM packages ([5f61f62](https://github.com/Codeneos/vlocode/commit/5f61f62d42e4d473f2eabfafdaced5748eb9afc6))

## [1.29.3](https://github.com/Codeneos/vlocode/compare/v1.29.2...v1.29.3) (2025-05-26)

### Bug Fixes

* revert ESM changes with ESBuild as ESBuild does not emit proper decorator data for use IoC framework ([a80f136](https://github.com/Codeneos/vlocode/commit/a80f13675e0fcb7e90bcccbfaedb089aeda07930))

## [1.29.2](https://github.com/Codeneos/vlocode/compare/v1.29.1...v1.29.2) (2025-05-26)

**Note:** Version bump only for package @vlocode/util

# [1.29.0](https://github.com/Codeneos/vlocode/compare/v1.28.2...v1.29.0) (2025-05-25)

### Features

* upgrade all packages to publish in ESM format as well as CommonJS ([5c77946](https://github.com/Codeneos/vlocode/commit/5c779467497cba0940b5a6934febe7f1b631edb8))

## [1.28.2](https://github.com/Codeneos/vlocode/compare/v1.28.1...v1.28.2) (2025-05-22)

### Features

* enhance XML string conversion options and deprecate global settings ([ac4d957](https://github.com/Codeneos/vlocode/commit/ac4d9574a9470dc7130ce5946b60168d2bb17a4b))

## [1.28.1](https://github.com/Codeneos/vlocode/compare/v1.28.0...v1.28.1) (2025-05-21)

**Note:** Version bump only for package @vlocode/util

# [1.28.0](https://github.com/Codeneos/vlocode/compare/v1.27.7...v1.28.0) (2025-05-21)

### Bug Fixes

* cast flattened array to correct type in flatten function ([ae03e6d](https://github.com/Codeneos/vlocode/commit/ae03e6deea7c0cc542238d5e1084b1efba8d93f9))

* update antlr4ng dependency versions and improve type definitions in icon path handling ([3bc215a](https://github.com/Codeneos/vlocode/commit/3bc215a3472984eb7ae65768b467c0739125db81))

### Features

* add AwaitableAsyncGenerator class for iterable and awaitable async generators ([a54df41](https://github.com/Codeneos/vlocode/commit/a54df41c7c5e06ec17fa093aceb5d71edec39987))

* add case-insensitive property access fn for target objects using a proxy ([bb9dffd](https://github.com/Codeneos/vlocode/commit/bb9dffdf8d6f1c6a34ea740734b3b4e8a6ae152a))

* add function to retrieve elements by tag name from XML string ([149da7b](https://github.com/Codeneos/vlocode/commit/149da7b3fd07465e6965c013ba72354460e0c9d6))

* add import multipack command to enhance datapack management ([e69ec9e](https://github.com/Codeneos/vlocode/commit/e69ec9e2210a885b210addf9aef6e6777a53913f))

* add substringBetween function to extract substring between specified needles ([ea2d924](https://github.com/Codeneos/vlocode/commit/ea2d924b14d33d3801296e0ad999e8e069a39e0c))

* add timeout function to wrap promises with a timeout mechanism ([a9d62c4](https://github.com/Codeneos/vlocode/commit/a9d62c4a370a28f5edbc334bb768b6b1a0cca61c))

* enhance pluralize function to handle object counts and improve pluralization logic ([d4b397b](https://github.com/Codeneos/vlocode/commit/d4b397b787476aadcf4db1c981c12267937ae38e))

* refactor query handling and enhance iterable operations in Salesforce connection and deployment services ([f3de249](https://github.com/Codeneos/vlocode/commit/f3de24973bd4c19dfdf41e5f3313289c95419d8e))

* support generation of LWCs from OmniStudio Datapacks without deploying ([fa4c421](https://github.com/Codeneos/vlocode/commit/fa4c421d1c95592c6a590ec8ad73a0257bf4d277))

## [1.27.5](https://github.com/Codeneos/vlocode/compare/v1.27.4...v1.27.5) (2024-09-02)

### Features

* add more flexible partition function to replace segregate ([f21eb2b](https://github.com/Codeneos/vlocode/commit/f21eb2b643927f0d4d47c58cd70494bd278c1c04))

# [1.27.0](https://github.com/Codeneos/vlocode/compare/v1.26.2...v1.27.0) (2024-08-21)

### Features

* add replacement token support to deployment package builder ([467c586](https://github.com/Codeneos/vlocode/commit/467c586d67f6ec3947fd80570ec0655cbfa777a9))

## [1.26.1](https://github.com/Codeneos/vlocode/compare/v1.26.0...v1.26.1) (2024-08-14)

**Note:** Version bump only for package @vlocode/util

# [1.26.0](https://github.com/Codeneos/vlocode/compare/v1.25.0...v1.26.0) (2024-08-13)

### Bug Fixes

* unit test for compare object to match new behavior ([d9687e9](https://github.com/Codeneos/vlocode/commit/d9687e92e0315627fcb1319ac4e50d3ebd081441))

* Update evalExpr function to allow undefined values in context ([d225281](https://github.com/Codeneos/vlocode/commit/d225281b7552afd1ca8205866836e2311bdf6373))

* Update objectEquals function to ignore extra elements in arrays ([25fecdb](https://github.com/Codeneos/vlocode/commit/25fecdbd19e4b877fea4c6d100b53fd4af76f75d))

# [1.25.0](https://github.com/Codeneos/vlocode/compare/v1.24.11...v1.25.0) (2024-08-07)

### Bug Fixes

* container and eval unit-test errors ([3762d16](https://github.com/Codeneos/vlocode/commit/3762d1667555acb320ec8ba29acdce4fafd5029b))

* string eval functions do not work properly due to compiler changes ([cc5ade8](https://github.com/Codeneos/vlocode/commit/cc5ade8de8e79b6c77580246015c0a7b7bd84a57))

* Update Compiler class to use object type for context parameter ([c3d73c2](https://github.com/Codeneos/vlocode/commit/c3d73c27e172c9fff1673d8b56dd4ef0b5aecb4e))

### Features

* add support for adding alias to existing users and delete org configuration ([29c135e](https://github.com/Codeneos/vlocode/commit/29c135e09f10de7aaacf8c63f08d078e79af21b0))

* support datapack export based on configuration definitions in a YAML definitions file ([c2edd7c](https://github.com/Codeneos/vlocode/commit/c2edd7c7537a3d28312befa7ac5d7269140b5276))

## [1.24.7](https://github.com/Codeneos/vlocode/compare/v1.24.6...v1.24.7) (2024-06-21)

### Bug Fixes

* OAuath2 incorrect URLs causes token refresh errors ([ab96a3d](https://github.com/Codeneos/vlocode/commit/ab96a3d94f5685e3588c8eed3e864959f3c9f32b))

## [1.24.5](https://github.com/Codeneos/vlocode/compare/v1.24.4...v1.24.5) (2024-06-12)

**Note:** Version bump only for package @vlocode/util

## [1.24.4](https://github.com/Codeneos/vlocode/compare/v1.24.3...v1.24.4) (2024-05-27)

### Bug Fixes

* update isSalesforceId to work for new id-format ([990eb5d](https://github.com/Codeneos/vlocode/commit/990eb5d926dbcf8133df8536983070b24f4bc27b))

## [1.24.3](https://github.com/Codeneos/vlocode/compare/v1.24.2...v1.24.3) (2024-05-27)

### Bug Fixes

* check reserved bits are equal to 0 for more accurate SF ID matching ([1543d9c](https://github.com/Codeneos/vlocode/commit/1543d9cf8f75ffe79af5a50615ec5eeffb1465b4))

# [1.23.0](https://github.com/Codeneos/vlocode/compare/v1.22.2...v1.23.0) (2024-04-29)

### Features

* suppress cascade failure reporting during deployment ([6fe07d2](https://github.com/Codeneos/vlocode/commit/6fe07d25e4749917c59458d2f0a7c5794ef62eec))

# [1.22.0](https://github.com/Codeneos/vlocode/compare/v0.21.7...v1.22.0) (2024-03-27)

**Note:** Version bump only for package @vlocode/util

## [0.21.3](https://github.com/Codeneos/vlocode/compare/v0.21.2...v0.21.3) (2024-01-23)

### Features

* option for showing test coverage in VSCode using lens ([eb90406](https://github.com/Codeneos/vlocode/commit/eb9040601ab551168881683488ce86564a80e20f))

## [0.21.2](https://github.com/Codeneos/vlocode/compare/v0.21.1...v0.21.2) (2024-01-22)

### Bug Fixes

* metadata folder types get packaged incorrectly ([e2ac4f6](https://github.com/Codeneos/vlocode/commit/e2ac4f649ebe9aac6243bcf3d64d5a17700b5111))

# [0.21.0](https://github.com/Codeneos/vlocode/compare/v0.20.12...v0.21.0) (2023-12-22)

### Bug Fixes

* sfdx.getOrgDetails does only matches the first alias of an org ([3c6a3d6](https://github.com/Codeneos/vlocode/commit/3c6a3d64396f7cbe1d2d8baa7c3b70f594c198b1))

### Features

* enhance org selection and displaying all more org details ([cfab40e](https://github.com/Codeneos/vlocode/commit/cfab40e7a81c482947d793f9dcf5d92cec43ec5e))

* support extended quick pick item buttons for API requests ([c5dee89](https://github.com/Codeneos/vlocode/commit/c5dee896ffa7ab2c745ac80c80146ec3a8bac482))

## [0.20.11](https://github.com/Codeneos/vlocode/compare/v0.20.10...v0.20.11) (2023-12-14)

**Note:** Version bump only for package @vlocode/util

## [0.20.10](https://github.com/Codeneos/vlocode/compare/v0.20.9...v0.20.10) (2023-12-03)

### Features

* add device flow support for authorizing a new org ([57326c1](https://github.com/Codeneos/vlocode/commit/57326c10a53c4aa67390dde12a57a00a2b04a5c4))

## [0.20.7](https://github.com/Codeneos/vlocode/compare/v0.20.6...v0.20.7) (2023-09-29)

**Note:** Version bump only for package @vlocode/util

## [0.20.5](https://github.com/Codeneos/vlocode/compare/v0.20.4...v0.20.5) (2023-09-06)

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

**Note:** Version bump only for package @vlocode/util

## [0.20.1-next.0](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.1...v0.20.1-next.0) (2023-08-20)

### Features

* improve build system and reduce load time of extension on startup by 40% ([692de00](https://github.com/Codeneos/vlocode/commit/692de003c677516ed13064fb4d7011be2f090225))

# [0.20.0-alpha.1](https://github.com/Codeneos/vlocode/compare/v0.20.0-alpha.0...v0.20.0-alpha.1) (2023-08-14)

**Note:** Version bump only for package @vlocode/util

# [0.20.0-alpha.0](https://github.com/Codeneos/vlocode/compare/v0.19.21...v0.20.0-alpha.0) (2023-08-12)

### Bug Fixes

* connection.request is not backward compatible with JSForce ([600aeaa](https://github.com/Codeneos/vlocode/commit/600aeaab5a7a87181cc804d0958e71500a22d83a))

* open in org does not work for Vlocity Cards without a version ([738b2c9](https://github.com/Codeneos/vlocode/commit/738b2c9a3006a5615071272d6ee5680af28324e7))

* support thenCall on promise returned by request for backward compatibility ([9cd3afc](https://github.com/Codeneos/vlocode/commit/9cd3afcd3ff761dabef38a5578f92bad88a33583))

### Features

* report progress when deploying datapacks in direct deploy mode for datapacks ([3890ec1](https://github.com/Codeneos/vlocode/commit/3890ec19d2514820502efc013fb4fc45f8d8b5bc))

* support new metadata types for deployment ([f5a7139](https://github.com/Codeneos/vlocode/commit/f5a7139b30e4bd43d2d2423150c41eb6ed38429e))

* sync selected SFDX username to Vlocode and vice-versa. ([095386d](https://github.com/Codeneos/vlocode/commit/095386dd6dced940e558602677dfd68f512165a8))

## [0.19.21](https://github.com/Codeneos/vlocode/compare/v0.19.20...v0.19.21) (2023-08-02)

### Features

* handle expired refresh tokens properly and reset the connection when the Access token updates; should also address issues [#405](https://github.com/Codeneos/vlocode/issues/405) and [#401](https://github.com/Codeneos/vlocode/issues/401) ([f3184c3](https://github.com/Codeneos/vlocode/commit/f3184c3961dfc627921f2f4d9db699c075be751a))

## [0.19.20](https://github.com/Codeneos/vlocode/compare/v0.19.19...v0.19.20) (2023-08-01)

### Bug Fixes

* XML metadata with boolean attributes is not deployed correctly ([7389674](https://github.com/Codeneos/vlocode/commit/738967418225ff1abcd02cedebb88fc611bbd66b))

## [0.19.16](https://github.com/Codeneos/vlocode/compare/v0.19.15...v0.19.16) (2023-07-25)

### Bug Fixes

* errors duplicate the word "Error" when printing to the console ([367d404](https://github.com/Codeneos/vlocode/commit/367d40412835c8c57315fe855c195a616ef2f219))

### Features

* support LWC geneation ([5f0107e](https://github.com/Codeneos/vlocode/commit/5f0107e6fe4e002809ee3b43245fff5ce7f8e6fe))

* update to typescript to version 5 and update required dependencies to match ([ccbda5c](https://github.com/Codeneos/vlocode/commit/ccbda5c228850fc91e7c605de30c202178ef55da))

* upgrade XML functions to use FXPv4 ([63c0ba9](https://github.com/Codeneos/vlocode/commit/63c0ba91989e7a87fbad5b64ee40c6672260509d))

## [0.19.15](https://github.com/Codeneos/vlocode/compare/v0.19.14...v0.19.15) (2023-07-12)

### Bug Fixes

* unable to update token if refreshed before loading org details ([778a163](https://github.com/Codeneos/vlocode/commit/778a1630ff8de7817bd40c3ccdabb3b5b529f215))

## [0.19.14](https://github.com/Codeneos/vlocode/compare/v0.19.13...v0.19.14) (2023-07-10)

### Bug Fixes

* "add to profile" command command does not work properly ([2e27e1e](https://github.com/Codeneos/vlocode/commit/2e27e1e55f46b807b9bb8545c1135715e5d18c77))

* when the access token fails to update in SFDX retry up to 3 times before failing ([da71552](https://github.com/Codeneos/vlocode/commit/da71552cc94915bc3082e50405647ce0662cdda6))

### Features

* add new object property sort to util library ([e313b5f](https://github.com/Codeneos/vlocode/commit/e313b5fb8ccaa2be1a6556fe2aa65ccd645c206a))

* add retryable decorator to retry async operations x times before failing ([2fb2242](https://github.com/Codeneos/vlocode/commit/2fb22423ba4c7986ad2a9a6ec4f481cb0799ac06))

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
