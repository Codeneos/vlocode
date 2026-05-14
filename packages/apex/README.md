[![CI](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml/badge.svg)](https://github.com/Codeneos/vlocode/actions/workflows/ci.yml)
![NPM Version](https://img.shields.io/npm/v/%40vlocode%2Fapex)

# @vlocode/apex &mdash; APEX & SOQL parser

An ANTLR4-based [APEX parser](./src/grammar/ApexParser.ts) and [grammar](./grammar/ApexParser.g4) for Node.js and the browser. Built on [`antlr4ng`](https://github.com/mike-lischke/antlr4ng) (the TypeScript port of the original ANTLR4 runtime), it exposes the APEX lexer and parser plus a small set of higher-level helpers built on top of them.

## Features

-   Full APEX *and* SOQL grammar support
-   Walk the parse tree with the standard ANTLR Visitor / Listener patterns
-   Extract code structure (classes, fields, methods, properties, access modifiers) from raw source
-   Identify which classes are exercised by which test classes &mdash; useful for delta-test selection in CI

## Install

```shell
npm install @vlocode/apex
```

## Example: extract class structure from APEX source

```ts
import { Parser } from '@vlocode/apex';

const sourceCode = `public class Person {
    private String name;
    private Integer age;

    public String nameProperty {
        get { return this.name; }
    }

    public Integer getAge() {
        return this.age;
    }

    public Date getBirthDate() {
        return Date.today();
    }
}`;

const parser = new Parser(sourceCode);
const struct = parser.getCodeStructure();

for (const classInfo of struct.classes) {
    console.log(`Class ${classInfo.name}`);

    console.log(` Fields: ${classInfo.fields.length}`);
    classInfo.fields.forEach((field, i) =>
        console.log(`  ${i + 1}) ${field.name} (${field.access})`)
    );

    console.log(` Methods: ${classInfo.methods.length}`);
    classInfo.methods.forEach((method, i) =>
        console.log(`  ${i + 1}) ${method.name} (${method.access})`)
    );
}
```

Output:

```text
Class Person
 Fields: 2
  1) name (private)
  2) age (private)
 Methods: 2
  1) getAge (public)
  2) getBirthDate (public)
```

## Example: find tests for a class

```ts
import { TestIdentifier } from '@vlocode/apex';
import { container } from '@vlocode/core';

const testIdentifier = container.create(TestIdentifier);
await testIdentifier.loadApexClasses(['path/to/apex/classes']);

const testClasses = testIdentifier.getTestClasses('MyClass');
console.log(testClasses); // ['MyClassTest', 'IntegrationTest', ...]
```

## Credits

The grammar files are adapted from the original `apex-parser` library by Andrey Gavrikov. That project is no longer maintained, so we updated the grammar to track newer APEX language features and the `antlr4ng` runtime.
