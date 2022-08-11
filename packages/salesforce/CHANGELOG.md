# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.17.1](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.1) (2022-08-11)

### Bug Fixes

* duplicate fields in query generation and not replacing namespaces for query formater ([c1c89a6](https://github.com/Codeneos/vlocode/commit/c1c89a6b6089d037670574dcc51d93b9115cd546))
* incorrectly detect sandbox orgs as production instance (v0.17.x issue) ([1ef44c5](https://github.com/Codeneos/vlocode/commit/1ef44c5942331d7c7107c8d82ff949b1646b210a))
* issue datapack record factory fails to convert JSON objects into strings ([9781fd4](https://github.com/Codeneos/vlocode/commit/9781fd4e19c3f83fd0e693e8b6ec398d69abeec6))
* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/Codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))
* properly report failed records in the log when using the record batch for deployment ([759196b](https://github.com/Codeneos/vlocode/commit/759196b3fc6d8daa34aba86eaff7488b5ea7fcd1))

### Features

* add query parser to manipulate and analyze SOQL queries ([5a371bd](https://github.com/Codeneos/vlocode/commit/5a371bdda56e79ad565bed6f36495b3aaf1a0833))

# [0.17.0](https://github.com/Codeneos/vlocode/compare/v0.16.36...v0.17.0) (2022-08-01)

### Bug Fixes

* js sandbox compiler class mutation of context fails due to proxy not trapping `getOwnPropertyDescriptor` and `getkeys` properly ([ac52330](https://github.com/Codeneos/vlocode/commit/ac52330b8b9d4d5efbb590d2f4bc589c23cf685b))

### Features

* add query parser to manipulate and analyze SOQL queries ([5a371bd](https://github.com/Codeneos/vlocode/commit/5a371bdda56e79ad565bed6f36495b3aaf1a0833))

## [0.16.36](https://github.com/Codeneos/vlocode/compare/v0.16.35...v0.16.36) (2022-07-18)

**Note:** Version bump only for package @vlocode/salesforce

## [0.16.35](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.35) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.34](https://github.com/Codeneos/vlocode/compare/v0.16.33...v0.16.34) (2022-07-14)

### Bug Fixes

* json files are not included NPM packages ([a1cc196](https://github.com/Codeneos/vlocode/commit/a1cc1968abc49568f25eaa4fc34d719e7c5e84c9))

## [0.16.33](https://github.com/Codeneos/vlocode/compare/v0.16.32...v0.16.33) (2022-07-14)

### Features

* support creating connection provider from an existing jsforce connection whilst keeping all fixes and patches to jsforce active ([7280d18](https://github.com/Codeneos/vlocode/commit/7280d184f6538e0331ed053c5fc57cab03b5162b))

## [0.16.32](https://github.com/Codeneos/vlocode/compare/v0.16.31...v0.16.32) (2022-07-13)

**Note:** Version bump only for package @vlocode/salesforce

## [0.16.31](https://github.com/Codeneos/vlocode/compare/v0.16.21...v0.16.31) (2022-07-13)

**Note:** Version bump only for package @vlocode/salesforce
