import { defineConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.ts';
import fileTypesPatch from '../../build/patches/file-types.ts';
import vlocityPatch from '../../build/patches/vlocity.ts';
import dtracePatch from '../../build/patches/dtrace.ts';
import jsdomPatch from '../../build/patches/jsdom.ts';

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
  sourcemap: process.env.CI !== 'true',
  shims: true,
  minify: false,
  treeshake: false,
  env: {
    NODE_ENV: 'production',
    DEBUG: false,
    SF_DISABLE_LOG_FILE: true
  },
  nodeProtocol: true,
  tsconfig: './tsconfig.json',
  inputOptions: {
    checks: {
      eval: false,
    }
  },
  outputOptions: {
    keepNames: true,
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