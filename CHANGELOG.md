# Changelog Vlocode

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
