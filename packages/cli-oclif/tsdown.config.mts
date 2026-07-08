import { defineConfig, type UserConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.ts';
import fileTypesPatch from '../../build/patches/file-types.ts';
import vlocityPatch from '../../build/patches/vlocity.ts';
import dtracePatch from '../../build/patches/dtrace.ts';
import jsdomPatch from '../../build/patches/jsdom.ts';
import commands from './build/commands.ts';

/**
 * Entry point for the oclif CLI: `cli` -> dist/cli.mjs, the oclif COMMANDS target (loaded via a
 * dynamic import at startup). Global logging is configured in `BaseCommand.init()` rather than an
 * oclif `init` hook — a separate hook bundle would re-import the whole `@vlocode/core` graph on
 * every invocation (multi-MB) for no practical gain.
 */
const entryPoints = {
    'cli': './src/index.ts',
};

/**
 * Packages kept external at runtime. `@oclif/*` must NOT be bundled: `bin/run`, the command
 * bundle and the init-hook bundle all need to share ONE `@oclif/core` instance — otherwise
 * `instanceof Command` breaks across duplicate copies and oclif's plugin resolution fails.
 * Everything else (the `@vlocode/*` packages, vlocity, jsdom, chalk, ...) stays bundled so the
 * published CLI installs fast.
 */
const packageExternals = [
    'vscode',
    'vscode-languageclient',
    'electron',
    /^@oclif\//,
];

export default defineConfig((options: UserConfig) => {
  const developmentBuild = Boolean(options.watch);
  return {
    entry: entryPoints,
    outDir: './dist',
    format: 'esm',
    fixedExtension: true,
    external: [...packageExternals],
    sourcemap: developmentBuild,
    shims: true,
    minify: false,
    treeshake: false,
    inlineOnly: false,
    env: {
      NODE_ENV: 'production',
      DEBUG: false
    },
    nodeProtocol: true,
    tsconfig: './tsconfig.json',
    inputOptions: {
      preserveEntrySignatures: 'strict',
    },
    outputOptions: {
      keepNames: true,
      strictExecutionOrder: true,
    },
    plugins: [
      commands(),
      yaml(),
      fileTypesPatch(),
      vlocityPatch(),
      jsdomPatch(),
      dtracePatch()
    ]
  };
});
