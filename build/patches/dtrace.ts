import type { Plugin } from 'rolldown';
import { readFile } from 'fs/promises';

/**
 * Rolldown plugin that patches dtrace-provider require path resolution.
 */
export default function dtracePatch(): Plugin {
    return {
        name: 'dtrace-patch',
        async transform(code: string, id: string) {
            if (/dtrace-provider\.js$/.test(id)) {
                const replaced = code.replace(
                    "require('./build/' + builds[i] + '/DTraceProviderBindings')",
                    "require('./build/Release/DTraceProviderBindings')"
                );
                if (replaced !== code) {
                    return { code: replaced, map: null as any };
                }
            }
            return null;
        }
    };
}

export { dtracePatch };
