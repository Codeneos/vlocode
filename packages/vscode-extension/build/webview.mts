/**
 * Build script for React webview bundles.
 * Runs independently of tsdown to produce browser-targeted bundles.
 */
import { build, type BuildOptions } from 'esbuild';
import { join } from 'path';

const isProd = process.env.NODE_ENV === 'production' || !process.argv.includes('--watch');
const watch = process.argv.includes('--watch');

const pkgDir = new URL('..', import.meta.url).pathname;

const cssInjectPlugin = {
    name: 'css-inject',
    setup(pluginBuild: any) {
        // Inject CSS into a <style> tag at runtime
        pluginBuild.onLoad({ filter: /\.css$/ }, async (args: any) => {
            const { readFile } = await import('fs/promises');
            const css = await readFile(args.path, 'utf8');
            const escaped = JSON.stringify(css);
            return {
                contents: `
                    const style = document.createElement('style');
                    style.textContent = ${escaped};
                    document.head.appendChild(style);
                `,
                loader: 'js'
            };
        });
    }
};

const commonOptions: BuildOptions = {
    bundle: true,
    minify: isProd,
    sourcemap: !isProd,
    target: ['chrome120'],
    platform: 'browser',
    logLevel: 'info',
    outdir: join(pkgDir, 'dist', 'webviews'),
    plugins: [cssInjectPlugin]
};

const webviews: Array<{ name: string; entry: string }> = [
    {
        name: 'profileEditor',
        entry: join(pkgDir, 'src', 'webviews', 'profileEditor', 'index.tsx')
    }
];

for (const { name, entry } of webviews) {
    const options: BuildOptions = {
        ...commonOptions,
        entryPoints: { [name]: entry },
        define: {
            'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
        }
    };

    if (watch) {
        const ctx = await (await import('esbuild')).context(options);
        await ctx.watch();
        console.log(`[webview] Watching ${name}…`);
    } else {
        await build(options);
        console.log(`[webview] Built ${name}`);
    }
}

