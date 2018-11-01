<img src="https://raw.githubusercontent.com/Codeneos/vlocode/master/resources/logo1.png" height="160">

# Vlocode for Visual Studio Code

This extension provides an alternate way for developing, extracting and deploying Vlocity data with Visual Studio Code.  
It is targeted at Vlocity developers who want to develop Vlocity components and updated datapacks from an IDE instead of using the web based UI available in Salesforce.
There's no complicated setup process or bothersome project configuration to maintain.

<img src="https://raw.githubusercontent.com/Codeneos/vlocode/master/resources/refreshDatapack.gif" width="898">

## Features

* Retrieve/refresh Vlocity datapacks from within Visual Studio Code
* Deploy a single or multiple Vlocity datapacks from within Visual Studio Code
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

* Custom expand definition overrides are not yet loaded.