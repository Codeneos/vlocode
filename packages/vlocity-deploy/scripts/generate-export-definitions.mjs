import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import yaml from 'js-yaml';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const definitionsDir = path.join(packageRoot, 'src', 'exportDefinitions');

try {
    const files = await fs.readdir(definitionsDir);
    await Promise.all(files
        .filter(file => /\.ya?ml$/i.test(file))
        .map(async file => {
            const yamlPath = path.join(definitionsDir, file);
            const jsonPath = path.join(definitionsDir, file.replace(/\.ya?ml$/i, '.json'));
            const definition = yaml.load(await fs.readFile(yamlPath, 'utf8'), { filename: yamlPath });
            await fs.writeFile(jsonPath, `${JSON.stringify(definition, null, 2)}\n`);
        }));
} catch (error) {
    if (error?.code !== 'ENOENT') {
        throw error;
    }
}
