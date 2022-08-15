<img src="https://raw.githubusercontent.com/Codeneos/vlocode/master/packages/vscode-extension/resources/logo1.png" height="160">

# Vlocode API Libraries

Vlocode uses a set of API libraries that provide common reusable components and can be used with ot without VSCode. The libraries are fully written in typescript and exposed as CommonJS modules for compatibility reasons. The NPM packaged versions come with source code maps for easy debugging.

All libraries are available on NPMJS and can be installed using either npm or yarn. There is no dependency on the vlocode VSCode extension or on vscode itself.

### Install with NPM
```shell
npm install @vlocode/core @vlocode/util --save 
```

### Install with yarn
```shell
yarn add @vlocode/core @vlocode/util
```

## **@vlocode/core**
- `IoC Container FW` flexible IoC container framework
- `Logging` highly configurable logging framework with VSCode Terminal and output channel writers.
- `Minimal FS` minimal FS abstraction layer with VSCode and Native implementations

_Note_ **@vlocode/core** depends on the same version of **@vlocode/util**

## **@vlocode/util**
- `Iterable` utility methods exposing common iterable operations
- `Salesforce Utilities` several Utility methods to make working with Salesforce data easier
- `SFDX Utility` expose common SFDX methods to easily build a connection using existing SFDX credentials
- `Cache` cache decorator to cache function/method responses
- `Singleton` singleton utility pattern
- `Async Event Emitter` generic Typescript compatible Async Event emitter