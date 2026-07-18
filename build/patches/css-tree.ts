import path from 'node:path';
import type { Plugin } from 'rolldown';

const bundledFiles = new Map([
    ['data.js', 'data.js'],
    ['version.js', 'version.js']
]);

/**
 * Use css-tree's self-contained browser data modules when bundling.
 *
 * The regular Node.js modules load JSON through createRequire(import.meta.url).
 * Once bundled, import.meta.url points at the generated chunk instead of the
 * css-tree package, causing those relative lookups to fail at runtime.
 */
export default function cssTreePatch(): Plugin {
    return {
        name: 'css-tree-patch',
        resolveId(source: string, importer?: string) {
            if (!importer || !source.startsWith('.')) {
                return null;
            }

            const importerId = importer.split('?')[0];
            const normalizedImporter = importerId.replace(/\\/g, '/');
            const packageMarker = '/css-tree/lib/';
            const packageMarkerIndex = normalizedImporter.lastIndexOf(packageMarker);

            if (packageMarkerIndex === -1) {
                return null;
            }

            const packageRoot = normalizedImporter.slice(0, packageMarkerIndex + '/css-tree'.length);
            const resolvedId = path.resolve(path.dirname(importerId), source).replace(/\\/g, '/');

            for (const [sourceFile, bundledFile] of bundledFiles) {
                if (resolvedId === `${packageRoot}/lib/${sourceFile}`) {
                    return path.join(packageRoot, 'dist', bundledFile);
                }
            }

            return null;
        }
    };
}

export { cssTreePatch };
