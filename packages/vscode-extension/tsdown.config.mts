import { defineConfig, type UserConfig } from 'tsdown'

import yaml from '../../build/plugins/yaml-loader.ts';
import reactCssInjectPlugin from '../../build/plugins/react-css-inject.mts';
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

export const webviews = {
    'profile-editor': './src/webviews/profileEditor/index.tsx'
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
    target: 'esnext',
    watch: developmentBuild ? [
      ...globSync('../*/src')
    ] : false,
    deps: {
      neverBundle: [...packageExternals],
      onlyBundle: false,
    },
    ignoreWatch: ['**/node_modules/**', '**/dist/**', '**/out/**', '**/.vscode-test/**'], 
    outDir: './dist',
    format: 'esm',
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
    comments: {
      legal: 'none',
    },
    inputOptions: {
      checks: {
        eval: false,
      }
    },
    outputOptions: {
      keepNames: true,
      chunkFileNames: '[hash:21].mjs',
    },
    plugins: [
      yaml(), 
      fileTypesPatch(), 
      vlocityPatch(),
      jsdomPatch(),
      dtracePatch(),
      simpleGitPatch(),
      reactCssInjectPlugin()
    ]
  }
  return [
    { ...config, entry: entryPoints, platform: 'node' },
    {
      ...config,
      entry: webviews,
      outDir: './dist/webviews',
      platform: 'browser',
      outputOptions: {
        ...config.outputOptions,
        codeSplitting: false
      }
    }
  ];
});