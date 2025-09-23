import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import type { Plugin } from 'rolldown';

export default function (): Plugin {
    return {
        name: 'yaml',
        load(id: string) {
            if (id.endsWith('.yaml') || id.endsWith('.yml')) {
                try {
                    const content = readFileSync(id, 'utf8');
                    const parsed = load(content);
                    return `export default ${JSON.stringify(parsed)};`;
                } catch (error) {
                    this.error(`Failed to parse YAML file ${id}: ${error}`);
                }
            }
        }
    };
}
