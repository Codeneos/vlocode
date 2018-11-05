<img src="https://raw.githubusercontent.com/Codeneos/vlocode/master/resources/logo1.png" height="160">

# Vlocode: Vlocity development tools for Visual Studio Code

This extension provides functionality for deploying, extracting and refreshing Vlocity datapacks from with Visual Studio Code.
It is targeted at Vlocity/Salesforce developers who want work on Vlocity data from within their IDE and have the most commonly used datapacks comands available directly from with Visual Studio Code. 

In the background this extension relies of the official Vlocity build tools library for executing the deployment and export jobs, meaning the results will be the same way as produced by your CI environment. 

<img src="https://raw.githubusercontent.com/Codeneos/vlocode/master/resources/refreshDatapack.gif" width="898">

## Features

* Retrieve/refresh Vlocity datapacks from within Visual Studio Code
* Deploy a single or multiple Vlocity datapacks from within Visual Studio Code
* Export any datapack enabled object directly from within VSCode.
* Support SFDX username or alias to login to Salesforce
  > **Tip** Setup SFDX (see Requirements) to avoid storing your Salesforce password and security token as plain text workspace configuration

## Planned Features

* Automatically deployment of Vlocity datapacks when edited from Visual Studio Code
* Recompiling (deactivate -> activate flow) of OmniScripts after changing a template to directly see the effects in your browsers.
* Simple OmniScript editor inside VisualStudio code using Webview API
* GUI for editing datapacks from within VSCode (see preview UI based on angularJS in version 0.3.1)

## Requirements

Vlocode works best with SFDX for authentication with salesforce, download the SFDX CLI tools from <https://developer.salesforce.com/tools/sfdxcli>. 
After installing SFDX authorize your development sandbox using the following command:
```
sfdx force:auth:web:login -r https://test.salesforce.com
```

## Extension Settings

This extension contributes the following settings:

* `vlocity.projectPath`: Path to the folder containing the Vlocity datapacks relative to the workspace's root folder, for example:
  - `./vlocity`
  - `./datapacks`
* `vlocity.verbose`: Enable verbose logging to the output window
* `vlocity.sfdxUsername`: SFDX username; when this is specified the username, password, loginUrl and instanceUrl are ignored.

## Known Issues

* Custom expand definitions and overrides are not loaded.