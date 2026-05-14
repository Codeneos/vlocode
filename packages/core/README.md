[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fcore)

# @vlocode/core &mdash; IoC, logging and filesystem core

The foundation that the rest of the `@vlocode/*` libraries (and the Vlocode VS Code extension) are built on. It bundles a small dependency-injection container, a configurable logging framework and a minimal filesystem abstraction that works both inside VS Code and in plain Node.js.

`@vlocode/core` has a single peer dependency on the matching version of [`@vlocode/util`](../util).

## Features

-   **IoC container** &mdash; constructor injection with `@injectable` / `@inject` decorators, scoped child containers, factory and singleton bindings
-   **Logging** &mdash; structured log entries, level filtering, multiple writers (console, VS Code output channel, in-memory, file) and per-category log levels
-   **Filesystem abstraction** &mdash; one interface, Node and VS Code implementations, so the same code runs in both worlds
-   **Deferred work queue** &mdash; debounced/coalesced background work helper

## Install

```shell
npm install @vlocode/core @vlocode/util
```

## Example: dependency injection

```ts
import { container, injectable, inject } from '@vlocode/core';

@injectable()
class TimeService {
    now() { return new Date(); }
}

@injectable()
class Greeter {
    constructor(@inject(TimeService) private readonly time: TimeService) {}

    greet(name: string) {
        return `Hello ${name} (it is ${this.time.now().toISOString()})`;
    }
}

const greeter = container.get(Greeter);
console.log(greeter.greet('world'));
```

## Example: logging

```ts
import { LogManager, LogLevel, ConsoleWriter } from '@vlocode/core';

LogManager.registerWriter(new ConsoleWriter());
LogManager.setGlobalLogLevel(LogLevel.info);

const log = LogManager.get('my-app');
log.info('Started');
log.warn('Heads up: %s', 'something looks off');
```
