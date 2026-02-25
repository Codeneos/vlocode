import type { Plugin } from 'rolldown';

/**
 * Patch deprecated simple-git/promise imports/requires to simple-git.
 */
export default function simpleGitPatch(): Plugin {
    return {
        name: 'simple-git-patch',
        transform(code: string, id: string) {
            if (!id?.endsWith('.js')) return;

            const replaced = code.replaceAll('simple-git/promise', 'simple-git');
            if (replaced === code) return;

            return {
                code: replaced,
                map: null as any
            };
        }
    };
}

export { simpleGitPatch };
