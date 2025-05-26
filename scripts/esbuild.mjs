import * as esbuild from 'esbuild'
import { cwd } from 'node:process';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';

const { values, positionals } = parseArgs({
    options: {
        watch: { type: 'boolean', short: 'w', default: false },
        debug: { type: 'boolean', default: false },
        out: { type: 'string', short: 'o' },
        entrypoint: { type: 'string' },
    }
});

let count = 0;
/** @type {import('esbuild').Plugin[]} */
const plugins = [{
  name: 'build-notifier',
  setup(build) {
    const module = basename(cwd());
    const prefix = build.initialOptions.format;
    build.onStart(() => {
        count++ === 0 && console.log(`[${module}] [${prefix}] File change detected. Starting incremental compilation...`);
    });
    build.onEnd(() => {
        --count === 0 && console.log(`[${module}] [${prefix}] Compilation complete. Watching for file changes.`);
    });
  },
}];

const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));

/** @type {import('esbuild').BuildOptions} */
export const ES_BUILD_CONFIG = {
    entryPoints: [ values.entrypoint || positionals[0] ],
    platform: 'node',
    outdir: values.out ?? 'dist',
    bundle: true,
    keepNames: true,
    sourcemap: values.debug,
    sourcesContent: values.debug,
    minify: false,
    treeShaking: false,
    plugins,
    external: [
        'vscode',
        ...Object.keys(packageJson.dependencies)
    ]
};

async function build(extraOptions) {
    const options = { ...ES_BUILD_CONFIG, ...extraOptions};
    if (values.watch) {       
        return (await esbuild.context(options)).watch();
    }
    return esbuild.build(options);
}

await build({ format: 'cjs', outExtension: { '.js': '.cjs' } });
await build({ format: 'esm', outExtension: { '.js': '.mjs' } });