import * as fs from 'fs';
import * as path from 'path';
import { basename, dirname, join } from 'path';
import typescript, { sys } from 'typescript';
import { inspect } from 'util';
import { Message, OnLoadResult, Plugin } from '../types/esbuild';

export const tscLoader: Plugin = {
    name: 'tsc-loader',
    setup(build) {
        const namespace = 'tsc-loader';
        const packagesFolder = path.resolve(__dirname, '../../..'); // Referebce to the folder containing packages
        const configFiles = new Map<string, typescript.ParsedCommandLine>();

        function findTsConfig(searchPath: string): typescript.ParsedCommandLine {
            const fileName = typescript.findConfigFile(searchPath, typescript.sys.fileExists);

            if (!fileName) {
                throw new Error(`Unable to find ts-config file`);
            }

            const cachedConfig = configFiles.get(fileName);
            if (cachedConfig) {
                return cachedConfig;
            }
        
            const configSource = typescript.readJsonConfigFile(fileName, typescript.sys.readFile);
            const parsedTsConfig = typescript.parseJsonSourceFileConfigFileContent(configSource, typescript.sys, path.dirname(fileName));

            if (parsedTsConfig.errors[0]) {
                throw new Error(inspect(parsedTsConfig.errors, false, 10, true));
            }
        
            configFiles.set(fileName, parsedTsConfig);
            return parsedTsConfig;
        }

        function diagnosticsToMessage(diag: typescript.Diagnostic): Message {
            return { 
                text: typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText,
            };
        }

        function findSourceRoot(file: string): string {  
            const config = findTsConfig(file);

            if (config.options.sourceRoot) {
                return config.options.sourceRoot;
            }

            if (config.wildcardDirectories) {
                const sourceRoot = Object.keys(config.wildcardDirectories).find(wildcardFolder => file.replace(/\\/g, '/').toLowerCase().startsWith(wildcardFolder.toLowerCase()));
                if (sourceRoot) {
                    return sourceRoot;
                }
            }

            return dirname(file);
        }

        async function transpile(file: string): Promise<OnLoadResult> {            
            const source = await fs.promises.readFile(file, 'utf8');
            const config = findTsConfig(file);            
            const sourceRoot = findSourceRoot(file);
            const program = typescript.transpileModule(source, { 
                compilerOptions: { ...config.options, composite: false, sourceMap: false, inlineSources: true, inlineSourceMap: true },
                reportDiagnostics: true,
                fileName: file
            });
            
            // const sourceMapData = Buffer.from(program.sourceMapText ?? '', 'utf8').toString('base64');
            // const sourceMapComment = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${sourceMapData} `;

            return { 
                contents: `${program.outputText}`,
                resolveDir: dirname(file),
                watchFiles: [ file ],
                warnings: program.diagnostics?.map(diagnosticsToMessage)
            };
        }

        async function findPackages() {
            const packageFolders: Record<string, { name: string, packageJson: object, sourceFolder: string }> = {};

            for (const folder of await fs.promises.readdir(packagesFolder)) {
                const packageJsonPath = path.join(packagesFolder, folder, 'package.json');
                if (!fs.existsSync(packageJsonPath)) {
                    continue;
                }

                const packageJson = JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'))
                packageFolders[packageJson.name] = {
                    name: packageJson.name,
                    packageJson: packageJson,
                    sourceFolder: path.join(packagesFolder, folder, 'src', 'index.ts')
                };
            }

            return packageFolders;
        }

        build.onResolve({ filter: /.*/ }, async args => {
            if (!build['packages']) {
                build['packages'] = await findPackages();
            }

            if (build['packages'][args.path]) {
                //console.debug(`## onResolve: ${args.path} -> ${build['packages'][args.path].sourceFolder}`);
                return { 
                    watchDirs: [ path.basename(build['packages'][args.path].sourceFolder) ],
                    path: build['packages'][args.path].sourceFolder
                };
            }  

            return undefined;
        }); 

        build.onLoad({ filter: /.ts$/i }, async args => {
            try {
                return await transpile(args.path);
            } catch(err) {
                return {
                    errors: [{ 
                        text: `Parser error for "${args.path}": ${err.message}`,
                        detail: err
                    }],
                };
            }
        });
    },
}