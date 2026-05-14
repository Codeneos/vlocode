[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fomniscript)

# @vlocode/omniscript &mdash; fast OmniScript &rarr; LWC compiler

A pure-JavaScript library that generates **Vlocity / OmniStudio OmniScript definitions and Lightning Web Components** straight from the OmniScript JSON source files. No APEX REST calls, no DataRaptors, no round-trip to the org.

This is what powers the `OmniScript: Generate LWC` and `OmniScript: (Re-)Activate` commands in the [Vlocode VS Code extension](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode) and the OmniScript activation step in [`@vlocode/cli`](../cli).

## Features

-   **Local script definition generation** &mdash; produce the activated `OmniScript` JSON locally, no anonymous APEX needed
-   **LWC component generation** &mdash; emit a ready-to-deploy LWC bundle (`.html`, `.js`, `.js-meta.xml`, `.css`) for any OmniScript
-   **Bulk activation** &mdash; activate many OmniScripts in parallel, dramatically faster than the standard activation flow
-   **Namespace-aware** &mdash; works against both Vlocity (`vlocity_cmt__`) and standard OmniStudio (`omnistudio__`) orgs
-   **No managed-package APEX dependency** &mdash; avoids SOQL governor limit failures on large scripts

## Install

```shell
npm install @vlocode/omniscript @vlocode/salesforce @vlocode/core
```

## Example: generate an LWC from an OmniScript

```ts
import { OmniScriptLwcCompiler } from '@vlocode/omniscript';
import { container } from '@vlocode/core';

const compiler = container.get(OmniScriptLwcCompiler);
const bundle = await compiler.compile({
    type: 'Account',
    subType: 'Onboarding',
    language: 'English',
    definition,   // OmniScript definition JSON
});

for (const file of bundle.files) {
    console.log(file.path, file.content.length);
}
```

## Example: activate scripts in a connected org

```ts
import { OmniScriptActivator } from '@vlocode/omniscript';

const activator = container.get(OmniScriptActivator);
await activator.activate({
    connection,                          // @vlocode/salesforce connection
    filter: 'Account/Onboarding/*',      // type/subType/language wildcard
    parallel: 4,
});
```
