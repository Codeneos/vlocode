import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Plugin } from 'rolldown';

const jsonRequirePattern = /require\((['"])([^'"]+\.json)\1\)/g;

/**
 * Rolldown plugin that inlines the JSON files css-tree loads through `createRequire` at runtime
 * (`../package.json`, `../data/patch.json` and the mdn-data css definitions). These requires
 * resolve relative to the bundle output instead of the css-tree package folder and fail with
 * MODULE_NOT_FOUND when css-tree is bundled.
 */
export default function cssTreePatch(): Plugin {
    return {
        name: 'css-tree-patch',
        async transform(code: string, id: string) {
            const fileId = id.split('?')[0];
            if (!/[/\\]css-tree[/\\]lib[/\\]/.test(fileId) || !jsonRequirePattern.test(code)) {
                return null;
            }
            jsonRequirePattern.lastIndex = 0;

            const fileRequire = createRequire(fileId);
            let replaced = code;
            for (const [requireCall, , specifier] of [...code.matchAll(jsonRequirePattern)]) {
                const jsonFile = specifier.startsWith('.') ? path.resolve(path.dirname(fileId), specifier) : fileRequire.resolve(specifier);
                const inlined = `JSON.parse(${JSON.stringify(await readFile(jsonFile, 'utf8'))})`;
                // Replace through a function so `$`-sequences in the JSON are not treated as replacement patterns
                replaced = replaced.replaceAll(requireCall, () => inlined);
            }

            return { code: replaced, map: null as any };
        }
    };
}

export { cssTreePatch };
