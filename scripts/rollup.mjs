import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';

export function createOutput(extra) {
    return {
        dir: 'dist',
        sourcemap: true,
        entryFileNames: () => `[name].${extra?.format === 'es' ? 'mjs' : 'js'}`,
        chunkFileNames: info => `chunk.[hash].${extra?.format === 'es' ? 'mjs' : 'js'}`,
        ...extra,
    }
};

/**
 * Creates a Rollup configuration object with default settings for TypeScript builds
 * @param {import('rollup').RollupOptions} [config] - Additional Rollup configuration options to merge with defaults
 * @returns {import('rollup').RollupOptions} Complete Rollup configuration object
 */
export function rollup(config) {

    const dependencies = Object.keys(
        JSON.parse(readFileSync('./package.json')).dependencies
    );

    return {
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
        ],
        ...config
    }
}