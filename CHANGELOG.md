# Changelog Vlocity Salesforce Integration for VSCode

## [0.12.5] - 2019-12-19
 - Fixed circular json error during export from datapack explorer.
 - Added activity explorer icons.

## [0.12.4] - 2019-12-19
 - Report past and running operations in the new activity screen
 - Better handling of export errors by setting ignoreAllErrors property which prevents exports from failing when a dependency fails.
 - Better handling of deploy errors.
 - More descriptive error message and better displaying of them in the UI.
 - More descriptive status messages during deploy or refresh operations
 - Fix Terminal Logging line endings do not appear correctly on mac; mac and *nix systems also use /r/n in VSCode terminals for ending lines instead of just /n
 - Fix issues with paths for post and pre job APEX; paths are slightly different due to the way VSCode resolves paths causing a deployment error for Templates and Products using default job settings.

## [0.12.2] - 2019-12-01
 - Revert aggressive inline optimizarion in Teser settings preventing the extension from loading properly.

## [0.12.1] - 2019-11-30
 - New experimental support for running Salesforce deploy and delete metadata commands.
 - Optimized VSIX package by bundling all components using webpack. This significantly decreases the extension load times providing a much better overall experience.
 - New terminal window can be used for logging messages with color support instead of the standard output channel.
 - New ability to cancel a datapack command, this will cause the command to cancel finishing up any remaining export/import work after which it will exit.
 - Fix an issues in the Datapack explorer that caused a null-ref-like exception when querying datapacks that did not have all props correctly set.
 - Fix use query instead ot queryAll as the earlier one should not be cached leading the datapack UI to show outdated items.

## [0.11.6] - 2019-10-17
 - Fix problem where deploy command would walk all child directories to find deployable datapacks causing all found datapacks to be deployed.

## [0.11.5] - 2019-09-23
 - Fix problem with project path resolution on *nix machines
 - Use both expansion path as well as project path avoiding APEX file load errors (if project path is correctly configured)

## [0.11.4] - 2019-08-16
 - Update clone and rename Datapack features
 - Now correctly regenerate all Global Keys for the parent and the child records during Datapack cloning
 - Fix a bug during datapack rename logic that caused properties to be replaced fully when ending on the old name.

## [0.11.3] - 2019-08-14
 - Fix handling of non-object types when calling createRecordProxy for incomplete datapack arrays 
 - Fix parallel execution not correctly tracking tasks
 - Fix vscode toolbar icon not using the correct size
 - Migrate to new test structure
 - Update dependencies

## [0.11.2] - 2019-07-31
 - Improve build parent keys algorithm.
 - Added detection for UI templates for OmniScript when scanning for datapack parents.
 - Added DataPack clone to context menu.
 - Better handling of multi level Salesforce Records.

## [0.11.1] - 2019-07-17
### Fixed
 - Fix export does not correctly evaluate expression
 - Improve handling of on-save-deploy events

## [0.11.0] - 2019-07-08
### New
 - Added support for renaming and cloning datapacks.
 - Update for compatibility with VSCode 1.36.0.
 - Update vsce ignore file in an attempt to reduce final bundle size.
### Fixed
 - Fix crash on datappack service loading without setting an override project file.
 - Remove old datapack builder code and related test cases.

## [0.10.7] - 2019-06-20
### Changed
 - Update Vlocity package to 1.11.1
### Fixed
 - Patch VLocity package to avoid partial exports for datapacks with more then 10 dependencies

## [0.10.6] - 2019-06-14
### Fixed
 - Fix export from server command fails

## [0.10.5] - 2019-06-05
### NewA
 - Add support for exporting all datapacks of a particular type through datapack explorer.
### Changed
 - Expend Salesforce record Proxy
 - Change logger to process entries allowing for more flexible logging

## [0.10.4] - 2019-06-03
### Fixed
 - Fix datapack explorer doesn't when there is no custom deploy YAML

## [0.10.3] - 2019-06-03
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

## [0.10.2] - 2019-05-18
### New
 - Support for Custom datapacks defined in custom options YAML file
 - Sort datapacks alphabetically in datapack explorer
### Fixed
 - Open in Salesforce opened all pages in classic 
 - Open in Salesforce would not always work properly using the frontdoor session ID; for now avoid using the frontdoor.jsp


## [0.10.1] - 2019-05-09
### Fixed
 - Fix bug in switch org command causing null error.
 - Prevent log to take focus for each line written; instead only focus on command start.

## [0.10.0] - 2019-05-01
### New
 - Build parent key command
 - Admin commands from Command Pallet
 - Better detection of datapack types
### Changed
 - Update vlocity tools to 1.9.4
 - Update all dependent packages to their latest releases available from NPM

## [0.8.9] - 2018-12-19
### Changed
 - Update vlocity tools to 1.7.11
 - Update all dependent packages to their latest releases available from NPM

## [0.8.8] - 2018-12-07
### Changed
 - Update vlocity tools to 1.7.9
 - Set dependency level when doing manual export to all, none or direct which will export related object

## [0.8.7] - 2018-12-03
### Changed
 - Optimize plugin packaging

## [0.8.6] - 2018-11-28
### Security issue
- Fixed critical security issue due malicious dependency in event-stream referenced by dependency

### Changed
- Optimize and compress output using TerserPlugin

## [0.8.4] - 2018-11-22
### Fixed
- Update to latest stable version of Vlocity build tools (1.7.8)

## [0.8.2] - 2018-11-19
### Fixed
- Auto select currently open file as argument for the to be executed command instead of throwing an error.

## [0.8.1] - 2018-11-12
### Fixed
- Handling of rejected APEX errors

## [0.8.0] - 2018-11-11
### Added
- Support for loading custom override definitions
- Option to automatically activate deployed datapacks; default is on

## [0.7.0] - 2018-11-9
### Added
- Datapack explorer allowing you to explore and export all datapack enabled objects available in the connect org
- Simplified setup using SFDX for authorizing new orgs and setting up the deployment tools
- New status bar org switcher making it easy to change your deployment or export target during development

### Fixed
- Deploy command did not work after running an export
- Configuration changes did not reload the extension config causing settings to only reflect after a VSCode restart

## [0.5.1] - 2018-11-5
### Added
- Ability to export non-existing datapacks directly from within VSCode.
- Better logging to the console; disabled verbose mode by default

### Fixed
- Do not create new instances of the Vlocity build tools for every operation, prevents excessive logging

## [0.4.0] - 2018-11-1 (beta)
### Added
- Resolving datapack types based on folder structure
- Child items can now be resolved back to their parent datapack
- Checks to ensure all selected files are part of a datapack

### Changed
- Do not take input focus while logging, this fixes a rather nasty behavior when editing extensions config

## [0.3.1] - 2018-10-29 (beta)
### Added
- Support for deploying of datapacks from within VSCode
- Preview/framework AngularJS UI for viewing datapacks 
- Improved response handling for Vlocity tools results

### Changed
- Build system now uses Webpack for generating extension js files

## [0.2.0] (alpha)
### Changed
- Initial release of Vlocode with support for refreshing datapacks from the context menu.
- Enabled login using SFDX
- Use official Vlocity NPM package
