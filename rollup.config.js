import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';

const dependencies = Object.keys(
        JSON.parse(readFileSync('./package.json')).dependencies
    );

const createOutput = (extra) => ({
    dir: 'dist',
    sourcemap: true,
    entryFileNames: () => `[name].${extra?.format === 'es' ? 'mjs' : 'js'}`,
    chunkFileNames: info => `chunk.[hash].${extra?.format === 'es' ? 'mjs' : 'js'}`,
    ...extra,
})

export default {
    input: {
        bin: 'src/bin.ts',
        index: 'src/index.ts'
    },
    external: [
        ...dependencies,
    ],
    output: [
        createOutput({ format: 'es' }),
        createOutput({ format: 'cjs' }),
    ],
    plugins: [
        typescript({ tsconfig: './tsconfig.json', declarationMap: false }),
        nodeResolve(),
    ]
};