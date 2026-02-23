import { defineConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.ts';
import fileTypesPatch from '../../build/patches/file-types.ts';
import vlocityPatch from '../../build/patches/vlocity.ts';
import dtracePatch from '../../build/patches/dtrace.ts';
import jsdomPatch from '../../build/patches/jsdom.ts';
import commands from './build/commands.ts';

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
});

