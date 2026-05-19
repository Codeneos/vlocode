# VS Code Webviews

Angular applications rendered inside the VS Code extension webview host.

This package owns multiple webview build targets so shared styling and reusable UI code can stay in one place without adding a new workspace package for every editor.

## Build

```bash
pnpm --filter @vlocode/vscode-webviews build
pnpm --filter @vlocode/vscode-webviews watch
```

Build outputs are written to:

- `packages/vscode-extension/resources/datapack-editor`
- `packages/vscode-extension/resources/datamapper-editor`
- `packages/vscode-extension/resources/integration-procedure-editor`
