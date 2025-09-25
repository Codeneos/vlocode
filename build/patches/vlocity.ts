import type { Plugin } from 'rolldown';

/**
 * Rolldown / Rollup compatible plugin that patches vlocity files during transform.
 * It mirrors the original esbuild plugin behavior but implemented using the
 * rollup-style `transform` hook so it works with rolldown builds.
 */
export default function vlocityPatch(): Plugin {
    return {
        name: 'vlocity-patch',
        async transform(code: string, id: string) {
            if (!/vlocity\/lib\//.test(id)) {
                // Skip non-vlocity files
                return null;
            }

            if (/vlocity\/lib\/vlocityutils\.js$/.test(id)) {
                const replaced = code.replace(
                    'VlocityUtils = {',
                    'globalThis.VlocityUtils = {'
                );
                if (replaced === code) return null;
                return { code: replaced, map: null as any };
            }

            if (/vlocity\/lib\/(datapacksutils|vlocity)\.js$/.test(id)) {
                const replaced = code.replace(
                    /(VLOCITY_BUILD_SALESFORCE_API_VERSION|VLOCITY_BUILD_VERSION) = /g,
                    'globalThis.$1 = '
                );
                if (replaced === code) return null;
                return { code: replaced, map: null as any };
            }

            if (/vlocity\/lib\/datapacksjob\.js$/.test(id)) {
                const replaced = code.replace(
                    'for (settingsKey in',
                    'for (const settingsKey in'
                );
                if (replaced === code) return null;
                return { code: replaced, map: null as any };
            }

            return null;
        }
    };
}

export { vlocityPatch };