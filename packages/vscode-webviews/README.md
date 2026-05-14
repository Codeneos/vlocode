# @vlocode/vscode-webviews

Angular applications rendered inside the Vlocode VS Code extension's webview host. This package owns multiple webview build targets so shared styling and reusable UI code can stay in one place, without spinning up a new workspace package for every editor.

Currently shipped webviews:

-   **Datapack editor** &mdash; structured editor for `*_DataPack.json` files
-   **DataMapper editor** &mdash; structured editor for DataRaptor / OmniDataTransform definitions

> This is an internal package &mdash; it is not published to npm and is not intended to be consumed outside of this repository.

## Build

```bash
pnpm --filter @vlocode/vscode-webviews build
pnpm --filter @vlocode/vscode-webviews build:datapack
pnpm --filter @vlocode/vscode-webviews build:datamapper
```

Outputs are written into the VS Code extension package so they ship as static assets:

-   `packages/vscode-extension/resources/datapack-editor`
-   `packages/vscode-extension/resources/datamapper-editor`
