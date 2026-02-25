import { defineConfig, type UserConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.ts';
import fileTypesPatch from '../../build/patches/file-types.ts';
import vlocityPatch from '../../build/patches/vlocity.ts';
import dtracePatch from '../../build/patches/dtrace.ts';
import jsdomPatch from '../../build/patches/jsdom.ts';
import simpleGitPatch from '../../build/patches/simple-git.ts';
import { globSync } from 'fs';

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
    external: [...packageExternals],
    outDir: './dist',
    format: 'esm',
    inlineOnly: false,
    shims: true,
    minify: false,
    treeshake: false,
    dts: !developmentBuild,
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
      dtracePatch(),
      simpleGitPatch()
    ]
  }
  return config;
});