import { dirname, join } from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { merge } from '../../../util/src';
import { Plugin } from '../types/esbuild';

export const yamlLoader: Plugin = {
    name: 'yaml-loader',
    setup(build: any) {
        const namespace = 'yaml-loader';

        async function loadYaml(file: string) {
            const resolutionFolder = dirname(file);
            const fileBody = await fs.promises.readFile(file, 'utf8');
            const parsedYaml: any = yaml.load(fileBody);
        
            if (parsedYaml.include) {
                const includedFiles = await Promise.all(parsedYaml.include.map(includedPath => loadYaml(join(resolutionFolder, includedPath))));
                delete parsedYaml.include;
                merge(parsedYaml, ...includedFiles);
            }
        
            return parsedYaml;    
        }

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