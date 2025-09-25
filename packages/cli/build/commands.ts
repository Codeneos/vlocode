import type { Plugin } from 'rolldown';
import { globSync } from 'fs';
import { basename } from 'path';

export default function commandsLoader(): Plugin {
    return {
        name: 'commands-loader',
        async transform(code: string, id: string) {
            if (!/\/\*=COMMANDS\*\//.test(code)) {
                // Skip non-vlocity files
                return null;
            }
            const commandFiles = globSync('**/*.ts', { cwd: './src/commands' });
            const imports = commandFiles.map((file, index) => `import cmd${index} from './commands/${file.replace(/\\/g, '/').replace(/\.ts$/, '')}';`).join('\n');
            const commands = `{\n${commandFiles.map((file, index) => `"${basename(file, '.ts')}": cmd${index}`).join(',\n')}\n}`;
            return `${imports}\n${code.replace(/\/\*=COMMANDS\*\//, commands)}`;
        }
    };
}

export { commandsLoader };