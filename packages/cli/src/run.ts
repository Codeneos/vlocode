import { Config, execute } from '@oclif/core';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const loadOptions = await Config.load(join(__dirname, '..'));

await execute({ loadOptions });
