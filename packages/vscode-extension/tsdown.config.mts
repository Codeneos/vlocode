import { defineConfig, type UserConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.ts';
import fileTypesPatch from '../../build/patches/file-types.ts';
import vlocityPatch from '../../build/patches/vlocity.ts';
import dtracePatch from '../../build/patches/dtrace.ts';
import jsdomPatch from '../../build/patches/jsdom.ts';
import cssTreePatch from '../../build/patches/csstree.ts';
import simpleGitPatch from '../../build/patches/simple-git.ts';
import { globSync } from 'fs';
import { resolve } from 'path';

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

const workspaceAliases = {
  '@vlocode/core/src/di/container': resolve(import.meta.dirname, '../core/dist/di/container.js'),
  '@vlocode/salesforce/src/deploy/plugins/tokenReplacementPlugin': resolve(import.meta.dirname, '../salesforce/dist/deploy/plugins/tokenReplacementPlugin.js'),
  '@vlocode/apex': resolve(import.meta.dirname, '../apex/dist/index.js'),
  '@vlocode/core': resolve(import.meta.dirname, '../core/dist/index.js'),
  '@vlocode/omniscript': resolve(import.meta.dirname, '../omniscript/dist/index.js'),
  '@vlocode/salesforce': resolve(import.meta.dirname, '../salesforce/dist/index.js'),
  '@vlocode/sass': resolve(import.meta.dirname, '../sass/dist/index.mjs'),
  '@vlocode/util': resolve(import.meta.dirname, '../util/dist/index.js'),
  '@vlocode/vlocity': resolve(import.meta.dirname, '../vlocity/dist/index.js'),
  '@vlocode/vlocity-deploy': resolve(import.meta.dirname, '../vlocity-deploy/dist/index.js'),
};

console.log(`Running tsdown with the following configuration: ${globSync('../*/src')}`);

export default defineConfig((options: UserConfig) => {
  const developmentBuild = Boolean(options.watch);
  const config: UserConfig = {
    entry: entryPoints,
    target: 'esnext',
    watch: developmentBuild ? [
      ...globSync('../*/src')
    ] : false,
    ignoreWatch: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/.vscode-test/**'], 
    alias: developmentBuild ? undefined : workspaceAliases,
    external: [...packageExternals],
    outDir: './dist',
    format: 'esm',
    inlineOnly: false,
    shims: true,
    minify: false,
    treeshake: false,
    dts: false,
    sourcemap: developmentBuild,
    clean: !developmentBuild,
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
      chunkFileNames: '[hash:21].mjs',
      legalComments: 'none'
    },
    plugins: [
      yaml(), 
      fileTypesPatch(), 
      vlocityPatch(),
      jsdomPatch(),
      cssTreePatch(),
      dtracePatch(),
      simpleGitPatch()
    ]
  }
  return config;
});
