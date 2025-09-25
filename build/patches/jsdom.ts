import type { Plugin } from 'rolldown';

/**
 * Rolldown plugin that patches jsdom's XMLHttpRequest implementation to avoid
 * resolving a worker file at build time.
 */
export default function jsdomPatch(): Plugin {
    return {
        name: 'jsdom-patch',
        async transform(code: string, id: string) {
            if (/XMLHttpRequest-impl\.js$/.test(id)) {
                const replaced = code.replace(
                    'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
                    'const syncWorkerFile = null;'
                );
                if (replaced !== code) {
                    return { code: replaced, map: null as any };
                }
            }
            return null;
        }
    };
}

export { jsdomPatch };
