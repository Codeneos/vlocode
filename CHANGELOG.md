# Change Log
## Vlocity/Salesforce Integration for VSCode

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
