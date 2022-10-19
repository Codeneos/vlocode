import * as fs from 'fs';
import * as path from 'path';
import { basename, dirname, join } from 'path';
import typescript from 'typescript';
import { inspect } from 'util';
import { Message, OnLoadResult, Plugin } from '../types/esbuild';

export const tscLoader: Plugin = {
    name: 'tsc-loader',
    setup(build) {
        const namespace = 'tsc-loader';
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

        async function transpile(file: string): Promise<OnLoadResult> {            
            const source = await fs.promises.readFile(file, 'utf8');
            const config = findTsConfig(file);
            const program = typescript.transpileModule(source, { 
                compilerOptions: config.options,
                reportDiagnostics: true,
                fileName: file,
            });

            const sourceMapData = Buffer.from(program.sourceMapText ?? '', 'utf8').toString('base64');
            const sourceMapComment = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${sourceMapData} `;

            return { 
                contents: `${program.outputText}\n${sourceMapComment}`,
                loader: 'js',
                resolveDir: dirname(file),
                watchFiles: [ file ],
                warnings: program.diagnostics?.map(diagnosticsToMessage)
            };
        }

        build.onLoad({ filter: /.ts$/i }, async args => {
            try {
                return await transpile(args.path);
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