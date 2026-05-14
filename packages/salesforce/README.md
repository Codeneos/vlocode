[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fsalesforce)

# @vlocode/salesforce &mdash; high-level Salesforce client

A batteries-included Salesforce client library. It wraps JSForce and the Salesforce SOAP / REST / Bulk / Metadata / Tooling APIs in services with sensible defaults, retry behaviour, batching and a consistent query API.

This is the library that powers the Vlocode VS Code extension and the [`@vlocode/cli`](../cli) deployment tool. It is fully usable on its own.

## Features

-   **Connections** &mdash; build connections from SFDX usernames or aliases, refresh tokens automatically
-   **Query service** &mdash; SOQL with caching, automatic chunking and typed result mapping
-   **Query builder** &mdash; compose SOQL programmatically with parent / child relationship traversal
-   **Metadata deploy & retrieve** &mdash; SFDX *and* classic Metadata API formats, with packaging helpers
-   **Tooling API** &mdash; LWC, Aura and APEX deployment via the (fast) Tooling API
-   **Bulk API** &mdash; insert/update/upsert/delete with progress callbacks
-   **Record batch** &mdash; transparently splits large DML operations into Composite/Collections API chunks
-   **Profile service** &mdash; add or remove field / object / APEX class permissions across multiple profiles
-   **Debug logs** &mdash; stream, fetch and clear Apex Debug Logs, manage TraceFlags
-   **Anonymous APEX** &mdash; execute snippets and retrieve the resulting log in one call
-   **Schema service** &mdash; cached SObject and field describes, namespace-aware

## Install

```shell
npm install @vlocode/salesforce @vlocode/core @vlocode/util
```

## Example: query an org by SFDX alias

```ts
import { SalesforceService } from '@vlocode/salesforce';
import { container } from '@vlocode/core';

const sf = container.get(SalesforceService);
await sf.connect({ sfdxUsername: 'my-scratch-alias' });

const accounts = await sf.query<{ Id: string; Name: string }>(
    'SELECT Id, Name FROM Account WHERE Industry = :industry LIMIT 10',
    { industry: 'Technology' }
);
```

## Example: execute anonymous APEX

```ts
import { SalesforceService } from '@vlocode/salesforce';

const result = await salesforce.executeAnonymous(`
    List<Account> accs = [SELECT Id, Name FROM Account LIMIT 5];
    for (Account a : accs) System.debug(a.Name);
`);

console.log(result.success, result.log);
```

## Example: deploy metadata

```ts
import { SalesforceDeployService, PackageBuilder } from '@vlocode/salesforce';

const pkg = new PackageBuilder({ apiVersion: '60.0' })
    .addFiles(['./force-app/main/default/classes/MyClass.cls'])
    .build();

const deploy = container.get(SalesforceDeployService);
const result = await deploy.deploy(pkg, { connection });

if (!result.success) {
    for (const error of result.details.componentFailures ?? []) {
        console.error(`${error.fileName}: ${error.problem}`);
    }
}
```
