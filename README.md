<img src="https://raw.githubusercontent.com/Codeneos/vlocode/main/packages/vscode-extension/resources/logo1.png" height="140">

# Vlocode &mdash; Salesforce Industries / OmniStudio (Vlocity) tooling

This is the monorepo for the [**Vlocode** VS Code extension](packages/vscode-extension/README.md) and a set of reusable `@vlocode/*` libraries that power it. Together they provide a fast, modern toolchain for Salesforce Industries, OmniStudio and standard Salesforce metadata development &mdash; without depending on the Vlocity Build Tools.

For the VS Code extension and end-user documentation see [`packages/vscode-extension`](packages/vscode-extension/README.md).

## Packages

| Package | Description |
| --- | --- |
| [**Vlocode**](packages/vscode-extension) | The VS Code extension for Salesforce Industries / OmniStudio and Salesforce metadata development. |
| [**@vlocode/cli**](packages/cli) | Stand-alone command-line Datapack deployment tool, ideal for CI/CD pipelines. |
| [**@vlocode/vlocity-deploy**](packages/vlocity-deploy) | High-performance Vlocity Datapack deployment library &mdash; the engine behind the extension and the CLI. |
| [**@vlocode/omniscript**](packages/omniscript) | Pure-JS OmniScript &rarr; LWC compiler and definition generator. |
| [**@vlocode/salesforce**](packages/salesforce) | Salesforce connectivity (REST, SOAP, Bulk, Metadata, Tooling) and high-level services. |
| [**@vlocode/apex**](packages/apex) | ANTLR4-based APEX & SOQL parser. |
| [**@vlocode/vlocity**](packages/vlocity) | Shared Vlocity domain types and matching-key logic. |
| [**@vlocode/sass**](packages/sass) | Out-of-process SASS/SCSS transpiler used to compile Vlocity UI Templates. |
| [**@vlocode/core**](packages/core) | IoC container, logging framework and filesystem abstraction. |
| [**@vlocode/util**](packages/util) | General-purpose utilities (iterables, caching, async, XML, decorators, ...). |
| [**@vlocode/vscode-webviews**](packages/vscode-webviews) | Angular webviews hosted by the VS Code extension. |

## Setup development environment

Vlocode uses `pnpm` as package manager and `lerna-lite` for releases. Use the latest LTS version of Node with corepack. VS Code is the preferred IDE.

-   Check out this repository
-   Enable corepack and activate the pinned `pnpm` version

    ```shell
    corepack enable
    corepack prepare $(node -p "require('./package.json').packageManager") --activate
    ```

-   Install all dependencies (this links the workspace packages):

    ```shell
    pnpm install
    ```

-   Open the folder in VS Code. The committed `launch.json` and `tasks.json` let you run the CLI and debug the extension without further configuration.

## Tests

Each package ships with Jest unit tests. From the repo root:

```shell
pnpm test
```

Run `pnpm build` first if you are not running a watcher, so all packages are transpiled and linked under `node_modules`.

## Beta (prerelease) versions

You can cut and publish a beta of all packages and the extension with the `release-beta` script. Beta builds:

-   use semantic-version prerelease identifiers (e.g. `1.34.0-beta.0`)
-   are published to GitHub Releases marked as *Pre-release*
-   are uploaded to the VS Code Marketplace as *Preview* (`vsce --pre-release`)
-   can be iterated (`beta.1`, `beta.2`, ...) and are removed automatically when you later publish a stable version

### Creating a beta

```shell
pnpm release-beta
```

This runs `lerna version prerelease --preid beta` which:

1.  Determines the next prerelease version for each changed package (conventional commits)
2.  Updates `lerna.json` and each `package.json` (e.g. `1.34.0-beta.0`)
3.  Commits the changes and creates a git tag `v1.34.0-beta.0`

Push the tag to trigger the GitHub Actions `Release` workflow:

```shell
git push origin HEAD --follow-tags
```

### Publishing flow (CI)

The release workflow detects prerelease versions (hyphen in the version) and automatically:

-   passes `--pre-release` to the extension packaging & publish steps
-   marks the GitHub Release as pre-release
-   publishes all `@vlocode/*` npm packages with the `beta` dist-tag (so they do not overwrite `latest`)

### Consuming beta npm packages

Install a beta version by tag or explicit version:

```shell
pnpm add @vlocode/core@beta
pnpm add @vlocode/util@1.34.0-beta.0
```

To go back to the stable channel later:

```shell
pnpm up @vlocode/core@latest @vlocode/util@latest
```

### Manually publishing the extension beta

Only needed when testing credentials locally:

```shell
pnpm publish-extension-beta
```

This builds the extension and runs `vsce publish --pre-release` in the extension package.

### Converting beta to stable

When ready for GA:

```shell
pnpm release-minor   # or release-patch / a manual lerna version command
git push origin HEAD --follow-tags
```

GitHub Actions then packages without the prerelease flag and publishes a normal release.

## License

[MIT](LICENSE)
