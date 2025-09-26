import { defineConfig } from 'tsdown'
import { globSync } from 'fs'

import yaml from '../../build/plugins/yaml-loader.js';
import fileTypesPatch from '../../build/patches/file-types.js';
import vlocityPatch from '../../build/patches/vlocity.js';
import dtracePatch from '../../build/patches/dtrace.js';
import jsdomPatch from '../../build/patches/jsdom.js';

/**
 * Entry points for the VSCode extension and related tools
 */
export const entryPoints = {
    'vlocode': './src/extension.ts',
    'sass-compiler': '../sass/src/bin.ts'
};

export const packageExternals = [
    // VSCode is an external that we do not want to package
    'vscode',
    'vscode-languageclient',
    'electron'
];

export default defineConfig({
  entry: entryPoints,
  target: 'esnext',
  // watch: [
  //   ...globSync('../*/src')
  // ],
  external: [...packageExternals],
  outDir: './dist',
  format: 'esm',
  sourcemap: true,
  shims: true,
  minify: true,
  treeshake: false,
  env: {
    NODE_ENV: 'production',
    DEBUG: false,
    SF_DISABLE_LOG_FILE: true
  },
  nodeProtocol: true,
  tsconfig: './tsconfig.json',
  inputOptions: {
    keepNames: true,
    checks: {
      eval: false,
    }
  },
  outputOptions: {
    chunkFileNames: '[hash:23].mjs',
    legalComments: 'none'
  },
  plugins: [
    yaml(), 
    fileTypesPatch(), 
    vlocityPatch(),
    jsdomPatch(),
    dtracePatch()
  ]
})