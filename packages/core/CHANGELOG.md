# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.18.17](https://github.com/Codeneos/vlocode/compare/v0.18.16...v0.18.17) (2023-02-23)

**Note:** Version bump only for package @vlocode/core

## [0.18.16](https://github.com/Codeneos/vlocode/compare/v0.18.15...v0.18.16) (2023-02-20)

**Note:** Version bump only for package @vlocode/core

## [0.18.15](https://github.com/Codeneos/vlocode/compare/v0.18.14...v0.18.15) (2023-02-20)

**Note:** Version bump only for package @vlocode/core

## [0.18.14](https://github.com/Codeneos/vlocode/compare/v0.18.13...v0.18.14) (2023-02-14)

**Note:** Version bump only for package @vlocode/core

## [0.18.13](https://github.com/Codeneos/vlocode/compare/v0.18.12...v0.18.13) (2023-02-14)

**Note:** Version bump only for package @vlocode/core

## [0.18.12](https://github.com/Codeneos/vlocode/compare/v0.18.11...v0.18.12) (2023-01-27)

**Note:** Version bump only for package @vlocode/core

## [0.18.11](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.11) (2023-01-26)

**Note:** Version bump only for package @vlocode/core

## [0.18.10](https://github.com/Codeneos/vlocode/compare/v0.18.9...v0.18.10) (2023-01-25)

**Note:** Version bump only for package @vlocode/core

**Note:** Version bump only for package @vlocode/core

## [0.18.8](https://github.com/Codeneos/vlocode/compare/v0.18.7...v0.18.8) (2023-01-25)

**Note:** Version bump only for package @vlocode/core

## [0.18.7](https://github.com/Codeneos/vlocode/compare/v0.18.6...v0.18.7) (2023-01-24)

### Bug Fixes

