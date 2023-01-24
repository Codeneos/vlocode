# **Vlocode**: Vlocity/Salesforce support libraries

This is the monorepo root for all _@vlocode_ packages and the Vlocode VSCode extension. For information on the **Vlocode** VSCode extension [click here](packages/vscode-extension/README.md).

## Packages

-   [**@vlocode/util**](packages/util) - re-unable utility functions and classes
-   [**@vlocode/vlocity-deploy**](packages/vlocity-deploy) - high performance Vlocity DataPack deployment library
-   [**@vlocode/core**](packages/core) - IoC core and logging framework
-   [**@vlocode/salesforce**](packages/salesforce) - Salesforce specific classes and functions
-   [**Vlocode**](packages/vscode-extension) - Vlocode VSCode extension
-   [**@vlocode/cli**](packages/cli) - Vlocode Standalone DataPack deployment CLI

## Setup development environment

Vlocode uses `pnpm` as package manager and lerna release manager. To setup a developer environment for Vlocode you should always use the latest LTS version of node with corepack. VScode is the preferred IDE for developing and debugging.

-   check out this repository
-   enable corepack and activate the `pnpm` package manager

```shell
$ corepack enable
$ corepack prepare $(node -p "require('./package.json').packageManager") --activate
```

-   install all dependencies using pnpm, this will install all dependencies for packages in the monorepo

```shell
pnpm install
```

-   open the folder in VSCode and start coding; the `launch.json` and `tasks.json` that are part of this repository should allow you to run both the Vlocode CLI as well as debug the Vlocode extension without requiring any configuration

## Tests

Each vlocode package comes with unit tests. To run all tests simply run `pnpm test` from the root folder which will run all package tests. P

Vlocode uses jest as test runner and is pre-configured to generate a test converge report.

**Note** you should run `pnpm build` if you are not running a watcher to ensure that all packages are transpiled and linked under _node_modules_.
