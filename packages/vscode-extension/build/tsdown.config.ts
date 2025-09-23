import { defineConfig } from 'tsdown'
import { globSync } from 'fs'

import yaml from './plugins/yaml-loader.js';
import fileTypesPatch from './patches/file-types.js';
import vlocityPatch from './patches/vlocity.js';
import dtracePatch from './patches/dtrace.js';
import jsdomPatch from './patches/jsdom.js';


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
  watch: [
    ...globSync('../*/src')
  ],
  external: [...packageExternals],
  outDir: './dist',
  format: 'esm',
  sourcemap: true,
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
  },
  outputOptions: {
    chunkFileNames: '[hash:23].mjs',
  },
  plugins: [
    yaml(), 
    fileTypesPatch(), 
    vlocityPatch(),
    jsdomPatch(),
    dtracePatch()
  ]
})