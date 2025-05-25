import * as esbuild from 'esbuild'
import { cwd } from 'node:process';
import { basename } from 'node:path';
import { parseArgs } from 'node:util';
import { realpathSync } from 'node:fs';

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
        count++ === 0 && console.log(`File change detected. Starting incremental compilation...`);
    });
    build.onEnd(() => {
        --count === 0 && console.log(`Compilation complete. Watching for file changes.`);
    });
  },
}];

/** @type {import('esbuild').BuildOptions} */
export const ES_BUILD_CONFIG = {
    entryPoints: [ values.entrypoint || positionals[0] ],
    platform: 'node',
    outdir: values.out ?? 'dist',
    bundle: false,
    keepNames: true,
    sourcemap: values.debug,
    sourcesContent: values.debug,
    minify: false,
    treeShaking: false,
    plugins,
    absWorkingDir: realpathSync(cwd()),
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