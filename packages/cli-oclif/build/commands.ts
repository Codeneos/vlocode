import type { Plugin } from 'rolldown';
import { globSync } from 'fs';

/**
 * rolldown/tsdown transform that fills the `/*=COMMANDS*\/` placeholder in `src/index.ts` with an
 * oclif-compatible `COMMANDS` map. Keys are colon-separated command ids derived from the file
 * path under `src/commands` (e.g. `datapack/deploy.ts` -> `datapack:deploy`,
 * `metadata/deploy/cancel.ts` -> `metadata:deploy:cancel`); values are the default-exported
 * command classes. Every file under `src/commands` is a runnable command (base classes live at
 * the `src/` root); only test/declaration files are excluded.
 */
export default function commandsLoader(): Plugin {
    return {
        name: 'commands-loader',
        async transform(code: string) {
            if (!/\/\*=COMMANDS\*\//.test(code)) {
                // Skip files that do not contain the placeholder
                return null;
            }

            const commandFiles = globSync('**/*.ts', { cwd: './src/commands' })
                .map(file => file.replace(/\\/g, '/'))
                .filter(file => !/\.(test|spec|d)\.ts$/.test(file))
                .sort();

            const commandId = (file: string) => file.replace(/\.ts$/, '').replace(/\//g, ':');
            const imports = commandFiles
                .map((file, index) => `import cmd${index} from './commands/${file.replace(/\.ts$/, '')}';`)
                .join('\n');
            const entries = commandFiles
                .map((file, index) => `    ${JSON.stringify(commandId(file))}: cmd${index}`)
                .join(',\n');

            return `${imports}\n${code.replace(/\/\*=COMMANDS\*\//, `\n${entries}\n`)}`;
        }
    };
}

export { commandsLoader };
