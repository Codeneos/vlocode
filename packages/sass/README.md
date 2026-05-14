[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fsass)

# @vlocode/sass &mdash; SCSS transpiler for Vlocity UI Templates

A small Node.js wrapper around [`sass`](https://www.npmjs.com/package/sass) that transpiles the `.sess` / `.scss` files shipped with Vlocity UI Templates into CSS, out-of-process so the host application stays responsive.

Used by the [Vlocode VS Code extension](https://marketplace.visualstudio.com/items?itemName=curlybracket.vlocode) to compile UI Template styles when deploying to Salesforce.

## Features

-   Transpile `.sess` / `.scss` files to CSS
-   Resolves `@import` and `@use` dependencies
-   Variables, mixins and the rest of the standard Dart-Sass feature set
-   Runs the compilation in a worker process so it never blocks the main thread

## Install

```shell
npm install @vlocode/sass
```

## Example

```ts
import { SassCompiler } from '@vlocode/sass';

const compiler = new SassCompiler();
const css = await compiler.compileFile('./templates/MyTemplate/style.scss');

console.log(css);
```
