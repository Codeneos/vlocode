import { defineConfig, UserConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.js';
import fileTypesPatch from '../../build/patches/file-types.js';
import vlocityPatch from '../../build/patches/vlocity.js';
import dtracePatch from '../../build/patches/dtrace.js';
import jsdomPatch from '../../build/patches/jsdom.js';
import commands from './build/commands.js';

/**
 * Entry points for the VSCode extension and related tools
 */
const entryPoints = {
    'cli': './src/index.ts',
    'sass-compiler': '../sass/src/bin.ts',
};

const packageExternals = [
    // VSCode is an external that we do not want to package
    'vscode',
    'vscode-languageclient',
    'electron'
];

export default defineConfig({
  entry: entryPoints,
  outDir: './dist',
  format: 'esm',
  fixedExtension: true,
  external: [...packageExternals],
  sourcemap: false,
  shims: true,
  minify: false,
  treeshake: false,
  env: {
    NODE_ENV: 'production',
    DEBUG: false
  },
  nodeProtocol: true,
  tsconfig: './tsconfig.json',
  inputOptions: {
    keepNames: true,
    preserveEntrySignatures: 'strict',
    experimental: {
      strictExecutionOrder: true
    }
  },
  plugins: [
    commands(),
    yaml(), 
    fileTypesPatch(), 
    vlocityPatch(),
    jsdomPatch(),
    dtracePatch()
  ]
});

