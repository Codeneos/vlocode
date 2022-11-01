import esbuild from 'esbuild';
import path from 'path';
import { yamlLoader } from './plugins/yamlLoader';
import { tscLoader } from './plugins/typescript';

const esbuildOptions: esbuild.BuildOptions = {
    absWorkingDir: path.join(__dirname, '..', '..', '..', '..', '..'),
    entryPoints: [
        path.join(__dirname, '../src/extension.ts'),
        path.join(__dirname, '../../vlocity-deploy/src/sass/forked/fork.ts'),        
    ],
    entryNames: '[name]',
    platform: 'node',
    sourcemap: 'external',
    external: [ 'electron', 'canvas', 'vscode', 'pnpapi', 'source-map-support' ],
    bundle: true,
    outdir: path.join(__dirname, '../out'),
    target: 'node16',
    minify: false,
    keepNames: true,
    treeShaking: false,
    plugins: [ yamlLoader, tscLoader ],
};

esbuild.build(esbuildOptions).catch(() => process.exit(1));