[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fvlocity)

# @vlocode/vlocity &mdash; shared Vlocity / OmniStudio building blocks

The shared domain layer used by [`@vlocode/vlocity-deploy`](../vlocity-deploy), [`@vlocode/omniscript`](../omniscript), the [`@vlocode/cli`](../cli) tool and the Vlocode VS Code extension. If you are building your own OmniStudio tooling on top of `@vlocode`, this is most likely a transitive dependency you do not need to import directly.

## What's inside

-   **Datapack types** &mdash; type-safe representations of Vlocity Datapacks
-   **Datapack loader** &mdash; load Datapack folder structures from disk
-   **Matching key service** &mdash; resolves `DRMatchingKey__mdt` records and applies them when comparing source records against the target org
-   **Namespace handling** &mdash; bridges the `vlocity_cmt__` and `omnistudio__` namespaces transparently
-   **Vlocity manifest helpers** &mdash; produce and parse the Vlocity build manifest format

## Install

```shell
npm install @vlocode/vlocity
```

## See also

-   [`@vlocode/vlocity-deploy`](../vlocity-deploy) &mdash; the deployment engine that consumes these types
-   [`@vlocode/omniscript`](../omniscript) &mdash; the OmniScript &rarr; LWC compiler
