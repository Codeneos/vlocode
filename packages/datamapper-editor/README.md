# DataMapper Editor

Angular webview UI for editing OmniStudio DataMapper/DataRaptor definitions inside the Vlocode VS Code extension.

The editor is intentionally a separate workspace package because it uses the Angular application builder, while the VS Code extension package uses `tsdown`.

## What It Edits

The UI works against the shared JSON DataMapper model sent by the VS Code custom editor provider.

Supported DataMapper kinds:

- Extract: extraction objects, optional formulas, and output mappings.
- Load: load objects, object links, optional formulas, and input-to-domain-object mappings.
- Transform: formulas and JSON-to-JSON mappings.

The source file format is handled by the extension provider:

- Datapack JSON is loaded and saved through datapack services.
- Metadata XML is converted to the JSON model before rendering and converted back on save.

## Package Layout

- `src/main.ts`: standalone Angular bootstrap, app state, VS Code webview message handling.
- `src/app/app.component.html`: top-level shell, toolbar, tabs, and panel routing.
- `src/app/components`: reusable UI panels and controls.
- `src/app/models`: pure model helpers for grouping, path handling, and DataMapper kind detection.
- `src/styles.scss`: global VS Code-themed styling for the webview.

## VS Code Integration

The extension integration lives in:

`../vscode-extension/src/webviews/dataMapperEditorProvider.ts`

The provider owns file IO, metadata conversion, datapack persistence, deploy/refresh/open-in-Salesforce commands, field metadata loading, and the custom editor registration.

The webview and provider communicate with `postMessage`.

Messages from webview to extension:

- `ready`
- `save`
- `deploy`
- `openSalesforce`
- `refresh`
- `refreshFields`

Messages from extension to webview:

- `load`
- `fields`
- `error`

## Build

From the repository root:

```bash
pnpm --filter @vlocode/datamapper-editor build
```

The production build writes directly to:

`../vscode-extension/resources/datamapper-editor`

This output is bundled with the VS Code extension.

For development:

```bash
pnpm --filter @vlocode/datamapper-editor watch
```

The VS Code extension build also runs this package build first:

```bash
pnpm --filter vlocode build
```

## Styling

The editor uses SCSS and VS Code theme tokens. Keep styling restrained and native to VS Code:

- Prefer `var(--vscode-*)` tokens over hard-coded colors.
- Keep BEM-style class names.
- Use semantic HTML first, with small utility-like mixins only in `styles.scss`.
- Keep component templates free of decorative markup unless it is needed for layout or accessibility.

Codicons are loaded globally from `@vscode/codicons`.

## Local Preview Notes

The app can render outside VS Code for basic visual checks, but most real behavior depends on `acquireVsCodeApi()` and provider messages. When opened standalone, the app falls back to an empty model.

For full behavior, run the VS Code extension host and open a supported DataMapper file through the custom editor.

## Verification

Minimum check after changing this package:

```bash
pnpm --filter @vlocode/datamapper-editor build
```

If extension commands, webview messages, or generated assets changed, also run:

```bash
pnpm --filter vlocode build
```
