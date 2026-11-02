#!/usr/bin/env node
require('../dist/cli.js').runCli().then(code => { process.exitCode = code; });
