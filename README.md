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

## Beta (Prerelease) Versions

You can cut and publish a beta (preview) version of all packages and the VSCode extension using the new `release-beta` script. Beta builds:

- use semantic version prerelease identifiers (e.g. `1.34.0-beta.0`)
- are published to GitHub Releases marked as *Pre-release*
- are uploaded to the VSCode Marketplace as *Preview* (using `vsce --pre-release`)
- can be iterated (`beta.1`, `beta.2`, ...); when you later publish a stable version (e.g. `1.34.0`) the preview flag is removed automatically by Marketplace

### Creating a beta

```shell
pnpm release-beta
```

This runs `lerna version prerelease --preid beta` which:

1. Determines the next prerelease version for each changed package (conventional commits)
2. Updates `lerna.json` + individual `package.json` versions (e.g. `1.34.0-beta.0`)
3. Commits the changes and creates a git tag `v1.34.0-beta.0`

Push the tag to trigger the CircleCI `release` workflow:

```shell
git push origin HEAD --follow-tags
```

### Publishing flow (CI)

The existing CircleCI pipeline detects prerelease versions (hyphen in the version) and automatically:

- passes `--pre-release` to the extension packaging & publish steps
- passes `--pre-release` to the GitHub release creation (via `ghr`)
- publishes all `@vlocode/*` npm packages with the `beta` dist-tag (so they don't overwrite `latest`)

### Consuming beta npm packages

Install a beta version by either specifying the full version or using the `beta` tag:

```shell
pnpm add @vlocode/core@beta
pnpm add @vlocode/util@1.34.0-beta.0   # explicit version example
```

To upgrade back to the stable channel later:

```shell
pnpm up @vlocode/core@latest @vlocode/util@latest
```

### Manually publishing the extension beta (optional)

If you need to publish locally (e.g. testing credentials):

```shell
pnpm publish-extension-beta
```

This builds the extension and runs `vsce publish --pre-release` in the extension package.

### Converting beta to stable

When ready for GA:

```shell
pnpm release-minor   # or release-patch / manual lerna version command
git push origin HEAD --follow-tags
```

CircleCI will package without the prerelease flag and publish a normal release.
