<img src="https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/logo1.png" height="160">

[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
[![GitHub top language](https://img.shields.io/github/languages/top/codeneos/vlocode.svg?logo=github)](https://github.com/Codeneos/vlocode)
[![Downloads](https://badgen.net/vs-marketplace/d/curlybracket.vlocode)](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode)
[![Release](https://badgen.net/github/release/Codeneos/vlocode/stable)](https://github.com/Codeneos/vlocode/releases)

# Vlocode &mdash; Salesforce Industries & OmniStudio (Vlocity) for VS Code

**Vlocode is the fast, opinionated VS Code extension for Salesforce Industries / OmniStudio (Vlocity) and Salesforce metadata developers.** It deploys, retrieves and activates everything you work with day to day &mdash; Datapacks, OmniScripts, FlexCards, DataRaptors, APEX, LWC, Aura and standard metadata &mdash; right from the editor.

Vlocode is **additive** to the official [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode). Install both: keep the SFDX tooling you know and add Vlocode's faster deploy/retrieve flow and full OmniStudio support on top.

---

## Why Vlocode?

-   :rocket: **Up to 10&ndash;20&times; faster** Datapack deployments than the Vlocity Build Tools / DX
-   :package: **One extension** for SFDX metadata *and* OmniStudio/Vlocity content
-   :mag: **True delta** detection &mdash; deploy only what actually changed in the org, no git diff required
-   :zap: **Client-side OmniScript & LWC compilation** with no server-side APEX round-trips
-   :wrench: **Rich UI** &mdash; Datapack Explorer, Salesforce Logs panel, Data Mapper editor and Datapack editor
-   :bookmark_tabs: **Per-project config** via a `.vlocode` file you can commit to git
-   :key: **Uses your existing SFDX auth** &mdash; no security tokens, no copy-pasted passwords

---

## Feature highlights

### Salesforce metadata
-   Deploy, retrieve, refresh and delete metadata from the editor, explorer and command palette
-   Mixed-format support &mdash; deploy SFDX *and* classic Metadata API source in a single project
-   Deploy-on-save with a deployment queue you can pause, resume and clear
-   Auto-create and rename `-meta.xml` files when you create or rename APEX classes and triggers
-   Generate boilerplate for APEX classes, triggers, Lightning Web Components and Aura bundles
-   Execute Anonymous APEX with configurable log level and profiling; the log opens automatically in the editor
-   Send requests against the Salesforce REST API straight from a `.sfhttp` file
-   Add or remove APEX classes, fields and objects from one or more Profiles in one action
-   Highlight APEX unit-test coverage inline in the editor

![Salesforce metadata workflow](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/salesforceDemo.gif)

### Salesforce Logs panel
-   View, filter and open Apex Debug Logs straight from a dedicated VS Code panel
-   Change the debug log level on the connected org without leaving VS Code
-   Toggle between *your* logs and *all* logs on the org
-   Clear every log on the org with a single click

![Salesforce Logs panel](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/developerLogs.png)

### Vlocity / OmniStudio Datapacks
-   Deploy, refresh, export, rename and clone any Datapack from the explorer or editor
-   Browse and export every exportable object in the org from the **Datapack Explorer** sidebar
-   Open any Datapack record directly in the connected org
-   Rebuild ParentKey files and verify Datapack integrity
-   Import Vlocity multipacks and run any YAML Datapack job
-   Visual **Datapack** and **DataMapper** editors for `*_DataPack.json` and DataRaptor / OmniDataTransform files

![Datapack Explorer](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/exploreDatapack.gif)

### OmniScripts, FlexCards & IntegrationProcedures
-   **Generate an LWC** from any OmniScript &mdash; locally, in seconds, no APEX activation needed
-   (Re-)activate OmniScripts and FlexCards from the context menu
-   Convert OmniScript, FlexCard, IntegrationProcedure and DataRaptor runtimes between Vlocity (`vlocity_cmt__`) and standard OmniStudio (`omnistudio__`)
-   Scaffold a new OmniScript LWC project structure

> :camera: _Placeholder &mdash; add a screenshot of the_ `OmniScript: Generate LWC` _command running on a sample OmniScript._

### Industries / OmniStudio admin
-   **Industries Administration Console** &mdash; the most common admin commands in one quick-pick
-   Refresh Pricebook, refresh Product Hierarchy, update Product Attribute JSON, clear Platform Cache

![Industries admin commands](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/adminCommands.gif)

### Visual editors
-   **Datapack editor** &mdash; a custom editor that opens any `*_DataPack.json` file as a structured form
-   **DataMapper editor** &mdash; a custom editor for DataRaptor and OmniDataTransform definitions
-   One click to flip between the visual editor and the underlying JSON source

> :camera: _Placeholder &mdash; add a side-by-side screenshot of the Datapack Editor (left) and DataMapper Editor (right)._

---

## Getting started

1.  Install the [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode).
2.  Install **Vlocode** from the Marketplace.
3.  Open a folder that contains a Salesforce / OmniStudio project.
4.  Run **`Vlocode: Select Salesforce Org`** from the command palette and pick an authenticated SFDX org &mdash; or authenticate a new one.
5.  Right-click any metadata or Datapack file to deploy, refresh, export or open it in the org.

Vlocode uses your existing SFDX/Salesforce CLI authentication. No security-token juggling, no password fields.

---

## Typical workflows

### Deploy a single APEX class on save
```jsonc
// .vscode/settings.json
{
    "vlocity.salesforce.enabled": true,
    "vlocity.salesforce.deployOnSave": true
}
```
Save any `*.cls` or `*-meta.xml` file and Vlocode queues a delta deploy in the background. The deployment queue is visible in the status bar &mdash; you can pause, resume or clear it from the command palette.

### Deploy a Datapack folder from the context menu
Right-click the Datapack folder in the explorer &rarr; **Datapack: Deploy to Org**. Vlocode resolves dependencies client-side and deploys records in the optimal order.

### Export metadata via the command palette
Open the command palette &rarr; **Salesforce: Export/Retrieve metadata from Org** &rarr; pick the metadata types you want.

![Export metadata](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/exportMetadata.gif)

### Export a Datapack from the org
Open the command palette &rarr; **Datapack: Export from Org**, or use the Datapack Explorer to pick a record visually.

![Export a Datapack](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/exportDatapack.gif)

### Execute Anonymous APEX
Open an `.apex` scratch file, write a snippet, run **`Salesforce: Execute Anonymous APEX`** and the debug log opens automatically.

```apex
// scratch.apex
List<Account> accs = [SELECT Id, Name FROM Account LIMIT 5];
for (Account a : accs) System.debug(a.Name);
```

### Call a REST endpoint from a `.sfhttp` file
```http
GET /services/data/v60.0/sobjects/Account/describe HTTP/1.1
```
Right-click &rarr; **Salesforce: Execute REST API**. The response opens in a new editor tab.

### Generate an LWC from an OmniScript
Right-click any OmniScript folder &rarr; **OmniScript: Generate LWC**. Vlocode compiles the script definition locally and emits a ready-to-deploy LWC bundle &mdash; no Vlocity APEX activation required.

---

## Project-level configuration: `.vlocode`

Drop a `.vlocode` file at the workspace root to share defaults across your team. Values here override the VS Code user/workspace settings and can be committed to git.

```json
{
    "customJobOptionsYaml": "./vlocity/dataPacksJobs/default.yaml",
    "projectPath": "./vlocity/src",
    "salesforce": {
        "apiVersion": "60.0"
    }
}
```

---

## Settings reference

The settings you will reach for most often:

| Setting | Description |
| --- | --- |
| `vlocity.projectPath` | Path to the folder containing your Vlocity Datapacks, relative to the workspace root (e.g. `./vlocity` or `./datapacks`). |
| `vlocity.customJobOptionsYaml` | Path to a Vlocity job YAML used during deployment and export. See the [Vlocity Build options](https://github.com/vlocityinc/vlocity_build#additional-command-line-options). |
| `vlocity.sfdxUsername` | SFDX username or alias. When set, legacy username/password/loginUrl settings are ignored. |
| `vlocity.salesforce.enabled` | Enables the Salesforce metadata commands (deploy / refresh / retrieve / ...). |
| `vlocity.salesforce.apiVersion` | Salesforce API version used for all metadata operations. |
| `vlocity.salesforce.deployOnSave` | Automatically deploy modified metadata files on save. |
| `vlocity.deployOnSave` | Same, for Vlocity Datapack files. |
| `vlocity.deploy.lwcActivation` | Whether OmniScript LWCs are compiled and activated client-side during a Datapack deploy. |
| `vlocity.deploy.lwcDeploymentType` | `tooling` (default, fastest) or `metadata`. |
| `vlocity.deploy.allowUnresolvedDependencies` | Allow deployments to continue when a dependency cannot be resolved. |

All extension settings live under `vlocity.*` &mdash; type `vlocity` into the VS Code settings UI to see the full list.

---

## Requirements

-   VS Code 1.95 or newer
-   The [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) (SFDX authentication is shared with Vlocode)
-   A Salesforce org with the **Vlocity / Salesforce Industries** managed package installed if you want to use the Datapack / OmniStudio features

## Issues and feedback

Found a bug or missing feature? Please [open an issue on GitHub](https://github.com/Codeneos/vlocode/issues). PRs welcome.

## License

MIT &mdash; see [LICENSE](./LICENSE).
