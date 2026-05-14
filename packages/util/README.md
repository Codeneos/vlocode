[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Futil)

# @vlocode/util &mdash; small, sharp utilities

A toolbox of focused helpers that the rest of the Vlocode libraries lean on. Nothing here is Vlocity- or Salesforce-specific in any deep way &mdash; if you find a function here useful, take it.

## What's inside

-   **Iterables / collections** &mdash; lazy `map` / `filter` / `groupBy` / `chunk` / `unique` and friends that work on any `Iterable`
-   **Async helpers** &mdash; `Deferred`, async event emitter, cancellation tokens, debounce/throttle, retry
-   **Caching** &mdash; method/function `@cache` decorator, `TimedMap` with TTL eviction, transactional map
-   **String / object** &mdash; deep merge, deep equal, format, case conversion
-   **XML** &mdash; small, fast XML parser/serializer for Salesforce metadata files
-   **Filesystem** &mdash; recursive `find`, glob match, atomic write helpers
-   **Salesforce helpers** &mdash; ID normalization (15 &harr; 18), namespace stripping, SObject helpers
-   **SFDX helpers** &mdash; resolve usernames and build authenticated connections from your existing SFDX auth
-   **Decorators** &mdash; `@singleton`, `@cache`, `@once`, `@wrap`, validators
-   **Reflection** &mdash; lightweight type metadata utilities used by the `@vlocode/core` container

## Install

```shell
npm install @vlocode/util
```

## Example: cached method

```ts
import { cache } from '@vlocode/util';

class Pricing {
    @cache({ ttl: 60_000 })
    async getQuote(productId: string) {
        return fetch(`/api/quote/${productId}`).then(r => r.json());
    }
}
```

## Example: iterable helpers

```ts
import { Iterable } from '@vlocode/util';

const totalsByCategory = Iterable.from(orders)
    .filter(o => o.status === 'paid')
    .groupBy(o => o.category)
    .map(([category, items]) => ({
        category,
        total: items.reduce((s, i) => s + i.amount, 0),
    }))
    .toArray();
```

## Example: build a connection from SFDX

```ts
import { sfdx } from '@vlocode/util';

const connection = await sfdx.getConnection('my-scratch-alias');
const result = await connection.query('SELECT Id, Name FROM Account LIMIT 5');
```
