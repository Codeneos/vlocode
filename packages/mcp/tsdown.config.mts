import { defineConfig } from 'tsdown';

import fileTypesPatch from '../../build/patches/file-types.ts';
import vlocityPatch from '../../build/patches/vlocity.ts';
import dtracePatch from '../../build/patches/dtrace.ts';
import jsdomPatch from '../../build/patches/jsdom.ts';

const packageExternals: string[] = [];

export default defineConfig({
    entry: {
        'mcp': './src/index.ts',
    },
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
        fileTypesPatch(),
        vlocityPatch(),
        jsdomPatch(),
        dtracePatch()
    ]
});
