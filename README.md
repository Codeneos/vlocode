<img src="https://raw.githubusercontent.com/Codeneos/vlocode/master/images/logo1.png" height="160px">

# VloCode for Visual Studio Code

This extension provides an alternate way for developing, extracting and deploying Vlocity data with Visual Studio Code.  
It is targeted at Vlocity developers who want a lightweight and fast way to work with Vlocity components and datapacks.
There's no complicated setup process or project configurations, no external apps to keep open, and no jarring errors knocking you out of your flow.

## Features

* Uses the standard Vlocity NPM package
* Support SFDX username or alias to login to Salesforce
  > **Tip** Setup SFDX (see Requirements) to avoid storing your Salesforce password and security token as plain text workspace configuration
* Retrieve/refresh Vlocity datapacks from within Visual Studio Code
* (WIP) Deploy single or multiple Vlocity datapacks from within Visual Studio Code
* (WIP) Automaticly update Vlocity templates when edited from Visual Studio Code

## Requirements

Vlocode works best with SFDX for authentication with salesforce, download the SFDX CLI tools from <https://developer.salesforce.com/tools/sfdxcli>. 
After installing SFDX authorize your development sanbox using the following command:
```
sfdx force:auth:web:login -r https://test.salesforce.com
```

## Extension Settings

This extension contributes the following settings:

* `vlocity.projectPath`: Path to the folder comtaining the Vlocity datapacks relative to the workspace's root folder, for example:
  - `./vlocity`
  - `./datapacks`
* `vlocity.verbose`: Enable verbose loging to the output window
* `vlocity.sfdxUsername`: SFDX username; when this is specified the username, password, loginUrl and instanceUrl are ignored.

## Known Issues

* Deploying of datapacks from VSCode does not yet work
* Onsave handler that detects changes on file level is currently disabled
* Datapacks are not validated on validity before a refresh
* The temp folder used by the Vlocity NPM package is hardcoded

## Release Notes

### Version 0.2.0 (alpha -)

* Initial release of VloCode with support for refreshing datapacks from the context menu.
* Enabled login using SFDX
* Use official Vlocity NPM package