* container returned classes do not pass instance-of test due to wrong prototype ([f7554c5](https://github.com/Codeneos/vlocode/commit/f7554c54d1fb071aef7523ce69642c1ccade1670))
* fractions reported as 'SS' due to invalid fraction format in loggers (due to luxon migration) ([2675a46](https://github.com/Codeneos/vlocode/commit/2675a46c4ac72a81d66a61bc7baafbc65be9e2a5))

## [0.18.6](https://github.com/Codeneos/vlocode/compare/v0.18.5...v0.18.6) (2022-12-12)

### Bug Fixes

* excess spaces ([e6bf37d](https://github.com/Codeneos/vlocode/commit/e6bf37d0cd5babe6d4e763eb98d28a0e16b2a0ea))

### Features

* add `useInstanceProxies` setting controlling if the container always returns proxies or only when required to resolve circular references ([2a9ff46](https://github.com/Codeneos/vlocode/commit/2a9ff46dea9e50a24e28f89807d920b9463a65f7))

## [0.18.4](https://github.com/Codeneos/vlocode/compare/v0.18.3...v0.18.4) (2022-11-23)

**Note:** Version bump only for package @vlocode/core

## [0.18.3](https://github.com/Codeneos/vlocode/compare/v0.18.2...v0.18.3) (2022-11-22)

**Note:** Version bump only for package @vlocode/core

## [0.18.2](https://github.com/Codeneos/vlocode/compare/v0.18.1...v0.18.2) (2022-11-22)

**Note:** Version bump only for package @vlocode/core

## [0.18.1](https://github.com/Codeneos/vlocode/compare/v0.18.0...v0.18.1) (2022-11-21)

**Note:** Version bump only for package @vlocode/core

# [0.18.0](https://github.com/Codeneos/vlocode/compare/v0.17.12...v0.18.0) (2022-11-21)

### Bug Fixes

* allow to pass this argument to work queue improving type detection ([20f095d](https://github.com/Codeneos/vlocode/commit/20f095dcb60402f582e5fcd682a9c376d7d1ca51))
* init command not awaited causing vlocode deploy to create duplicate dependencies ([534b5e1](https://github.com/Codeneos/vlocode/commit/534b5e1891028cb8759e7bc7b6f76eb3845fb211))
* vlocode can hang during initialization or org-switching ([7c95c2c](https://github.com/Codeneos/vlocode/commit/7c95c2c6259e94e8c951e9f069473ddf8ad94fea))

### Features

* add container name to logs in debug mode ([8f61318](https://github.com/Codeneos/vlocode/commit/8f61318f58ab39219d5a4ca49e78c668ffb3966f))
* await batch classes executed by Vlocity Admin commands and report their progress in vscode ([16453df](https://github.com/Codeneos/vlocode/commit/16453df7eaee34805e63c51a2f101daf2f0296da))
* support checking a class is decorated with `[@injectable](https://github.com/injectable)` ([918639e](https://github.com/Codeneos/vlocode/commit/918639ee37c88f9617cb660d291426db3901029d))
* support IoC container injecting it self as dependency ([70bc709](https://github.com/Codeneos/vlocode/commit/70bc709dc2a77988bb1695f5fc439f587e8b7cc2))
* support queryTooling through queryService ([9f599ef](https://github.com/Codeneos/vlocode/commit/9f599efd62f2123d67ad574efe388b188a3d63c3))

## [0.17.9](https://github.com/Codeneos/vlocode/compare/v0.17.8...v0.17.9) (2022-09-29)

**Note:** Version bump only for package @vlocode/core

## [0.17.8](https://github.com/Codeneos/vlocode/compare/v0.17.7...v0.17.8) (2022-09-27)

**Note:** Version bump only for package @vlocode/core

## [0.17.7](https://github.com/Codeneos/vlocode/compare/v0.17.6...v0.17.7) (2022-09-27)

### Bug Fixes

* service overrides not logged properly ([cec6a55](https://github.com/Codeneos/vlocode/commit/cec6a552c5dd0943a7cb8258f4cd1cb522b238f6))

### Features

* add options to skip OmniScript LWC deployment ([a86d227](https://github.com/Codeneos/vlocode/commit/a86d2279324e82912b7ab2b259c8b61f6c2feff7))
* expose `deploy` as separate function making it easier to invoke from external libraries ([37312d8](https://github.com/Codeneos/vlocode/commit/37312d8216c301007e17ca6800338e97987e2158))
* integrate omniscript LWC compiler and activation ([8c5bfaf](https://github.com/Codeneos/vlocode/commit/8c5bfaf6755358275997376c9d83ee169be10986))

## [0.17.6](https://github.com/Codeneos/vlocode/compare/v0.17.5...v0.17.6) (2022-08-31)

### Bug Fixes

* don't use string.replaceAll with a RegExp as ms-python.python replaces replaceAll with a method not supporting a RegExp as sub-string ([e966bbf](https://github.com/Codeneos/vlocode/commit/e966bbf637aa2c3613d574be71891ae1ed6ca377))

## [0.17.3](https://github.com/Codeneos/vlocode/compare/v0.17.2...v0.17.3) (2022-08-15)

**Note:** Version bump only for package @vlocode/core

## [0.17.2](https://github.com/Codeneos/vlocode/compare/v0.16.22...v0.17.2) (2022-08-12)

### Bug Fixes

* build issue due to tsconfig mis configuration for core package ([7956281](https://github.com/Codeneos/vlocode/commit/79562814f341a5f8b8a79db0c13f1735131887e0))
* focus all writers when calling log.focus instead of only the first writer that has a focus method. ([970f5fc](https://github.com/Codeneos/vlocode/commit/970f5fc96228d8aaa815640907eee78130ea7e56))
* improve code coverage of IoC container class. ([9a76f57](https://github.com/Codeneos/vlocode/commit/9a76f5755e7326e51a70aaa1428d1514e8b3f0ba))
* json files are not included NPM packages ([f67a75d](https://github.com/Codeneos/vlocode/commit/f67a75de03a008dd6f6825c948489f375c2ab35c))

### Features

* add icon to terminal window ([f4b9466](https://github.com/Codeneos/vlocode/commit/f4b9466e70866eb2737f6d37898760052266fc76))
* core IoC container should also consider shapes inherited from it's parent ([f4f9109](https://github.com/Codeneos/vlocode/commit/f4f9109c525d9dfa2f252234c6b52e578cef1dcb))
* focus terminal log on certain commands ([63aeb61](https://github.com/Codeneos/vlocode/commit/63aeb615a7e5282a90c4cdd768dd2756ee9096d3))

## [0.17.1](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* build issue due to tsconfig mis configuration for core package ([58b60ea](https://github.com/Codeneos/vlocode/commit/58b60ea499ead676fa489948a675d3e2a5c4eaf4))
* focus all writers when calling log.focus instead of only the first writer that has a focus method. ([e0d0b67](https://github.com/Codeneos/vlocode/commit/e0d0b6775dbd9b60f213a6ae9fdc389a68cb6326))
* improve code coverage of IoC container class. ([b46f2e9](https://github.com/Codeneos/vlocode/commit/b46f2e96afe006cd29159b2202a9eb677b0cfa6d))

### Features

* add icon to terminal window ([ec46aa3](https://github.com/Codeneos/vlocode/commit/ec46aa339fc021c98b3b38f23fe751be3cf3d9ce))
* focus terminal log on certain commands ([ff25518](https://github.com/Codeneos/vlocode/commit/ff25518c3dc539caa5acc7dee4a6582651015c0f))

# [0.17.0](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.0) (2022-08-01)

### Bug Fixes

* improve code coverage of IoC container class. ([b46f2e9](https://github.com/Codeneos/vlocode/commit/b46f2e96afe006cd29159b2202a9eb677b0cfa6d))

### Features

* add icon to terminal window ([ec46aa3](https://github.com/Codeneos/vlocode/commit/ec46aa339fc021c98b3b38f23fe751be3cf3d9ce))

## [0.16.36](https://github.com/Codeneos/vlocode/compare/v0.16.35...v0.16.36) (2022-07-18)

**Note:** Version bump only for package @vlocode/core

## [0.16.35](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.35) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.34](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.34) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.33](https://github.com/Codeneos/vlocode/compare/v0.16.32...v0.16.33) (2022-07-14)

### Features

* core IoC container should also consider shapes inherited from it's parent ([b182665](https://github.com/Codeneos/vlocode/commit/b1826656f240a8be31ce1d780fb7c51f6a439aaa))

## [0.16.32](https://github.com/Codeneos/vlocode/compare/v0.16.31...v0.16.32) (2022-07-13)

**Note:** Version bump only for package @vlocode/core

## [0.16.31](https://github.com/Codeneos/vlocode/compare/v0.16.21...v0.16.31) (2022-07-13)

**Note:** Version bump only for package @vlocode/core
