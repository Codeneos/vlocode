import type { Plugin } from 'rolldown';


/**
 * A plugin that patches file-type libraries that use eval("require") to just use require directly
 * This is needed as eval is not supported in esbuild/rolldown builds
 */
export default function(): Plugin {
    return {
        name: 'patch-file-types',
        transform(code: string, id: string) {
            if (!id?.endsWith('.js')) return;

            const replaced = code.replace(`eval('require')`, 'require');
            if (replaced === code) return;

            return {
                code: replaced,
                map: null as any
            };
        }
    };
}
