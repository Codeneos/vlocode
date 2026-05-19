import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'rolldown';

const defaultStyleSheetRead = /const\s+defaultStyleSheet\s*=\s*fs\.readFileSync\(\s*path\.resolve\(__dirname,\s*["']([^"']*default-stylesheet\.css)["']\),\s*\{\s*encoding:\s*["']utf-8["']\s*\}\s*\);/;
const syncWorkerFileReads = [
    'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
    'const syncWorkerFile = require.resolve("./xhr-sync-worker.js");'
];

/**
 * Rolldown plugin that patches jsdom file-system lookups that break when jsdom
 * is bundled into the CLI or VS Code extension.
 */
export default function jsdomPatch(): Plugin {
    return {
        name: 'jsdom-patch',
        async transform(code: string, id: string) {
            const fileId = id.split('?')[0];

            if (/XMLHttpRequest-impl\.js$/.test(fileId)) {
                const replaced = syncWorkerFileReads.reduce(
                    (source, syncWorkerFileRead) => source.replace(syncWorkerFileRead, 'const syncWorkerFile = null;'),
                    code
                );
                if (replaced !== code) {
                    return { code: replaced, map: null as any };
                }
                if (code.includes('xhr-sync-worker.js')) {
                    throw new Error(`Unable to patch jsdom sync XHR worker path in ${fileId}`);
                }
            }

            if (/[/\\]jsdom[/\\]/.test(fileId) && code.includes('default-stylesheet.css')) {
                const match = defaultStyleSheetRead.exec(code);
                if (!match) {
                    throw new Error(`Unable to locate jsdom default stylesheet read in ${fileId}`);
                }

                const defaultStyleSheetPath = path.resolve(path.dirname(fileId), match[1]);
                const defaultStyleSheet = await readFile(defaultStyleSheetPath, 'utf8');
                const replaced = code.replace(
                    defaultStyleSheetRead,
                    `const defaultStyleSheet = ${JSON.stringify(defaultStyleSheet)};`
                );

                if (replaced === code) {
                    throw new Error(`Unable to embed jsdom default stylesheet in ${fileId}`);
                }

                return { code: replaced, map: null as any };
            }

            return null;
        }
    };
}

export { jsdomPatch };
