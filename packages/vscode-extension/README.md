<img src="https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/logo1.png" height="160">

[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
[![GitHub top language](https://img.shields.io/github/languages/top/codeneos/vlocode.svg?logo=github)](https://github.com/Codeneos/vlocode)
[![Downloads](https://badgen.net/vs-marketplace/d/curlybracket.vlocode)](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode)
[![Release](https://badgen.net/github/release/Codeneos/vlocode/stable)](https://github.com/Codeneos/vlocode/releases)

# Vlocode &mdash; Salesforce Industries & OmniStudio (Vlocity) for VS Code

**Vlocode is the fast, opinionated VS Code extension for Salesforce Industries / OmniStudio (Vlocity) and Salesforce metadata developers.** It deploys, retrieves and activates everything you work with day-to-day &mdash; Datapacks, OmniScripts, FlexCards, DataRaptors, APEX, LWC, Aura and standard metadata &mdash; from inside the editor, without round-tripping through Vlocity Build Tools or sfdx command-lines.

Use it next to the official Salesforce Extension Pack: Vlocode adds the Industries / OmniStudio workflow and a faster deploy/retrieve experience on top of what SFDX gives you.

---

## Why Vlocode?

-   :rocket: **Up to 10&ndash;20&times; faster** Datapack deployments than the Vlocity Build Tools / DX
-   :package: **One extension** for SFDX metadata *and* OmniStudio/Vlocity content
-   :mag: **True delta** detection &mdash; deploy only what actually changed in the org, no git diff required
-   :zap: **Client-side OmniScript & LWC compilation** with no server-side APEX round-trips
-   :wrench: **Rich UI** &mdash; Datapack Explorer, Salesforce Logs panel, Data Mapper editor and Datapack editor
-   :bookmark_tabs: **Per-project config** via a `.vlocode` file you can commit to git

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

![Salesforce metadata deployment](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/salesforceDemo.gif)

### Salesforce Logs panel
-   View, filter and open Apex Debug Logs straight from a dedicated VS Code panel
-   Change the debug log level on the connected org without leaving VS Code
-   Toggle log visibility between *your* logs and *all* org logs
-   Clear all logs on the org with a single click

![Salesforce Logs panel](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/developerLogs.png)

### Vlocity / OmniStudio Datapacks
-   Deploy, refresh, export, rename and clone any Datapack from the explorer or editor
-   Browse and export all exportable objects in the org from the **Datapack Explorer** sidebar
-   Open any Datapack record directly in the connected org
-   Rebuild ParentKey files and verify Datapack integrity
-   Import Vlocity multipacks and run any YAML Datapack job
-   Visual **Datapack** and **Data Mapper** editors for `_DataPack.json` and DataRaptor / OmniDataTransform files

![Datapack Explorer](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/exploreDatapack.gif)

### OmniScripts, FlexCards & IntegrationProcedures
-   **Generate an LWC** from any OmniScript &mdash; locally, in seconds, no APEX activation needed
-   (Re-)activate OmniScripts and FlexCards from the context menu
-   Convert OmniScript, FlexCard, IntegrationProcedure and DataRaptor runtimes between Vlocity (`vlocity_cmt__`) and standard OmniStudio (`omnistudio__`)
-   Scaffold a new OmniScript LWC project structure

> _Placeholder: screenshot of the_ `OmniScript: Generate LWC` _command running on a sample OmniScript._

### Industries / OmniStudio admin
-   **Industries Administration Console** &mdash; run the most common admin commands from one quick-pick
-   Refresh Pricebook, refresh Product Hierarchy, update Product Attribute JSON, clear Platform Cache

![Admin commands](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/adminCommands.gif)

### Visual editors

> _Placeholder: side-by-side screenshot of the Datapack Editor (left) and DataMapper Editor (right)._

-   **Datapack editor** &mdash; a custom editor that opens any `*_DataPack.json` file in a structured form view
-   **DataMapper editor** &mdash; a custom editor for DataRaptor and OmniDataTransform definitions
-   Switch between the visual editor and the underlying source with one click

---

## Getting started

1.  Install the [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) (Vlocode is additive to it).
2.  Install **Vlocode** from the Marketplace.
3.  Open a folder that contains a Salesforce / OmniStudio project.
4.  Run **`Vlocode: Select Salesforce Org`** from the command palette and pick an authenticated SFDX org &mdash; or authenticate a new one.
5.  Right-click any metadata or Datapack file to deploy, refresh, export or open it in the org.

> Vlocode uses your existing SFDX/Salesforce CLI authentication. There is no separate username/password setup and no security-token juggling.

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
Save any `*.cls` or `*-meta.xml` file and Vlocode will queue a delta deploy in the background.

### Deploy a Datapack folder from the context menu
Right-click the Datapack folder in the explorer &rarr; **Datapack: Deploy to Org**. Vlocode resolves dependencies client-side and deploys records in the optimal order.

![Deploy a Datapack](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/exportDatapack.gif)

### Export metadata via the command palette
Open the command palette &rarr; **Salesforce: Export/Retrieve metadata from Org** &rarr; pick the metadata types you want.

![Export metadata](https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/exportMetadata.gif)

### Execute Anonymous APEX
Open an `.apex` scratch file, write a snippet, run **`Salesforce: Execute Anonymous APEX`** and the debug log opens automatically.

```apex
// scratch.apex
List<Account> accs = [SELECT Id, Name FROM Account LIMIT 5];
for (Account a : accs) System.debug(a.Name);
```

### Generate an LWC from an OmniScript
Right-click any OmniScript folder &rarr; **OmniScript: Generate LWC**. Vlocode compiles the script definition locally and emits a ready-to-deploy LWC bundle &mdash; no Vlocity APEX activation required.

---

## Project-level configuration: `.vlocode`

Drop a `.vlocode` file at the workspace root to share defaults with the rest of your team. Settings here override the VS Code user/workspace settings and can be committed to git.

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

A few of the settings you will reach for most often:

| Setting | Description |
| --- | --- |
| `vlocity.projectPath` | Path to the folder containing your Vlocity Datapacks, relative to the workspace root (e.g. `./vlocity` or `./datapacks`). |
| `vlocity.customJobOptionsYaml` | Path to a Vlocity job YAML used during deployment and export. See the [Vlocity Build options](https://github.com/vlocityinc/vlocity_build#additional-command-line-options). |
| `vlocity.sfdxUsername` | SFDX username or alias. When set, the legacy username/password/loginUrl settings are ignored. |
| `vlocity.salesforce.enabled` | Enables the Salesforce metadata commands (deploy / refresh / retrieve / etc.). |
| `vlocity.salesforce.apiVersion` | Salesforce API version used for all metadata operations. |
| `vlocity.salesforce.deployOnSave` | Automatically deploy modified metadata files on save. |
| `vlocity.deployOnSave` | Same for Vlocity Datapack files. |
| `vlocity.deploy.lwcActivation` | Controls whether OmniScript LWCs are compiled and activated client-side during a Datapack deploy. |
| `vlocity.deploy.lwcDeploymentType` | `tooling` (default, fastest) or `metadata`. |
| `vlocity.deploy.allowUnresolvedDependencies` | Allow deployments to continue when a dependency cannot be resolved. |

All extension settings live under `vlocity.*` &mdash; type `vlocity` into the VS Code settings UI to see the full list.

---

## Requirements

-   VS Code 1.95 or newer
-   The [Salesforce Extension Pack](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) (recommended; SFDX auth is shared with Vlocode)
-   A Salesforce org with the **Vlocity / Salesforce Industries** managed package installed if you want to use the Datapack / OmniStudio features

## Issues and feedback

Found a bug or missing feature? Please [open an issue on GitHub](https://github.com/Codeneos/vlocode/issues). PRs are welcome.

## License

MIT &mdash; see [LICENSE](./LICENSE).
