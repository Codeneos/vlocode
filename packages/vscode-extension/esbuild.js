const { dirname, join } = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const esbuild = require('esbuild');
const esbuildTsc = require('esbuild-plugin-tsc');

/**
 * Merge multiple objects recursively into the target object
 * @param {object} object target into which sources are merged
 * @param  {...object} sources source from which to merge
 * @returns 
 */
function merge(object, ...sources) {
    for (const source of sources.filter(s => s)) {
        for (const key of Object.keys(source)) {
            if (isObject(object[key]) && isObject(source[key])) {
                merge(object[key], source[key]);
            } else if (isObject(source[key])) {
                object[key] = merge(createMergeTarget(source[key]), source[key]);
            } else {                
                object[key] = source[key];
            }
        }
    }    
    return object;
}

function createMergeTarget(source){
    const target = (Array.isArray(source) ? [] : {});
    const sourcePrototype = Object.getPrototypeOf(source);
    if (sourcePrototype) {
        Object.setPrototypeOf(target, sourcePrototype);
    }
    return target;
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

async function loadYaml(file) {
    const resolutionFolder = dirname(file);
    const fileBody = await fs.promises.readFile(file, 'utf8');
    const parsedYaml = yaml.load(fileBody);

    if (parsedYaml.include) {
        const includedFiles = await Promise.all(parsedYaml.include.map(includedPath => loadYaml(join(resolutionFolder, includedPath))));
        delete parsedYaml.include;
        merge(parsedYaml, ...includedFiles);
    }

    return parsedYaml;    
}

let yamlLoader = {
    name: 'yaml-loader',
    setup(build) {
        const namespace = 'yaml-loader';

        build.onResolve({ filter: /\.yaml$/ }, args => {
            const path = join(args.resolveDir, args.path);
            const canResolve = fs.existsSync(path);
            if (!canResolve) {
                return {
                    errors: [{ text: `Could not resolve "${args.path}"` }]
                }
            }
            return { path, namespace, watchFiles: [ path ] };
        });

        build.onLoad({ filter: /.*/, namespace }, async args => {
            try {
                const loadedYaml = await loadYaml(args.path);   
                return {
                    contents: JSON.stringify(loadedYaml),
                    loader: 'json',
                };
            } catch(err) {
                if (err.name === 'YAMLException') {
                    return {
                        errors: [{ 
                            text: `Parser error for "${args.path}": ${err.message}`, 
                            detail: err
                        }],
                    };
                }
            }
        });
    },
}

// let resolveLoader = {
//     name: 'resolve-loader',
//     setup(build) {
//         const namespace = 'resolve-loader';

//         build.onResolve({ filter: /.*/, namespace: 'file' }, args => {
//             if (args.kind === 'require-resolve') {
//                 const resolvedLocalPath = join(args.resolveDir, args.path);
//                 if (fs.existsSync(resolvedLocalPath)) {
//                     console.debug('require-resolve: ', resolvedLocalPath);
//                     return { path: resolvedLocalPath, namespace, external: false, pluginName: namespace };
//                 }                
//             }
//         });

//         build.onLoad({ filter: /.*/ }, async args => {
//             console.debug('JS-loader: ', args.path);
//             // return {
//             //     contents: fs.promises.readFile(args.path),
//             //     loader: 'js',
//             // };
//         });
//     },
// }

esbuild.build({
    entryPoints: ['./src/extension.ts'],
    platform: 'node',
    external: [ 'electron', 'canvas', 'vscode', 'pnpapi' ],
    bundle: true,
    outdir: 'out',
    target: 'node16',
    sourcemap: true,
    plugins: [ yamlLoader, esbuildTsc({ force: true }) ],
}).catch(() => process.exit(1))