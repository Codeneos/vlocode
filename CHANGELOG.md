# Change Log
## Vlocity/Salesforce Integration for VSCode

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.19.6](https://github.com/codeneos/vlocode/compare/v0.19.5...v0.19.6) (2023-04-24)

### Bug Fixes

* type ahead blocks are not working when activated with Vlocode ([f775f6d](https://github.com/codeneos/vlocode/commit/f775f6da727e8588087e10e9b3be3edafecbbf41))

## [0.19.5](https://github.com/codeneos/vlocode/compare/v0.19.4...v0.19.5) (2023-04-18)

### Bug Fixes

* reduce order warnings for script elements ([09085ad](https://github.com/codeneos/vlocode/commit/09085adfe8e45abafb74d74071a6533ce6a48459))

## [0.19.4](https://github.com/codeneos/vlocode/compare/v0.19.3...v0.19.4) (2023-04-18)

### Bug Fixes

* datapack deployment does not delete not updatable child records (i.e; matrix rows) ([15b5776](https://github.com/codeneos/vlocode/commit/15b5776a40963668e6d5f93b5829bddf46356f36))

## [0.19.3](https://github.com/codeneos/vlocode/compare/v0.19.2...v0.19.3) (2023-04-17)

### Bug Fixes

* binary data (docx etc) not properly exposed in proxy ([e7afe72](https://github.com/codeneos/vlocode/commit/e7afe72172899ed006e60d8679ee2554287cd600))
* disable verbose logging of HTTP transport class ([09c8e0b](https://github.com/codeneos/vlocode/commit/09c8e0bfc4e86275d5b0cd14d5dce286562734b1))
* do not use query cache during deployment to avoid issues caused by a stale cache ([cbb45fa](https://github.com/codeneos/vlocode/commit/cbb45fa59a13f48dd4bfae2bcdb77ed3636484e7))
* script builder does not properly generate options for picklists with custom source ([3e2aeb2](https://github.com/codeneos/vlocode/commit/3e2aeb22ea4e513fc745da149f3dad839b3f5d34))
* update xml2js 0.5.0 to address CVE-2023-0842 ([85bda4e](https://github.com/codeneos/vlocode/commit/85bda4ee84fdeba2d9f35243eb245ae65986544e))
* versionable datapacks are not sorted by version when using export command ([757783d](https://github.com/codeneos/vlocode/commit/757783d9a8ab9aea3a64672c6aee5e2ab2436c23))

## [0.19.2](https://github.com/codeneos/vlocode/compare/v0.19.1...v0.19.2) (2023-04-04)

### Bug Fixes

* datapack type for integration procedures is set to OmniScript ([9c32b75](https://github.com/codeneos/vlocode/commit/9c32b757dca4a6ee3a0c960100f7925265ac2a11))

## [0.19.1](https://github.com/codeneos/vlocode/compare/v0.18.18...v0.19.1) (2023-04-03)

### Bug Fixes

* activate integration procedures using remote APEX ([3f79191](https://github.com/codeneos/vlocode/commit/3f79191d7b6ae2b48b4b5f6eb29fdbd4c1d25e37))
* add unit test for proxy transformer ([4a3d1c9](https://github.com/codeneos/vlocode/commit/4a3d1c91b2773a02d3f3483e870458ae937cba5a))
* additional validation on OmniScript templates to avoid linking templates that are not strings ([0d66200](https://github.com/codeneos/vlocode/commit/0d66200594de340065334a67aae3cd95e8590d07))
* before and after deploy specs do no respect record filter ([299eb4c](https://github.com/codeneos/vlocode/commit/299eb4c5ea5450bd04914167da6e0b28dd621611))
* bug in schema normalization not working properly for arrays ([44cec8f](https://github.com/codeneos/vlocode/commit/44cec8f29f44a12b70cde1c8a90b3ac20b517660))
* bulk queriy results do not include related object details ([6fd7e4f](https://github.com/codeneos/vlocode/commit/6fd7e4f5e1c6050ff5a0057da16f5c8f48e0c53e))
* bulkJob compiler error due to `info` being readonly type ([c32f014](https://github.com/codeneos/vlocode/commit/c32f014bc6136266795cf0940e1d31b333a4aefe))
* calculateHash does incorrectly references `this` from a static context ([0575fd3](https://github.com/codeneos/vlocode/commit/0575fd36bdb190010e5346bc5bd4d667562c96f1))
* compile issue due to breaking change in SfdxConnectionProvider arguments ([ac3efc8](https://github.com/codeneos/vlocode/commit/ac3efc835ec4736dfaec24aa40f64ad858ac4b2c))
* connection hook fails to attach due to connection not always being a promise ([2ef12cb](https://github.com/codeneos/vlocode/commit/2ef12cb8a532e458dcef1998acace956d9d19b21))
* datapack deployment tries to delete matching key records that can be updated in exceptional cases ([43b1ce4](https://github.com/codeneos/vlocode/commit/43b1ce43c94b5646b2e3840ef53d0af8f2476332))
* datapack explorer does not list certain datapacks due to query parser error ([d031866](https://github.com/codeneos/vlocode/commit/d031866ac9b39d91cc02e0ae80009dcb6f67b17b))
* datapackLookupService does not update the namespace of the filter when comparing field values causing a bugcheck ([826205f](https://github.com/codeneos/vlocode/commit/826205f277757fbb1f48ac719a3a17bc2cdc8bfb))
* definition builder for OmniScripts concatenates templates in a different order then APEX activation. ([5abf833](https://github.com/codeneos/vlocode/commit/5abf833fae1e1568837b1f594b32921fe36a7c19))
* deploy command does not await init on super class ([97596a1](https://github.com/codeneos/vlocode/commit/97596a199ecbc706b9ba88dcf7cd79b9d7aaea30))
* deployed OmniScript using local activation does not get updated to activated after deploying the definition and LWC ([4051b81](https://github.com/codeneos/vlocode/commit/4051b819c869df22fc47d98116481c69e0b37cbf))
* display warning for omniscript datapacks without elements instead of an error ([62f2398](https://github.com/codeneos/vlocode/commit/62f2398aa2730fe0c838adee29aab12db87aa605))
* do not dump old and new script definitions during activation ([81f9a17](https://github.com/codeneos/vlocode/commit/81f9a17b83b14753635a7b96bbb062ee78991cfe))
* do not exit when async interator has 0 results ([71ed265](https://github.com/codeneos/vlocode/commit/71ed2653e29a681d71f17c69fa22f1e51159b59f))
* drop `uuid` package in favor of browser and node native `randomUUID` from `node:ctypto` ([78e954c](https://github.com/codeneos/vlocode/commit/78e954c8cac5773962f76ea42827ab0475231ad9))
* encodeRFC3986URI does not encode `&` character causing queries with an & to fail ([029b607](https://github.com/codeneos/vlocode/commit/029b6079d6a8a871a20ceb44841a5ccfd036f09c))
* ensure that script activation does not delete the old definitions before ensuring the new version can be activated (only when activating a new version) ([0e6631a](https://github.com/codeneos/vlocode/commit/0e6631ad5bddf7f062185fca8f38e46040f7e920))
* exclude datapacks that are not loaded properly due to spec-function errors from the deployment and properly log and attach spec function errors to the respective datapack that causes them ([c4c7fb1](https://github.com/codeneos/vlocode/commit/c4c7fb10cdfe3129c8ab31543e3925fa0fc053bf))
* fix QueryService test mocks `query` operation instead of underlying transport ([5e33d7b](https://github.com/codeneos/vlocode/commit/5e33d7bc8a0160e69a8b0e9bf84abaa6cc57dd23))
* fix several script generation errors ([eff0ef0](https://github.com/codeneos/vlocode/commit/eff0ef01e4fc72ff2917f5250e9b879ee8f437ca))
* getErrorMessage does not use defaults when set ([00868ec](https://github.com/codeneos/vlocode/commit/00868ecbc8be149232a6afc06f63577a6f00f5db))
* incorrectly mapping version to sub type  for script definition generation ([e6ff15a](https://github.com/codeneos/vlocode/commit/e6ff15acc7ae0a6797a2ee0f3a913276e8429376))
* IPs with single elements crashed updateElementOrder due to that expecting elements to always be an array ([ae66a4a](https://github.com/codeneos/vlocode/commit/ae66a4a332ac250b0769581b4121cbb3fccb1403))
* lookup service does not report script name/id in lookup error ([8021d97](https://github.com/codeneos/vlocode/commit/8021d97094b3d3f89c22f19928f5dc552345882f))
* LWC compiler throws error when the tooling record is not updated as Salesforce returns a 204 status code with no body ([64e4eaf](https://github.com/codeneos/vlocode/commit/64e4eaf319321a39317ca81bf669428827224ade))
* LWC enabled scripts with embedded scripts did not render elements inside of blocks ([d0c9b9c](https://github.com/codeneos/vlocode/commit/d0c9b9c18e41650771579370adb0842a8b052ce9))
* mapGetOrCreate does not play nice with sync-initializers ([d06d5cf](https://github.com/codeneos/vlocode/commit/d06d5cfb52fdcb3ce3901ff06ad6408d8f79f9f4))
* normalizeSalesforceName transforms uppercase acronyms to `xML` instead of `xml` ([8f3df44](https://github.com/codeneos/vlocode/commit/8f3df44f8e55bab1a82c93ba1fbc80b1b479d443))
* only run tests for test and spec files in __tests__ folder ([65fb3a9](https://github.com/codeneos/vlocode/commit/65fb3a975cc291fbb37b4dc04eea9afe97605924))
* only update order and level when not set in the datapack. ([a26f6e3](https://github.com/codeneos/vlocode/commit/a26f6e3151cbb4409e8afe089c2d4185957b85f5))
* QueryService resolves namespace from base container ([e07b578](https://github.com/codeneos/vlocode/commit/e07b578b136207a1903999515a47d751a0d65d54))
* re-ordering of elements should start counting at 1 for element order instead of 0 ([1bdc38c](https://github.com/codeneos/vlocode/commit/1bdc38c05474571a2991394e6dec6be934da04fa))
* relationship incorrectly cast to arrays in iterator ([e9a5e03](https://github.com/codeneos/vlocode/commit/e9a5e03a05934c7569f5612ab621fd9a69e8bebf))
* rename sass folder to scss to avoid conflicts with sass nodejs module ([41dd5cf](https://github.com/codeneos/vlocode/commit/41dd5cf26856ceeeaac2f1bc4d80ba6b0f6c8e0b))
* retrieveMetadata command does not request zip file causing no files from being refreshed ([e137dfd](https://github.com/codeneos/vlocode/commit/e137dfd253fc8bd2e46920f2ad42f945eaac99a3))
* script gen crashed on invalid picklist configuration for a choice element ([89ec371](https://github.com/codeneos/vlocode/commit/89ec3715e3337b9c2707ccb07333aa2aa050eade))
* toolingApiSchemaAccess transforms nested results which are already processed by query2 ([825a0b6](https://github.com/codeneos/vlocode/commit/825a0b61da7fc1b33b0b3846ae8dffc70113ee36))
* transform proxy does not transform array methods properly ([e7be106](https://github.com/codeneos/vlocode/commit/e7be1064c77f93fc0806a9607354ca094693adec))
* UI layouts are incorrectly linked to UI templates ([7b949fc](https://github.com/codeneos/vlocode/commit/7b949fc47d4d065185acba18ce36ca577352a691))
* update order and level of OmniScript elements before deployment (issue [#396](https://github.com/codeneos/vlocode/issues/396)) ([c9c08f1](https://github.com/codeneos/vlocode/commit/c9c08f1774fec7cda1c157fbf03c8e9e5fba8768))
* use getSObjectType in query cache to avoid errors when caching complex queries not yet supported by the parser ([57aea51](https://github.com/codeneos/vlocode/commit/57aea5194c0e83899fd6717b6b0136e5b7711842))
* vlocode ignores tooling API flag and always uses Metadata API for uploading LWC OmniScrips ([707b6bf](https://github.com/codeneos/vlocode/commit/707b6bf6dcba033669a14f8c0ccb28d83dc17574))
* when building multiple definitions they re-use the same objects instead of deepCloning them ([24fe045](https://github.com/codeneos/vlocode/commit/24fe0451221818b321be92ff779a453dcdbd6188))

### Features

* activate scripts in accordance to their dependency graph ([1295364](https://github.com/codeneos/vlocode/commit/129536420f8e5956eeb973654093f370fda48dda))
* add new activation command to activate OmniScripts and deploy LWC components already deployed in the org. ([c045bca](https://github.com/codeneos/vlocode/commit/c045bca095663400b99e493c8802641d8ad868a6))
* add new mapBy function to easily map arrays by key ([23083b6](https://github.com/codeneos/vlocode/commit/23083b683253fb4ab73a20c830b1438f08408878))
* add support for reactivating dependent scripts ([2a8a42c](https://github.com/codeneos/vlocode/commit/2a8a42c6725ca83905462e0c0038dc4ed7ee6b42))
* always regenerate the LWC id when building the script definitions ([2f57fc0](https://github.com/codeneos/vlocode/commit/2f57fc06231be1969b2237150831f83e51b71e89))
* automatically reactivate dependent scripts ([c92c5ea](https://github.com/codeneos/vlocode/commit/c92c5ea3544f129f44f35e120a11626efab36148))
* change getErrorMessage signature to accept options and allow default options to be set easily ([f1e8d46](https://github.com/codeneos/vlocode/commit/f1e8d46132403672c3b3c87ed0bb39106a2c34bf))
* expose `--continue-on-error` for vlocode CLI deployment command ([dcc014a](https://github.com/codeneos/vlocode/commit/dcc014af539d2eff2bd1e55390e858b2456e05c6))
* expose job info on bulk/bulkJob.ts as readonly object from the job ([0b777be](https://github.com/codeneos/vlocode/commit/0b777bec0bdb4c1e13655aa58dca073b699c53cf))
* improve query parser correctness by enforcing keyword order on SOQL syntax parser ([04dc796](https://github.com/codeneos/vlocode/commit/04dc796445cbb3ec538837066e53199ee5cf6f65))
* include logging of queries in debug mode ([296395a](https://github.com/codeneos/vlocode/commit/296395ab06d3eb019daab957d340efc3aa711cd5))
* introduce new uniform query API for data and tooling objects; update query service to use new query API. ([775ca10](https://github.com/codeneos/vlocode/commit/775ca100f41cc72c73387f1b46da3681831a72b3))
* local OmniScript activation now updates the isActive flag to `true` and deactivates the old active version of the same script ([08092e4](https://github.com/codeneos/vlocode/commit/08092e4f1f51927414a2810590c3a091b17559da))
* open LWC OmniScripts in LWC editor and classic in Angular designer ([e016d3f](https://github.com/codeneos/vlocode/commit/e016d3f45ad1ec7ef218ce37d52bc879961c2f8e))
* report stack trace for datapack loading errors during datapack deployment while debugging ([b282180](https://github.com/codeneos/vlocode/commit/b282180dd286116ba5bf7f55f96f8c46459218c5))
* support correctly parsing datapacks that are not in a parent folder ([ae261c2](https://github.com/codeneos/vlocode/commit/ae261c2727d5fcc40afc78b471929a7162408d1f))
* support local OmniScript definition generation instead of using remote APEX. This speeds up OmniScript activation and avoids govern limit issue when activating large scripts. ([5bbd304](https://github.com/codeneos/vlocode/commit/5bbd30462101d0918de34dfed7badee88d5e2dd9))
* support more datapack types in datapack explorer ([3a19411](https://github.com/codeneos/vlocode/commit/3a1941197250a8b747cb1ae8774511ec4c4d22a9))
* support more lookup configurations for OmniScripts ([6ea32b4](https://github.com/codeneos/vlocode/commit/6ea32b4528f9302b91765b9bba7beb5d6d679501))
* support unary operators, with condition and braces for query parsing and generation ([87d56c8](https://github.com/codeneos/vlocode/commit/87d56c86fcd2f7faf0677bacef391f1e2f4cba94))
* support unlimited re-usable OmniScript embedding; allows more then 1 level deep embedding of scripts ([bb23f67](https://github.com/codeneos/vlocode/commit/bb23f677ee8e74a0ae43a067e17ed1f0b1d21bdb))
* switch from sass.js to sass-dart for scss compilation; sass.js is not unmaintained and not being updated anymore ([807e45c](https://github.com/codeneos/vlocode/commit/807e45c593061b509309db849f66dc7188e7238a))
* update calculateHash to also work on strings for convenience ([b5fd2c1](https://github.com/codeneos/vlocode/commit/b5fd2c1e4e089cf9b63dce40286214f3e7785632))

## [0.18.18](https://github.com/codeneos/vlocode/compare/v0.18.17...v0.18.18) (2023-03-01)

### Bug Fixes

* createMetadata incorrectly sends metadata as tag in payload ([8ea0aa2](https://github.com/codeneos/vlocode/commit/8ea0aa25deee6ba2479cb87a2cae1bc45f7ef63f))

## [0.18.17](https://github.com/codeneos/vlocode/compare/v0.18.16...v0.18.17) (2023-02-23)

### Bug Fixes

* ensure xsi:type is set for all metadata operations ([1a63abb](https://github.com/codeneos/vlocode/commit/1a63abbd8b237b610c7055f58ce7cf7c82542c9e))

## [0.18.16](https://github.com/codeneos/vlocode/compare/v0.18.15...v0.18.16) (2023-02-20)

### Bug Fixes

* fix change managed package detection to use both readMetadata instead of only listMetadata ([60ef988](https://github.com/codeneos/vlocode/commit/60ef988bb6486018962cb1afaedf44a94853f098))
* linking of schemas overrides default field types ([6d9c783](https://github.com/codeneos/vlocode/commit/6d9c7838ccc7391f787477bb1ad200de9ce4a891))

### Features

* add chunkArray and chunkAsyncParallel helper functions to chunk work into smaller chunks and process the chunks in parallel ([3f13eab](https://github.com/codeneos/vlocode/commit/3f13eabe304415eb6cf8f036a5819ddb8d06ac8d))
* force defaults for SOAP items according to the schema ([2fce17e](https://github.com/codeneos/vlocode/commit/2fce17e3742e62419fc6c0d10d1c40ef6f0cdcf1))
* support reading more then 10 metadata records and all metadata from a certain type (readAll) ([87f4045](https://github.com/codeneos/vlocode/commit/87f404596b3a8a16a72d015d8dc5e2173afcecb5))

## [0.18.15](https://github.com/codeneos/vlocode/compare/v0.18.14...v0.18.15) (2023-02-20)

### Bug Fixes

* do not ignore SFDX entries without an orgId; derive orgId from access token instead ([44baded](https://github.com/codeneos/vlocode/commit/44baded238999881ebc41075407eae0311cc6bc4))
* metadata API calls do not return response body when response path undefined ([44cc277](https://github.com/codeneos/vlocode/commit/44cc2777f078fdac890734f9931ab66ab7e471cf))

### Features

* expose more properties the bulk jobs ([5ae1f1a](https://github.com/codeneos/vlocode/commit/5ae1f1a309cab99119a13175775af4f1ccf727ec))
* strongly typed metadata API and metadata API Schema validations ([dd1022f](https://github.com/codeneos/vlocode/commit/dd1022ff94e47d6e3a896283fa3657896bb5697f))
* support composite requests and dynamic API versions on connection ([4036718](https://github.com/codeneos/vlocode/commit/4036718b06ca2c2c70af9f9e6e1ea16cb5d6c939))

## [0.18.14](https://github.com/codeneos/vlocode/compare/v0.18.13...v0.18.14) (2023-02-14)

### Bug Fixes

* getRootTagName also detects root tags in files that have XML like strings ([4dcbd72](https://github.com/codeneos/vlocode/commit/4dcbd72eb2871244cb1917d79bf0ef184cabbcbe))

## [0.18.13](https://github.com/codeneos/vlocode/compare/v0.18.12...v0.18.13) (2023-02-14)

### Bug Fixes

* refresh access token on connection does not emit event ([37098dd](https://github.com/codeneos/vlocode/commit/37098ddddef1056d878ec9ad340c272dfe46dccc))
* soap client does not detect access token expiry causing error when token is expired instead of issuing a token refresh ([2cb1b2f](https://github.com/codeneos/vlocode/commit/2cb1b2f76834de22b418d09755b0c22652c16ecf))
* updateAccessToken stores updated access tokens under alias instead of under username ([7410ed4](https://github.com/codeneos/vlocode/commit/7410ed4844c66fa3edf219c11e3bd082b350433a))
* visitObject does not visit properties that have object values ([a140204](https://github.com/codeneos/vlocode/commit/a14020413a8d7076298a43ad15d561feb3bada44))
* xml type nill is not parsed as null value ([6617c88](https://github.com/codeneos/vlocode/commit/6617c8840f2fd3d5b545c76c08a045a3bf9912b7))

### Features

* adjust deployment options for production deployments and prevent deployments with incorrect configuration from starting ([ade5fe9](https://github.com/codeneos/vlocode/commit/ade5fe90988e2faf59896ab7be4604dab2ff19a2))
* do not bundle jsforce anymore; jsforce patches have been incorperated into Salesforce connection ([718e89d](https://github.com/codeneos/vlocode/commit/718e89d5ac19973c3f972bb5662d2e1c54052d10))
* enable response and request logging for http-transport using static transport flag ([56116ca](https://github.com/codeneos/vlocode/commit/56116ca9792eff50fd03eaa2163578800a87bb52))
* implement support bulk API 2.0 ([cd0c346](https://github.com/codeneos/vlocode/commit/cd0c3461c4915397c2fef18aed57e84c3113a8c9))
* support both metadata REST and SOAP APIs for deployment ([5846c2e](https://github.com/codeneos/vlocode/commit/5846c2e1c448493888b1e1d7996626716277cf20))
* support replacement tokens in URL ([9e359a9](https://github.com/codeneos/vlocode/commit/9e359a9c121195705b62a470641abc8cb7505dce))

## [0.18.12](https://github.com/codeneos/vlocode/compare/v0.18.11...v0.18.12) (2023-01-27)

### Bug Fixes

* deployment command hangs due to error in async result locator ([bc2f164](https://github.com/codeneos/vlocode/commit/bc2f16409308620f4150a39434f1e6f04b9efa6c))
* do not display record selection when refreshing a single datapack ([f29647a](https://github.com/codeneos/vlocode/commit/f29647a04edb52d2f607bfc43fa7cdfcf05c71b0))
* error while refreshing custom datapack types ([8877c01](https://github.com/codeneos/vlocode/commit/8877c01c5baddb1b70f51390ec490347d16fc9a3))

## [0.18.11](https://github.com/codeneos/vlocode/compare/v0.18.9...v0.18.11) (2023-01-26)

### Bug Fixes

* avoid sfdx.log file locks by disabling file logging for the SFDX root logger ([c799ca9](https://github.com/codeneos/vlocode/commit/c799ca96c7a404d31af9cef0b0fc9aee57b86532))
* extension no publishing due to outdated badge URL ([9112cf2](https://github.com/codeneos/vlocode/commit/9112cf2949f187c7c9f79ab4b4c948655ea59e7c))
* metadata API commands hand indefinitely due to jsforce post-processing of SOAP responses ([44c6291](https://github.com/codeneos/vlocode/commit/44c62914ad39a3d9e754be1a9d35260f0635f094))

## [0.18.10](https://github.com/codeneos/vlocode/compare/v0.18.9...v0.18.10) (2023-01-25)

### Bug Fixes

* avoid sfdx.log file locks by disabling file logging for the SFDX root logger ([c799ca9](https://github.com/codeneos/vlocode/commit/c799ca96c7a404d31af9cef0b0fc9aee57b86532))
* extension no publishing due to outdated badge URL ([9112cf2](https://github.com/codeneos/vlocode/commit/9112cf2949f187c7c9f79ab4b4c948655ea59e7c))

**Note:** Version bump only for package vlocode-project

## [0.18.8](https://github.com/codeneos/vlocode/compare/v0.18.7...v0.18.8) (2023-01-25)

### Bug Fixes

* the refreshFn cannot be set when refresh delegates is undefined ([9d5222a](https://github.com/codeneos/vlocode/commit/9d5222a91ecb1caa910d261fec7a3a2b60542512))

### Features

* improve custom transport so it can be used with OAuth flow and stores refreshed tokens in SFDX to avoid refreshing tokens every time vlocode connects to a SFDX org with an outdated access token ([7bd75e5](https://github.com/codeneos/vlocode/commit/7bd75e582f5cf196b1d32272ab5c1d3bba81d283))
* support refreshing OAuth tokens and prefilling the username on the refresh tokens action ([b31a419](https://github.com/codeneos/vlocode/commit/b31a4198044a4dd701adbe0aacdb15c157af75f8))

## [0.18.7](https://github.com/codeneos/vlocode/compare/v0.18.6...v0.18.7) (2023-01-24)

### Bug Fixes

* "spec function failed to execute" error on action activation ([84617cf](https://github.com/codeneos/vlocode/commit/84617cf5070caa0b1581ce41525adb018433e6e7))
* container returned classes do not pass instance-of test due to wrong prototype ([f7554c5](https://github.com/codeneos/vlocode/commit/f7554c54d1fb071aef7523ce69642c1ccade1670))
* deferred promise does not allow resolving with a promise ([e3d670b](https://github.com/codeneos/vlocode/commit/e3d670b94db268bb5f04c722c2d09a8ca6b9fa9c))
* fractions reported as 'SS' due to invalid fraction format in loggers (due to luxon migration) ([2675a46](https://github.com/codeneos/vlocode/commit/2675a46c4ac72a81d66a61bc7baafbc65be9e2a5))
* http transport does not support deflate properly ([5e6ca2f](https://github.com/codeneos/vlocode/commit/5e6ca2feaee36b31f83b28a46fd7d7e934a21207))
* missing comma causing build error ([1a3ab25](https://github.com/codeneos/vlocode/commit/1a3ab25b0302987327c816791d2eea7b88e552ca))
* not passing client id to salesforce connection ([4c5e458](https://github.com/codeneos/vlocode/commit/4c5e458426f503c5e73eb5727deeeb46a3a18578))

### Features

* add custom HTTP transport for Salesforce connection with support for keep-alive, socket pooling, gzip, cookies and automatic retry in-case of a hung-up socket ([0ae47a9](https://github.com/codeneos/vlocode/commit/0ae47a925eabbc8184413372282accd3a510bf01))
* ensure correct deployment order for Vlocity cards ([7758438](https://github.com/codeneos/vlocode/commit/77584386c74375fa870bfa83a4f2acb43937a04c))
* ensure layouts are only activated after templates and cards are deployed and activated ([96ab0ce](https://github.com/codeneos/vlocode/commit/96ab0cedd60098031d57742ec184b756cdb21f46))

## [0.18.6](https://github.com/codeneos/vlocode/compare/v0.18.5...v0.18.6) (2022-12-12)

### Bug Fixes

* excess spaces ([e6bf37d](https://github.com/codeneos/vlocode/commit/e6bf37d0cd5babe6d4e763eb98d28a0e16b2a0ea))
* no jobs visible in jobs explorer ([47c49b7](https://github.com/codeneos/vlocode/commit/47c49b78baf8b7cf84a3c91507a6254290a3b2b8))

### Features

* add `useInstanceProxies` setting controlling if the container always returns proxies or only when required to resolve circular references ([2a9ff46](https://github.com/codeneos/vlocode/commit/2a9ff46dea9e50a24e28f89807d920b9463a65f7))
* support deployment of field map config with custom spec file ([44d6368](https://github.com/codeneos/vlocode/commit/44d636845435859bbcc2fecfdd0d77650e3a81e3))

## [0.18.5](https://github.com/codeneos/vlocode/compare/v0.18.4...v0.18.5) (2022-11-23)

### Bug Fixes

* wrong date-time format ([669cf27](https://github.com/codeneos/vlocode/commit/669cf27340da39d2258feb76e47d98253ca264c8))

## [0.18.4](https://github.com/codeneos/vlocode/compare/v0.18.3...v0.18.4) (2022-11-23)

### Bug Fixes

* crypto module not imported ([370dde6](https://github.com/codeneos/vlocode/commit/370dde6e90aadcd7c12e6ac5574db1c5fa804494))
* lookup service returns incorrectly matched records in edge case (to strings ending with `-1` are considered equal due to quirks in the js-Date class) ([23fc498](https://github.com/codeneos/vlocode/commit/23fc498cf9ee3c8ee49ed82d0472aa6df1c40130))
* only a single spec function executes for mixed deployments causing templates, scripts and other components from not being activated ([3a7f8af](https://github.com/codeneos/vlocode/commit/3a7f8afb7b3626f6cd1bd35a6175784d86cb8c40))
* references returned as boolean values in record factory ([8ac959e](https://github.com/codeneos/vlocode/commit/8ac959ea9e89d782c377bb83bc163b3c4a93f74c))
* using old moment date formats with luxon ([4f99eb3](https://github.com/codeneos/vlocode/commit/4f99eb3984fddca44b221b281c72e28312647582))

### Features

* improve resolution speed by not comparing all fields of an object but exit once a single field mismatches in lookup service ([ceb32ac](https://github.com/codeneos/vlocode/commit/ceb32aca0fbb7e90b5990a7d1df049f90a71e0c4))

## [0.18.3](https://github.com/codeneos/vlocode/compare/v0.18.2...v0.18.3) (2022-11-22)

### Bug Fixes

* incorrectly report sandboxes as production orgs blocking Salesforce deployments ([0efcc8c](https://github.com/codeneos/vlocode/commit/0efcc8c951d01926010f53454ed1fdb3903bb9c2))

### Features

* add support for purging object field maps before new-ones are deployed ([48f327c](https://github.com/codeneos/vlocode/commit/48f327c08b846219e3cc79459404cf9b1c0facba))

## [0.18.2](https://github.com/codeneos/vlocode/compare/v0.18.1...v0.18.2) (2022-11-22)

### Bug Fixes

* do not bundle @salesforce/core in util library ([4d0cbc4](https://github.com/codeneos/vlocode/commit/4d0cbc4a63284aa579d2fbd909c6cac9ccd8cfdc))

## [0.18.1](https://github.com/codeneos/vlocode/compare/v0.18.0...v0.18.1) (2022-11-21)

### Bug Fixes

* clear debug logs commands does not complete ([2ae7d6c](https://github.com/codeneos/vlocode/commit/2ae7d6c20fa70cf7e1816f359d9a04d6ee3d81ea))
* debug log viewer file names do not use proper date format ([de76b2a](https://github.com/codeneos/vlocode/commit/de76b2a43e68acebf21ff34c7f8f1933cf183318))

### Features

* support reusing and storing custom debug levels defined through Vlocode ([58d89dc](https://github.com/codeneos/vlocode/commit/58d89dcbee273b5db0eaadea515e986dd1c33133))

# [0.18.0](https://github.com/codeneos/vlocode/compare/v0.17.12...v0.18.0) (2022-11-21)

### Bug Fixes

* add more unit tests for filterApplicableRecords and evalFilter ([f1d71cb](https://github.com/codeneos/vlocode/commit/f1d71cb187ee6c3bd2027bcbc3376c56e854744b))
* allow to pass this argument to work queue improving type detection ([20f095d](https://github.com/codeneos/vlocode/commit/20f095dcb60402f582e5fcd682a9c376d7d1ca51))
* container injection for vlocode standalone does not always use internal container ([a5e1ce7](https://github.com/codeneos/vlocode/commit/a5e1ce7f9242b22cd254034316243c6e584b7cfd))
* content versions create new content documents during deployment instead of attaching to the existing content document as new version ([f7bc2b8](https://github.com/codeneos/vlocode/commit/f7bc2b81ea9f901e41480eded09a563fbfa47323))
* datapackDeploy register queryservice from root container into child container without a valid namespace provider ([f4d11f9](https://github.com/codeneos/vlocode/commit/f4d11f9b1b5335a6006d5e3bb1486c2f5928077d))
* deployment specs are not re-used but recreated for every spec call causing local state of specs to be lost as well as reducing performance ([866a443](https://github.com/codeneos/vlocode/commit/866a44337512950c0bb4cba37570fa2abece5e23))
* deployOnSave setting for Vlocity datapacks is ignored ([4381d29](https://github.com/codeneos/vlocode/commit/4381d29f198a26ec5eadb1339b6a24e6218bc017))
* do not mark string as iterable to avoid unintended behavior. ([db32e48](https://github.com/codeneos/vlocode/commit/db32e48be0027203a52b44c0cd1683ec73d5e480))
* improve groupBy and mapGetOrCreate types ([24ff881](https://github.com/codeneos/vlocode/commit/24ff881f196f241069a3921ee2e734954278d582))
* improve startup performance by avoiding explicit source map loading ([178f6d5](https://github.com/codeneos/vlocode/commit/178f6d5ddc09303efada7c2ab4bf7af9bcfb9eaf))
* init command not awaited causing vlocode deploy to create duplicate dependencies ([534b5e1](https://github.com/codeneos/vlocode/commit/534b5e1891028cb8759e7bc7b6f76eb3845fb211))
* lazy does not properly return type of initializer ([f960e08](https://github.com/codeneos/vlocode/commit/f960e08040b124a2ef8e2a535499d9490af7dacf))
* LWC compiler doesn't work on vlocity Winter '23 release ([d9618d1](https://github.com/codeneos/vlocode/commit/d9618d1e30db9f68807e81b2a2d41a3fd40efd1e))
* minor textual changes for activities ([22f0dcc](https://github.com/codeneos/vlocode/commit/22f0dcc74c0e83cd465f91bfc494d075445e4e84))
* oath token doesn't refresh in rare circumstances ([44722fd](https://github.com/codeneos/vlocode/commit/44722fdf46df87dd9c0baf0193783e2ca62c7356))
* omniscript activator references vlocity_cmt namespace instead of the namespace placeholder ([b99e32e](https://github.com/codeneos/vlocode/commit/b99e32e03947533323a20e29fc74de154d9dc3f1))
* OmniScript spec doesn't always execute ([97b42c2](https://github.com/codeneos/vlocode/commit/97b42c2a9ea856be8130cde76618e273fc464997))
* override definitions are not correctly updated causing them to break ([b10e7f0](https://github.com/codeneos/vlocode/commit/b10e7f0c428efe8ab2f9d5cd62834b4914e7667a))
* pause/resume icon missing due to command router not running init function ([6dae67d](https://github.com/codeneos/vlocode/commit/6dae67d6d3452d33b4161e77c417bc1e60ee8efe))
* remove debug statement from queryBuilder ([7e7ee17](https://github.com/codeneos/vlocode/commit/7e7ee175398a1ba117c36cb56e9b7c6fdfdb6bb8))
* set log level to debug when running with `--debug` flag as true ([59483c8](https://github.com/codeneos/vlocode/commit/59483c8d1877eb345f7b4e9d74f88e568b01d742))
* update all spec filters to filter on RecordType instead of on Datapack Type; Datapack type is not always reliable and depends on headers being placed in correct folders. As vlocode doesn't require datapacks to be placed in the correct folder structure having specs only trigger on datapack type is unreliable. ([6bf1a04](https://github.com/codeneos/vlocode/commit/6bf1a0488f1f9f25a6ace6db032c32befea56dde))
* use record defined lookup keys instead of general matching keys to allow specs to modify lookupk keys on a per record level ([8370707](https://github.com/codeneos/vlocode/commit/8370707d0cabb9aa128b8e798797b2f9ab51ee55))
* validate datapack dependency/reference integrity ([ff98a55](https://github.com/codeneos/vlocode/commit/ff98a553404f2e066e2929e38b853cd5db9afdc0))
* vlocode can hang during initialization or org-switching ([7c95c2c](https://github.com/codeneos/vlocode/commit/7c95c2c6259e94e8c951e9f069473ddf8ad94fea))
* vlocode crashes on start-up when packed with webpack ([bcd177f](https://github.com/codeneos/vlocode/commit/bcd177f930b28c300370f97c0e8c53b99cc058f3))

### Features

* add container name to logs in debug mode ([8f61318](https://github.com/codeneos/vlocode/commit/8f61318f58ab39219d5a4ca49e78c668ffb3966f))
* add objectEquals utility method for comparing objects ([819c97f](https://github.com/codeneos/vlocode/commit/819c97fbae04bab3febf6b9ae512bfc7eb2a9251))
* automatically create ContentDocumentLinks post deployment to make document templates available post-deployment without manual actions ([0c7e23c](https://github.com/codeneos/vlocode/commit/0c7e23cc73c9396452c05827d361c29585b79b0f))
* await batch classes executed by Vlocity Admin commands and report their progress in vscode ([16453df](https://github.com/codeneos/vlocode/commit/16453df7eaee34805e63c51a2f101daf2f0296da))
* cache Vlocity namespace prefix by org ([3978bff](https://github.com/codeneos/vlocode/commit/3978bff73727ff90a03c6422603e46db317aa643))
* combine layout and card deployment actions ([b565f6c](https://github.com/codeneos/vlocode/commit/b565f6c67df47c5d6807b8392d691afabc578dce))
* do not update ContentVersion when the version data is unchanged ([e998a86](https://github.com/codeneos/vlocode/commit/e998a8648c097bc87e5c71366a1e78a65788be88))
* do not use sfdx connection and upgrade to @salesforce/core@3 ([be6add4](https://github.com/codeneos/vlocode/commit/be6add401f29131e4769feb8f9b7a59787285edf))
* improve support for cancellation signaling during datapack deploymen ([e356132](https://github.com/codeneos/vlocode/commit/e3561320f48c2b22c3efd5361e1d13676380a929))
* log deployment object details when running with `debug` log level ([ba7f9b1](https://github.com/codeneos/vlocode/commit/ba7f9b125f794fd6018a0a9ea1aeff83003b722b))
* remove irrelevant activities from the Activities overview and only show relevant past activities ([d0d3b9c](https://github.com/codeneos/vlocode/commit/d0d3b9c6aa0c2943e21ed8124bcd0b8dc010fbf9))
* report progress of developer logs deletion in vscode progress dialog ([f522a7a](https://github.com/codeneos/vlocode/commit/f522a7ac9a9b5203376083b9a7843617088b71a3))
* store global cache as global and improve cache clear command ([ebd0e6d](https://github.com/codeneos/vlocode/commit/ebd0e6dd62dad1c0301e56615ab97b9a2fa87f3e))
* support checking a class is decorated with `[@injectable](https://github.com/injectable)` ([918639e](https://github.com/codeneos/vlocode/commit/918639ee37c88f9617cb660d291426db3901029d))
* support IoC container injecting it self as dependency ([70bc709](https://github.com/codeneos/vlocode/commit/70bc709dc2a77988bb1695f5fc439f587e8b7cc2))
* support printing timer duration in multiple formats ([a010e9d](https://github.com/codeneos/vlocode/commit/a010e9db35ba7775355063b60e07114c255822e6))
* support queryTooling through queryService ([9f599ef](https://github.com/codeneos/vlocode/commit/9f599efd62f2123d67ad574efe388b188a3d63c3))
* update TemplateContentDocumentId__c field when deploying templates with the latest content version ([325ebb6](https://github.com/codeneos/vlocode/commit/325ebb6c2a43ada18f63e6a6955b9e01b58c524a))
* update Vlocity datapack deployment hooks (specs) to allow them to run on record level and support for changing deployment action from a spec ([06b2500](https://github.com/codeneos/vlocode/commit/06b25000ad47cdce83bd00468e5ecaabf8bba596))
* use standard vscode icons for activities and support hiding of activities in the activity overview ([eacc4b9](https://github.com/codeneos/vlocode/commit/eacc4b9dd49daff3e78c31444c6083fbe29de0fc))

## [0.17.12](https://github.com/codeneos/vlocode/compare/v0.17.11...v0.17.12) (2022-10-19)

### Bug Fixes

* invalid tree item (issue [#389](https://github.com/codeneos/vlocode/issues/389)) which occurs for some datapacks in the datapack explorer in-combination with the latest release of vscode ([51c673f](https://github.com/codeneos/vlocode/commit/51c673f265e1a027d2beea74ee6802759230c07b))

## [0.17.11](https://github.com/codeneos/vlocode/compare/v0.17.10...v0.17.11) (2022-10-11)

### Bug Fixes

* ensure consistent behavior for `SalesforceSchemaService` with the new `CompositeSchemaAccess` that can throws Errors ([4aa5cb7](https://github.com/codeneos/vlocode/commit/4aa5cb7a7d4511f76d0b6c91618bd99db1548c04))
* metadata files for APEX classes and triggers are formatted without line-breaks or spaces ([3bba919](https://github.com/codeneos/vlocode/commit/3bba919ced9e0630b6efa8c5a8763702b642fb20))
* set options for Vlocode deploy to purge child items which helps deleting stale PCIs ([710b992](https://github.com/codeneos/vlocode/commit/710b99202b187c0cc6c7f22508187de9766c1790))
* suggestion for Vlocode deploy mode doesn't show ([abbe65f](https://github.com/codeneos/vlocode/commit/abbe65f082c55d3e9306e111ee4d7179efbc5efe))

## [0.17.10](https://github.com/codeneos/vlocode/compare/v0.17.9...v0.17.10) (2022-09-30)

### Bug Fixes

* OmniScript activation errors are logged as `[object object]` error ([451ae6f](https://github.com/codeneos/vlocode/commit/451ae6f7b8649e251174899f47246142a7e12995))

### Features

* add --skipLwc as CLI command line option; to skip LWC activation and deployment ([8f0cbfb](https://github.com/codeneos/vlocode/commit/8f0cbfb0c3d15211d2c2d6eb3a3ae521081b733c))
* dynamically add OmniScript template and script dependencies to ensure a correct deployment order ([cb8df9f](https://github.com/codeneos/vlocode/commit/cb8df9fbbcdab8c64ce45d50512817aacb066b09))
* use tooling API instead of metadata API for LWC omniscript deployment by default ([c7ba72c](https://github.com/codeneos/vlocode/commit/c7ba72c2c69e6d16d3894400a155dd1603b61320))

## [0.17.9](https://github.com/codeneos/vlocode/compare/v0.17.8...v0.17.9) (2022-09-29)

### Bug Fixes

* not using latest API version for SFDX ([42f703a](https://github.com/codeneos/vlocode/commit/42f703a6200ff35ffc6924b7b1a3a75748f13ffe))
* vscode extension fails to start due to canvas dependency being incorrectly required by jsdom ([4b8d281](https://github.com/codeneos/vlocode/commit/4b8d28103d5845016f5fcc031101e20eb1aab843))

### Features

* support tooling API for deployment of LWC components ([8c6a031](https://github.com/codeneos/vlocode/commit/8c6a031bd4930f76e7fe0076389e11b3dfd7c573))

## [0.17.8](https://github.com/codeneos/vlocode/compare/v0.17.7...v0.17.8) (2022-09-27)

### Bug Fixes

* stand alone vlocode does not correctly assume the API version of the connection ([eb757f8](https://github.com/codeneos/vlocode/commit/eb757f834c2438389ea27392f0a0191aec0b21ad))
* when not using an SFDX connection the content headers are not set by JSON by default ([8e95c14](https://github.com/codeneos/vlocode/commit/8e95c149d0023a649514f5e6ba2bd8bb24bce36a))
* with `strictDependencies` enabled records of external dependencies are not correctly deployed ([cfc6e92](https://github.com/codeneos/vlocode/commit/cfc6e9261c7c7b27339d28838bdd980a658f4245))

## [0.17.7](https://github.com/codeneos/vlocode/compare/v0.17.6...v0.17.7) (2022-09-27)

### Bug Fixes

* [@cache](https://github.com/cache) does not handle arrays and object-like parameters properly causing incorrect cached entries to be returned ([a2fcaea](https://github.com/codeneos/vlocode/commit/a2fcaea57e8f1ce7e98c89752026060cc43b4a11))
* `transfrom` was renamed to `mapKeys` in core package but not updated in salesforce package ([8098fe0](https://github.com/codeneos/vlocode/commit/8098fe06d953c332c4e8f154f7e4797e69774d50))
* double tooling desicribes ([9434936](https://github.com/codeneos/vlocode/commit/9434936dc25c0d0692b3b4b1bcb0d18b72e2bf37))
* service overrides not logged properly ([cec6a55](https://github.com/codeneos/vlocode/commit/cec6a552c5dd0943a7cb8258f4cd1cb522b238f6))

### Features

* add object walk and set properties methods ([69dd5f8](https://github.com/codeneos/vlocode/commit/69dd5f86ca3df0095c539f07b80994bfec3e26a7))
* add options to skip OmniScript LWC deployment ([a86d227](https://github.com/codeneos/vlocode/commit/a86d2279324e82912b7ab2b259c8b61f6c2feff7))
* expose `deploy` as separate function making it easier to invoke from external libraries ([37312d8](https://github.com/codeneos/vlocode/commit/37312d8216c301007e17ca6800338e97987e2158))
* integrate omniscript LWC compiler and activation ([8c5bfaf](https://github.com/codeneos/vlocode/commit/8c5bfaf6755358275997376c9d83ee169be10986))

## [0.17.6](https://github.com/codeneos/vlocode/compare/v0.17.5...v0.17.6) (2022-08-31)

### Bug Fixes

* await service initialization to avoid exceptions when running commands or accessing the datapack explorer before all core services have been created ([6179944](https://github.com/codeneos/vlocode/commit/6179944806afc52b522e06339dcc4f4e022fc00a))
* don't use string.replaceAll with a RegExp as ms-python.python replaces replaceAll with a method not supporting a RegExp as sub-string ([e966bbf](https://github.com/codeneos/vlocode/commit/e966bbf637aa2c3613d574be71891ae1ed6ca377))
* multiple parallel connection tests executed on reconnect instead a single one ([572b7dd](https://github.com/codeneos/vlocode/commit/572b7dd1f7b55fb53fa6a3cce590497d81497e36))

### Features

* change poll to not return an error when the callback time's out and allow throwing a custom error message on rejection ([242f5d0](https://github.com/codeneos/vlocode/commit/242f5d085e2dd8aa68b76b286776ab9eee2b82d1))
* support custom deployment specs for datapack deployment ([fed3743](https://github.com/codeneos/vlocode/commit/fed3743e70f7b7d251d441036b6b94b56425e9a3))

## [0.17.5](https://github.com/codeneos/vlocode/compare/v0.17.6...v0.17.5) (2022-08-19)

### Bug Fixes

* lerna version scripts pass invalid parameter ([23894fb](https://github.com/codeneos/vlocode/commit/23894fb08320f6492b009194f897198a52db0dda))

## [0.17.4](https://github.com/codeneos/vlocode/compare/v0.17.3...v0.17.4) (2022-08-16)

### Bug Fixes

* missing .nojekyll file causing documentation pages prefixed with _ to not render ([e854e0f](https://github.com/codeneos/vlocode/commit/e854e0f8e21dd45243fca084499a201faafc5833))
* timestamps with seconds were incorrectly converted to milliseconds and milliseconds were ignored ([18f421b](https://github.com/codeneos/vlocode/commit/18f421b21512413d3c00c2215bda3d810cd09b2c))

## [0.17.3](https://github.com/codeneos/vlocode/compare/v0.17.2...v0.17.3) (2022-08-15)

### Bug Fixes

* datapacks are not deployed due to commented out line ([0c59fea](https://github.com/codeneos/vlocode/commit/0c59feafc12fcf9a68f435952f1b22ea1d2aec40))

## [0.17.2](https://github.com/codeneos/vlocode/compare/v0.16.22...v0.17.2) (2022-08-12)

### Bug Fixes

* build issue due to tsconfig mis configuration for core package ([7956281](https://github.com/codeneos/vlocode/commit/79562814f341a5f8b8a79db0c13f1735131887e0))
* datapack explorer throws an error when expanding an empty node twice ([8265f45](https://github.com/codeneos/vlocode/commit/8265f451015382db85bb4cb9a535df14318dcdba))
* datapacks with binary data are always loaded properly due to an error in the regex detection the external file types ([8d3384f](https://github.com/codeneos/vlocode/commit/8d3384fc5f41ea9d6b5213409344c0c7003d8b9d))
* do not register command on tree-view-item when there is no click handler ([b8b2083](https://github.com/codeneos/vlocode/commit/b8b2083935def2c270e9f04726493785a2096b4c))
* duplicate fields in query generation and not replacing namespaces for query formater ([951a2eb](https://github.com/codeneos/vlocode/commit/951a2eb960d95712781fa6912b4b037aa191aa78))
* focus all writers when calling log.focus instead of only the first writer that has a focus method. ([970f5fc](https://github.com/codeneos/vlocode/commit/970f5fc96228d8aaa815640907eee78130ea7e56))
* improve code coverage of IoC container class. ([9a76f57](https://github.com/codeneos/vlocode/commit/9a76f5755e7326e51a70aaa1428d1514e8b3f0ba))
* incorrectly detect sandbox orgs as production instance (v0.17.x issue) ([4e01648](https://github.com/codeneos/vlocode/commit/4e0164880fc9455908a5c8ff310dd236ba5208ea))
* issue datapack record factory fails to convert JSON objects into strings ([5570c39](https://github.com/codeneos/vlocode/commit/5570c3974fca48ce2bc8def9ba9aea7b4dbf87bd))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([debeed8](https://github.com/codeneos/vlocode/commit/debeed8db4df22764f228a07ffc4ca86b23d5a55))
* json files are not included NPM packages ([f67a75d](https://github.com/codeneos/vlocode/commit/f67a75de03a008dd6f6825c948489f375c2ab35c))
* performance of datapack detection using cache and yielding the event loop to avoid creating an unresponsive extension host ([ba6207a](https://github.com/codeneos/vlocode/commit/ba6207a165be3db372fccbce87c9fbc3ef0b72a6))
* properly report failed records in the log when using the record batch for deployment ([29c1424](https://github.com/codeneos/vlocode/commit/29c1424d622221cc36942408b6d6dd3c81da7f1f))

### Features
* **[Datta Kale](https://github.com/dattakale86)** added step to capture alias while authorizing org ([cca5596](https://github.com/codeneos/vlocode/commit/cca55962984f34a5a4dc23d2da03908576bee125))
* +refresh+ and +open+ datapack now asks you which version to pull from the target org if the datapack has multiple versions such as OmniScripts ([3fd32bf](https://github.com/codeneos/vlocode/commit/3fd32bfd23d0247d3ff60e8ff248fca594588069))
* add icon to terminal window ([f4b9466](https://github.com/codeneos/vlocode/commit/f4b9466e70866eb2737f6d37898760052266fc76))
* add query parser to manipulate and analyze SOQL queries ([3f1a922](https://github.com/codeneos/vlocode/commit/3f1a922d9394398a30cdd55595d2b6c2ab674ff9))
* add strictDependencies option when deploying datapacks ([d884b1d](https://github.com/codeneos/vlocode/commit/d884b1d5b9793825c8e1279b08886c08b656c535))
* core IoC container should also consider shapes inherited from it's parent ([f4f9109](https://github.com/codeneos/vlocode/commit/f4f9109c525d9dfa2f252234c6b52e578cef1dcb))
* focus terminal log on certain commands ([63aeb61](https://github.com/codeneos/vlocode/commit/63aeb615a7e5282a90c4cdd768dd2756ee9096d3))
* improve datapack rename and clone commands to look at matching keys ([2d025a1](https://github.com/codeneos/vlocode/commit/2d025a17ed93e177358de91ac648302e2a4f36d7))
* initialize datapack services when switching org to speed up any Vlocode datapack commands ([107ea6b](https://github.com/codeneos/vlocode/commit/107ea6bb3df652e3f5bafd854885eb1ebc7e2a98))
* support creating connection provider from an existing jsforce connection whilst keeping all fixes and patches to jsforce active ([2da0dd6](https://github.com/codeneos/vlocode/commit/2da0dd6437f7cea180dbdddc2b4d60cdd584caa9))

### Contributors
* **[Datta Kale](https://github.com/dattakale86)**

## [0.17.1](https://github.com/codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* build issue due to tsconfig mis configuration for core package ([58b60ea](https://github.com/codeneos/vlocode/commit/58b60ea499ead676fa489948a675d3e2a5c4eaf4))
* datapack explorer throws an error when expanding an empty node twice ([9114a58](https://github.com/codeneos/vlocode/commit/9114a5803e95d8141a07fa258bbb7c94b22706e5))
* datapacks with binary data are always loaded properly due to an error in the regex detection the external file types ([5486ed1](https://github.com/codeneos/vlocode/commit/5486ed140436b1c8b2ead506b3b145ebb4802c6a))
* do not register command on tree-view-item when there is no click handler ([e7fb4eb](https://github.com/codeneos/vlocode/commit/e7fb4ebf0842d900f57ba1ee6bbde5c2e1105862))
* duplicate fields in query generation and not replacing namespaces for query formater ([c1c89a6](https://github.com/codeneos/vlocode/commit/c1c89a6b6089d037670574dcc51d93b9115cd546))
* focus all writers when calling log.focus instead of only the first writer that has a focus method. ([e0d0b67](https://github.com/codeneos/vlocode/commit/e0d0b6775dbd9b60f213a6ae9fdc389a68cb6326))
* improve code coverage of IoC container class. ([b46f2e9](https://github.com/codeneos/vlocode/commit/b46f2e96afe006cd29159b2202a9eb677b0cfa6d))
* incorrectly detect sandbox orgs as production instance (v0.17.x issue) ([1ef44c5](https://github.com/codeneos/vlocode/commit/1ef44c5942331d7c7107c8d82ff949b1646b210a))
* issue datapack record factory fails to convert JSON objects into strings ([9781fd4](https://github.com/codeneos/vlocode/commit/9781fd4e19c3f83fd0e693e8b6ec398d69abeec6))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))
* performance of datapack detection using cache and yielding the event loop to avoid creating an unresponsive extension host ([ca548c4](https://github.com/codeneos/vlocode/commit/ca548c420ca999a28c10cc1aaa14a30bb4a4edb5))
* properly report failed records in the log when using the record batch for deployment ([759196b](https://github.com/codeneos/vlocode/commit/759196b3fc6d8daa34aba86eaff7488b5ea7fcd1))

### Features

* +refresh+ and +open+ datapack now asks you which version to pull from the target org if the datapack has multiple versions such as OmniScripts ([3e61c02](https://github.com/codeneos/vlocode/commit/3e61c02ab41c30bc5bf32a3b3db54cc48b766d7c))
* add icon to terminal window ([ec46aa3](https://github.com/codeneos/vlocode/commit/ec46aa339fc021c98b3b38f23fe751be3cf3d9ce))
* add query parser to manipulate and analyze SOQL queries ([5a371bd](https://github.com/codeneos/vlocode/commit/5a371bdda56e79ad565bed6f36495b3aaf1a0833))
* add strictDependencies option when deploying datapacks ([211d776](https://github.com/codeneos/vlocode/commit/211d7764e4351560f3addfbee1c4c6ed8a3597e7))
* focus terminal log on certain commands ([ff25518](https://github.com/codeneos/vlocode/commit/ff25518c3dc539caa5acc7dee4a6582651015c0f))
* improve datapack rename and clone commands to look at matching keys ([c895408](https://github.com/codeneos/vlocode/commit/c895408748348c94c1dba2cb996c70d9722ddf66))
* initialize datapack services when switching org to speed up any Vlocode datapack commands ([210627d](https://github.com/codeneos/vlocode/commit/210627d0f5eb78316921fdb4242bd7beeff8c479))

# [0.17.0](https://github.com/codeneos/vlocode/compare/v0.16.36...v0.17.0) (2022-08-01)

### Bug Fixes

* improve code coverage of IoC container class. ([b46f2e9](https://github.com/codeneos/vlocode/commit/b46f2e96afe006cd29159b2202a9eb677b0cfa6d))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))

### Features

* add icon to terminal window ([ec46aa3](https://github.com/codeneos/vlocode/commit/ec46aa339fc021c98b3b38f23fe751be3cf3d9ce))
* add query parser to manipulate and analyze SOQL queries ([5a371bd](https://github.com/codeneos/vlocode/commit/5a371bdda56e79ad565bed6f36495b3aaf1a0833))

## [0.16.35](https://github.com/codeneos/vlocode/compare/v0.16.33...v0.16.35) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.34](https://github.com/codeneos/vlocode/compare/v0.16.33...v0.16.34) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.33](https://github.com/codeneos/vlocode/compare/v0.16.32...v0.16.33) (2022-07-14)

### Features

* core IoC container should also consider shapes inherited from it's parent ([b182665](https://github.com/codeneos/vlocode/commit/b1826656f240a8be31ce1d780fb7c51f6a439aaa))
* support creating connection provider from an existing jsforce connection whilst keeping all fixes and patches to jsforce active ([7280d18](https://github.com/codeneos/vlocode/commit/7280d184f6538e0331ed053c5fc57cab03b5162b))

## Version 0.16.20 - 2022-02-21
 - Fix deployment packages get saved before deployment
 - Fix context actions not visible for related files of datapacks and metadata
 - Fix changing log viewer visibility doesn't clear logs causing visibility switch to only affect new logs

## Version 0.16.19 - 2021-29-11
 - Fix LWC refactor doesn't read dirty files correctly causing unintended effect while refactoring of dirty LWC source files

## Version 0.16.18 - 2021-29-11
 - New auto refactor feature that detects LWC and Aura component renames and auto-updating the sources files and all component references in both HTML and JS files.
 - New create LWC Omniscript component as command in command pallet.
 - Fix metadata refresh command issue causing SF metadata not be refreshed in the correct folder.
 - Fix issue not replacing vlocityNamespace with the namespace of the vlocity package.
 - Fix issue with SF API version setting being ignored for specific commands (exec anon, etc)
 - Small performance improvements and code clean-up

## Version 0.16.17 - 2021-25-11
 - Fixed add to profiles does not work when selecting a single field
 - Fixed issue with refresh and open didn't work for certain datapacks without matching keys (#365)
 - Added multi select for exporting salesforce metadata

## Version 0.16.16 - 2021-11-07
 - Fixed #362; issue with tsconfig-paths-webpack-plugin causing relative imports in modules to be incorrectly resolved to local files if they could be resolved locally

## Version 0.16.15 - 2021-11-04
 - Add new feature to update profiles from the context menu; allows adding and removing of APEX Classes, VF Pages and CustomFields to locally versioned profiles
 - Fixed issues with View-in-salesforce command not working properly for CustomObjects, CustomFields and CustomMetadata
 - Renamed commands for consistency with official SF Extension

## Version 0.16.13 - 2021-10-18
 - Improve view in salesforce command for many Salesforce Metadata components; the command will now work for most common metadata types.
 - Fix issue causing meta-xml files to be omitted on export of Metadata
 - Make export oath for Salesforce metadata configurable
 - Fix issue where the Vlocity Metadata browser did not clear the cache on refresh causing new components or datapacks to bnot show up until switching between orgs
 - Improve readme markdown file
 - Add welcome page to Vlocity Metadata browser when no org is selected

## Version 0.16.12 - 2021-08-26
 - Fix issue causing GlobalKey verification to fail on direct deployment; this causes datapacks to not get the correct global key when deploying using direct deployment mode.

## Version 0.16.11 - 2021-08-26
 - Fix node_modules got packaged in VSIX
 
## Version 0.16.10 - 2021-08-26
 - Support for compression resource folders before deployment
 - Greatly improve ability to deploy SFDX formatted metadata
 - Fix issues where incorrectly spaced metadata would generate deployment errors
 - Fix recomposition of top-level decomposes SFDX sources (object translations)
 - Fix issue where logging would only write to the first logger in the chain
 - Separate core and util into separate modules 
### **Known issues**
 - Refreshing Salesforce Metadata in SFDX format does not map the refresh source correctly if the source file name is differs from the SFDX file name
 - Refreshing decomposed Metadata like objects does not decompose into nultiple files after refresh or retrieve

## Version 0.16.6 - 2021-08-10
 - Support pausing/resuming of deployments through the toolbar.
 - Update IoC container to track dependencies between services and support initialization of circular references.

## Version 0.16.5 - 2021-07-21
 - Fix issues causing parallel deployments being triggered from Vlocode towards Salesforce.
 - Improve deployment order for Products.
 - Retry all exceptions during datapack deployments; increases the success chances.

## Version 0.16.4 - 2021-07-21
 - Significant improvements to direct deployment mode for Vlocity
   - Verify global keys to ensure data is inserted correctly.
   - Do not disabled triggers by Default; this caused to much incorrect deployment data on new orgs
   - Auto retry fo failed records in small chunks
   - Collect warnings due to failed lookups
   - Report warnings and errors in a structured way at the end of the deployment
   - Fix multi level lookups resolved to the wrong datapacks or caused fatal exceptions
   - Better support cancellation of datapack deployments
 - Fix issue where metadata with double dots in the file name where not seen as metadata
 - Better reporting of metadata deployment errors
 - Only show dropdown menus when applicable
 - Fix issue causing refresh commands to incorrectly empty the parent folder 
 - Support for pausing the auto deployment of changes allowing easy creating of a multi file deployment
 - Update Salesforce dependencies to version 52
 - Update Vlocity Build Tools to v0.14.7
 - Add syntax and grammar for Vlocity datapacks based allowing custom icons as well as allowing for suggestions by the VSCode marketplace.
### **Known issues**
 - VisualForce remoting might not work properly when strict authentication is enabled. 
   
## Version 0.15.2 - 2021-05-17
 - Fix issue where meta files are not created for sub-folders of classes and trigger folders.
 - FIx issue where trigger meta file is not using the Trigger Tag

## Version 0.15.1 - 2021-05-06
 - Improve feedback of progress for Salesforce deployments displaying the total progress
 - Improve Salesforce metadata deployment
 - Fix an issue with certain Aura component bundles getting deployed as CustomApplications

## Version 0.15.0 - 2021-05-05
 - Support for local override configuration in a `.vlocode` configuration-file; this file allows you to store overrides that will be preferred over user and workspace configuration and can easily be versioned in git. Any workspace/user level configuration for Vlocode can be overwritten using this file such as the export directory for Vlocity metadata as well as setting a custom YAML file to ensure the export format for Vlocity metadata is correct. Sample of a `.vlocode` configuration-file:
    ```json
    {
        "customJobOptionsYaml": "./vlocity/dataPacksJobs/default.yaml",
        "projectPath": "./vlocity/src",
        "salesforce": { 
            "apiVersion": "48.0"
        }
    }
    ```
 - Add support deployment of mixed SFDX/classic metadata
 - Add support export of Salesforce Metadata using the command pallet
 - Add support open-in-salesforce for All salesforce metadata objects
 - Improve Vlocity deployment using __Direct deployment__ mode supporting more datapack types
 - Improve Salesforce deployment
 - Upgrade Vlocity build tools dependency
 - Upgrade SFDX and Salesforce ALM dependencies
 - Refactor configuration Framework
 - Support exporting of generic SObjects from Vlocode
 - Several small improvements and enhancement to improve overall user experience 
 - Upgrade build stack to webpack 5.0

## Version 0.14.9 - 2020-09-30
 - Fix unhanded rejection warnings for cache decorated functions.
 - Fix `_toRecordResult` errors caused by jsforce bug.

## Version 0.14.8 - 2020-08-07
 - Rewrite and restructure core components
 - Support new Datapack Deployment mode called `direct` this mode allows for direct deployments of datapacks using the Collections ot Bulk API from salesforce. For large deployments this significantly improves the deployment times by up to 90%.
 - All new Salesforce logs explorer which allows viewing of Salesforce logs similar to the developer console.
 - Control logging level in Salesforce for Vlocode through the VSCode UI
 - Salesforce deployments are now queued internally when multiple deployments are requested from within VSCode optimizes the developer experience.
 - Show progress when refreshing files.
 - Clone and renamed datapack commands have been improved and should yield better results.
 - Fix datapack explorer not displaying templates from multiple authors correctly.
 - Fix execute apex did not always display error message
 - New command to purge all debug logs from the server 
 - New command to set which logs to show in the logs panel

## Version 0.12.14 - 2020-03-26
 - Fix lookup datapac keys typo.
 - Fix sonar cloud token error in travis config.

## Version 0.12.13 - 2020-02-19
 - Fix refresh datapack error
 - More logging for Salesforce deployments
 - Force all production deployment requests to check only

## Version 0.12.12 - 2020-02-19
 - Auto create and delete `-meta.xml` files for classes
 - Auto create boiler plate code for APEX classes and interfaces
 - Better metadata deployment support for structured data such as email templates and documents
 - Deploy to production warning messages
 - Caching of server side info using cache decorators to speed up commands
 - Fix bug causing errors in metadata dpeloyments from not being awaited
 - Support execute anonymous APEX from vscode using SOAP API
 - Fix problems with repair data pack keys command
 - Fix Admin commands not showing
 - Update readme with more info on supported salesforce commands.
 - By default enabled Salesforce commands (can be disabled trough settings)
 - Bump all dependencies to the latest version

## Version 0.12.10 - 2019-01-14
 - Improve repair datapack dependencies command
 - Fix Admin Commands hidden in command pallette 
 - Add support for auto generation of -meta.xml files for APEX classes
 - Add quick create command for Salesforce files
 - Add execute anonymous support for APEX

## Version 0.12.10 - 2019-12-18
 - Fix icon missing for successful actions in activity view
 
## Version 0.12.9 - 2019-12-18
 - Support for Salesforce Refresh data from server
 - Fix issue with deploying certain metadata types
 - Deprecated old configuration for setting the username and password manually.
 - Added seperate option for deploy on save that only affects Salesforce metadata.
 - Switch dpeloyment mode to single-package by default
 - Filter out `Unexpected error` messages during Salesforce deployments.
 - Change UI Icon for completed activities.
 - Store Salesforce prefered API version in config.

## Version 0.12.6 - 2019-12-09
 - Fixed build error
 - Added option to select max depth during refresh and explorer export
 - Optimize datapack loading
 - Fix issue with content version query definition from Vlocity

## Version 0.12.5 - 2019-12-09
 - Fixed circular json error during export from datapack explorer.
 - Added activity explorer icons.

## Version 0.12.4 - 2019-12-08
 - Report past and running operations in the new activity screen
 - Better handling of export errors by setting ignoreAllErrors property which prevents exports from failing when a dependency fails.
 - Better handling of deploy errors.
 - More descriptive error message and better displaying of them in the UI.
 - More descriptive status messages during deploy or refresh operations
 - Fix Terminal Logging line endings do not appear correctly on mac; mac and *nix systems also use /r/n in VSCode terminals for ending lines instead of just /n
 - Fix issues with paths for post and pre job APEX; paths are slightly different due to the way VSCode resolves paths causing a deployment error for Templates and Products using default job settings.

## Version 0.12.2 - 2019-12-01
 - Revert aggressive inline optimizarion in Teser settings preventing the extension from loading properly.

## Version 0.12.1 - 2019-11-30
 - New experimental support for running Salesforce deploy and delete metadata commands.
 - Optimized VSIX package by bundling all components using webpack. This significantly decreases the extension load times providing a much better overall experience.
 - New terminal window can be used for logging messages with color support instead of the standard output channel.
 - New ability to cancel a datapack command, this will cause the command to cancel finishing up any remaining export/import work after which it will exit.
 - Fix an issues in the Datapack explorer that caused a null-ref-like exception when querying datapacks that did not have all props correctly set.
 - Fix use query instead ot queryAll as the earlier one should not be cached leading the datapack UI to show outdated items.

## Version 0.11.6 - 2019-10-17
 - Fix problem where deploy command would walk all child directories to find deployable datapacks causing all found datapacks to be deployed.

## Version 0.11.5 - 2019-09-23
 - Fix problem with project path resolution on *nix machines
 - Use both expansion path as well as project path avoiding APEX file load errors (if project path is correctly configured)

## Version 0.11.4 - 2019-08-16
 - Update clone and rename Datapack features
 - Now correctly regenerate all Global Keys for the parent and the child records during Datapack cloning
 - Fix a bug during datapack rename logic that caused properties to be replaced fully when ending on the old name.

## Version 0.11.3 - 2019-08-14
 - Fix handling of non-object types when calling createRecordProxy for incomplete datapack arrays 
 - Fix parallel execution not correctly tracking tasks
 - Fix vscode toolbar icon not using the correct size
 - Migrate to new test structure
 - Update dependencies

## Version 0.11.2 - 2019-07-31
 - Improve build parent keys algorithm.
 - Added detection for UI templates for OmniScript when scanning for datapack parents.
 - Added DataPack clone to context menu.
 - Better handling of multi level Salesforce Records.

## Version 0.11.1 - 2019-07-17
### Fixed
 - Fix export does not correctly evaluate expression
 - Improve handling of on-save-deploy events

## Version 0.11.0 - 2019-07-08
### New
 - Added support for renaming and cloning datapacks.
 - Update for compatibility with VSCode 1.36.0.
 - Update vsce ignore file in an attempt to reduce final bundle size.
### Fixed
 - Fix crash on datappack service loading without setting an override project file.
 - Remove old datapack builder code and related test cases.

## Version 0.10.7 - 2019-06-20
### Changed
 - Update Vlocity package to 1.11.1
### Fixed
 - Patch VLocity package to avoid partial exports for datapacks with more then 10 dependencies

## Version 0.10.6 - 2019-06-14
### Fixed
 - Fix export from server command fails

## Version 0.10.5 - 2019-06-05
### NewA
 - Add support for exporting all datapacks of a particular type through datapack explorer.
### Changed
 - Expend Salesforce record Proxy
 - Change logger to process entries allowing for more flexible logging

## Version 0.10.4 - 2019-06-03
### Fixed
 - Fix datapack explorer doesn't when there is no custom deploy YAML

## Version 0.10.3 - 2019-06-03
### Fixed
 - Fix open in salesforce command to not work for datapacks with versions.
 - Fix export using only direct dependencies is treated as cancellation.
 - Fix `validate` not being called when a command was invoked through the `CommandExecutor`
 - Fix error stack not logged for exceptions
### Changed
 - Update vlocity tools to 1.10.0
 - Change code to use new `@salesforce/core` libraries instead of `Salesforce-ALM` where possible
 - Refactor select org command to use `@salesforce/core`
 - Refactor Vlocity service to provide salesforce connections from a central location

## Version 0.10.2 - 2019-05-18
### New
 - Support for Custom datapacks defined in custom options YAML file
 - Sort datapacks alphabetically in datapack explorer
### Fixed
 - Open in Salesforce opened all pages in classic 
 - Open in Salesforce would not always work properly using the frontdoor session ID; for now avoid using the frontdoor.jsp

## Version 0.10.1 - 2019-05-09
### Fixed
 - Fix bug in switch org command causing null error.
 - Prevent log to take focus for each line written; instead only focus on command start.

## Version 0.10.0 - 2019-05-01
### New
 - Build parent key command
 - Admin commands from Command Pallet
 - Better detection of datapack types
### Changed
 - Update vlocity tools to 1.9.4
 - Update all dependent packages to their latest releases available from NPM

## Version 0.8.9 - 2018-12-19
### Changed
 - Update vlocity tools to 1.7.11
 - Update all dependent packages to their latest releases available from NPM

## Version 0.8.8 - 2018-12-07
### Changed
 - Update vlocity tools to 1.7.9
 - Set dependency level when doing manual export to all, none or direct which will export related object

## Version 0.8.7 - 2018-12-03
### Changed
 - Optimize plugin packaging

## Version 0.8.6 - 2018-11-28
### Security issue
- Fixed critical security issue due malicious dependency in event-stream referenced by dependency

### Changed
- Optimize and compress output using TerserPlugin

## Version 0.8.4 - 2018-11-22
### Fixed
- Update to latest stable version of Vlocity build tools (1.7.8)

## Version 0.8.2 - 2018-11-19
### Fixed
- Auto select currently open file as argument for the to be executed command instead of throwing an error.

## Version 0.8.1 - 2018-11-12
### Fixed
- Handling of rejected APEX errors

## Version 0.8.0 - 2018-11-11
### Added
- Support for loading custom override definitions
- Option to automatically activate deployed datapacks; default is on

## Version 0.7.0 - 2018-11-9
### Added
- Datapack explorer allowing you to explore and export all datapack enabled objects available in the connect org
- Simplified setup using SFDX for authorizing new orgs and setting up the deployment tools
- New status bar org switcher making it easy to change your deployment or export target during development

### Fixed
- Deploy command did not work after running an export
- Configuration changes did not reload the extension config causing settings to only reflect after a VSCode restart

## Version 0.5.1 - 2018-11-5
### Added
- Ability to export non-existing datapacks directly from within VSCode.
- Better logging to the console; disabled verbose mode by default

### Fixed
- Do not create new instances of the Vlocity build tools for every operation, prevents excessive logging

## Version 0.4.0 - 2018-11-1 (beta)
### Added
- Resolving datapack types based on folder structure
- Child items can now be resolved back to their parent datapack
- Checks to ensure all selected files are part of a datapack

### Changed
- Do not take input focus while logging, this fixes a rather nasty behavior when editing extensions config

## Version 0.3.1 - 2018-10-29 (beta)
### Added
- Support for deploying of datapacks from within VSCode
- Preview/framework AngularJS UI for viewing datapacks 
- Improved response handling for Vlocity tools results

### Changed
- Build system now uses Webpack for generating extension js files

## Version 0.2.0 (alpha)
### Changed
- Initial release of Vlocode with support for refreshing datapacks from the context menu.
- Enabled login using SFDX
- Use official Vlocity NPM package
