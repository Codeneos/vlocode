[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fcli)

# vlocode-cli &mdash; a hyper-fast :rocket: Vlocity Datapack deployment CLI

A stand-alone command-line tool for deploying **any** Vlocity / OmniStudio Datapack JSON to any Salesforce org. Built as a thin front-end around [`@vlocode/vlocity-deploy`](../vlocity-deploy) &mdash; no dependency on the Vlocity Build Tools.

## Why use it?

-   :rocket: **10&ndash;20&times; faster** than the Vlocity Build Tools / DX on typical projects
-   :computer: Dependency resolution and record conversion happen **client-side**
-   :rainbow: **True delta** &mdash; compares source against the org and only deploys what actually changed
-   :package: Single self-contained binary &mdash; trivial to drop into CI/CD
-   :lock: Reproducible builds &mdash; all dependencies are bundled and pinned

## What it does *not* do

-   It deploys; it does not export/retrieve Datapacks
-   It does not generate FlexCard LWC components (planned)
-   It is a CLI; for a UI use the [Vlocode VS Code extension](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode)

## Install

```shell
npm i -g @vlocode/cli
```

> If you intend to script against the deployment logic from your own Node project, depend on [`@vlocode/vlocity-deploy`](../vlocity-deploy) directly &mdash; this CLI is bundled and not meant to be imported as a library.

## Quick start

Deploy a folder of Datapacks via interactive OAuth (production orgs need `--instance login.salesforce.com`):

```shell
vlocode deploy ./path/to/datapacks
```

Deploy using an existing SFDX alias or username:

```shell
vlocode deploy ./path/to/datapacks -u my-sandbox
```

Run only the OmniScript activation step on the connected org:

```shell
vlocode activate "MACD/*" -u my-sandbox
```

## Commands

Run `vlocode --help` for the full list, or `vlocode <command> --help` for details.

### `vlocode deploy`

```text
Usage: vlocode deploy [options] <folder>

Deploy datapacks to Salesforce

Options:
  -v, --verbose               enable verbose logging (default: false)
  --debug                     print call stack when an unhandled error occurs (default: false)
  -u, --user <username>       Salesforce username or alias of the org to deploy to
  -i, --instance <url>        instance URL (default: "test.salesforce.com")
  --purge-dependencies        delete embedded dependencies with matching keys after the primary datapack record is
                              deployed. By default Vlocode only deletes child records without a matching-key
                              configuration; with this flag it also deletes child records that have lookup
                              relationships to the primary datapack record. (default: false)
  --lookup-failed             look up the Ids of records that failed to deploy but are dependencies for other parts
                              of the deployment (default: false)
  --retry-count <count>       number of times a record deployment is retried before failing it (default: 1)
  --bulk-api                  use the Salesforce Bulk API to update and insert records (default: false)
  --delta                     compare source datapacks against the org and only deploy what changed (default: false)
  --strict-dependencies       enforce datapacks with dependencies on records inside other datapacks are fully
                              deployed before dependents start. Slower but safer if you hit ordering issues.
                              (default: false)
  --skip-lwc                  skip LWC activation for LWC-enabled OmniScripts (default: false)
  --use-metadata-api          deploy LWC components via the Metadata API (slower) instead of the Tooling API
                              (default: false)
  --remote-script-activation  activate OmniScripts via anonymous APEX on the server. By default Vlocode generates
                              the script definition locally, which is faster and more reliable. Enable this if you
                              hit discrepancies between locally and server-activated scripts. (default: false)
  -h, --help                  display help for command
```

### `vlocode activate`

```text
Usage: vlocode activate [options] [scriptFilter]

Activate OmniScripts in Salesforce and deploy their LWC components

Arguments:
  scriptFilter            Salesforce <type>/<subType>(/<language>) filter of the scripts to activate. Supports
                          wildcards, e.g. "MACD/*" to activate multiple scripts.

Options:
  -v, --verbose           enable verbose logging (default: false)
  --debug                 print call stack when an unhandled error occurs (default: false)
  -u, --user <username>   Salesforce username or alias of the org
  -i, --instance <url>    Salesforce instance URL (default: "test.salesforce.com")
  --parallel-activations  number of activations to run in parallel
  --skip-lwc              skip LWC activation for LWC-enabled OmniScripts (default: false)
  --use-metadata-api      deploy LWC components via the Metadata API (slower) instead of the Tooling API
  --remote-activation     activate OmniScripts via anonymous APEX (see notes on the deploy command)
  -h, --help              display help for command
```

## FAQ

**Q: Does Vlocode deploy LWC-enabled OmniScripts?**
A: Yes. Vlocode deploys the OmniScript, compiles the LWC locally and deploys it via the Tooling API (default) or the Metadata API. The Tooling API can run in parallel to an ongoing metadata deployment.

**Q: Does Vlocode honour custom Datapack fields that are not part of the standard definition?**
A: Yes. Vlocode loads the Datapack, matches its fields against the SObject schema in the target org, deploys the ones that exist, and reports errors for the ones that do not.

**Q: Vlocode does not delete Product Child Items (PCI) that I removed from the Datapack &mdash; why?**
A: Vlocode is safe-by-default and does not delete records unless asked to. The recommended approach for the product hierarchy is to **disable** a PCI rather than delete it, because deletions have cascading effects on cached content and existing Assets. For non-production orgs you can pass `--purge-dependencies` to delete embedded records before re-deploying.

**Q: Should I prefer `--bulk-api` for production deployments?**
A: No. The Bulk API runs at lower priority and depends on available org resources, so its performance is more variable than the standard Collections API. Use it to save API limits, not to go faster.

**Q: When I activate my OmniScript from the UI it looks different from the one deployed by Vlocode &mdash; why?**
A: By default Vlocode generates the script definition locally instead of calling Vlocity's remote APEX activation. The implementation is well-tested but the OmniStudio managed package keeps evolving, so mismatches are possible. If you hit one, fall back to `--remote-script-activation` and please open a bug so we can update the local generator.

**Q: Does Vlocode compile FlexCards into LWC components?**
A: Not yet. The activation logic is significantly more involved than OmniScript and is still being ported. The VS Code extension can activate FlexCards via the standard Vlocity flow in the meantime.

**Q: We want help adopting Vlocode on a project &mdash; can you support us?**
A: Yes, support engagements are available on request.
