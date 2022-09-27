# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.17.7](https://github.com/codeneos/vlocode/compare/v0.17.6...v0.17.7) (2022-09-27)

### Features

* integrate omniscript LWC compiler and activation ([8c5bfaf](https://github.com/codeneos/vlocode/commit/8c5bfaf6755358275997376c9d83ee169be10986))

## [0.17.6](https://github.com/codeneos/vlocode/compare/v0.17.5...v0.17.6) (2022-08-31)

### Bug Fixes

* await service initialization to avoid exceptions when running commands or accessing the datapack explorer before all core services have been created ([6179944](https://github.com/codeneos/vlocode/commit/6179944806afc52b522e06339dcc4f4e022fc00a))

## [0.17.5](https://github.com/codeneos/vlocode/compare/v0.17.6...v0.17.5) (2022-08-19)

**Note:** Version bump only for package vlocode

## [0.17.4](https://github.com/codeneos/vlocode/compare/v0.17.3...v0.17.4) (2022-08-16)

**Note:** Version bump only for package vlocode

## [0.17.3](https://github.com/codeneos/vlocode/compare/v0.17.2...v0.17.3) (2022-08-15)

### Bug Fixes

* datapacks are not deployed due to commented out line ([0c59fea](https://github.com/codeneos/vlocode/commit/0c59feafc12fcf9a68f435952f1b22ea1d2aec40))

## [0.17.2](https://github.com/codeneos/vlocode/compare/v0.16.22...v0.17.2) (2022-08-12)

### Bug Fixes

* datapack explorer throws an error when expanding an empty node twice ([8265f45](https://github.com/codeneos/vlocode/commit/8265f451015382db85bb4cb9a535df14318dcdba))
* do not register command on tree-view-item when there is no click handler ([b8b2083](https://github.com/codeneos/vlocode/commit/b8b2083935def2c270e9f04726493785a2096b4c))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([debeed8](https://github.com/codeneos/vlocode/commit/debeed8db4df22764f228a07ffc4ca86b23d5a55))
* performance of datapack detection using cache and yielding the event loop to avoid creating an unresponsive extension host ([ba6207a](https://github.com/codeneos/vlocode/commit/ba6207a165be3db372fccbce87c9fbc3ef0b72a6))

### Features
* **[Datta Kale](https://github.com/dattakale86)** added step to capture alias while authorizing org ([cca5596](https://github.com/codeneos/vlocode/commit/cca55962984f34a5a4dc23d2da03908576bee125))
* +refresh+ and +open+ datapack now asks you which version to pull from the target org if the datapack has multiple versions such as OmniScripts ([3fd32bf](https://github.com/codeneos/vlocode/commit/3fd32bfd23d0247d3ff60e8ff248fca594588069))
* add icon to terminal window ([f4b9466](https://github.com/codeneos/vlocode/commit/f4b9466e70866eb2737f6d37898760052266fc76))
* add strictDependencies option when deploying datapacks ([d884b1d](https://github.com/codeneos/vlocode/commit/d884b1d5b9793825c8e1279b08886c08b656c535))
* focus terminal log on certain commands ([63aeb61](https://github.com/codeneos/vlocode/commit/63aeb615a7e5282a90c4cdd768dd2756ee9096d3))
* improve datapack rename and clone commands to look at matching keys ([2d025a1](https://github.com/codeneos/vlocode/commit/2d025a17ed93e177358de91ac648302e2a4f36d7))
* initialize datapack services when switching org to speed up any Vlocode datapack commands ([107ea6b](https://github.com/codeneos/vlocode/commit/107ea6bb3df652e3f5bafd854885eb1ebc7e2a98))

### Contributors
* **[Datta Kale](https://github.com/dattakale86)**

## [0.17.1](https://github.com/codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* datapack explorer throws an error when expanding an empty node twice ([9114a58](https://github.com/codeneos/vlocode/commit/9114a5803e95d8141a07fa258bbb7c94b22706e5))
* do not register command on tree-view-item when there is no click handler ([e7fb4eb](https://github.com/codeneos/vlocode/commit/e7fb4ebf0842d900f57ba1ee6bbde5c2e1105862))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))
* performance of datapack detection using cache and yielding the event loop to avoid creating an unresponsive extension host ([ca548c4](https://github.com/codeneos/vlocode/commit/ca548c420ca999a28c10cc1aaa14a30bb4a4edb5))

### Features

* +refresh+ and +open+ datapack now asks you which version to pull from the target org if the datapack has multiple versions such as OmniScripts ([3e61c02](https://github.com/codeneos/vlocode/commit/3e61c02ab41c30bc5bf32a3b3db54cc48b766d7c))
* add icon to terminal window ([ec46aa3](https://github.com/codeneos/vlocode/commit/ec46aa339fc021c98b3b38f23fe751be3cf3d9ce))
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
