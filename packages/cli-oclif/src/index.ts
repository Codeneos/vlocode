import type { Command } from '@oclif/core';

/**
 * oclif command registry (the `commands.target` referenced from `package.json` `oclif` config).
 *
 * The `/*=COMMANDS*\/` placeholder is replaced at build time by the `build/commands.ts`
 * rolldown plugin with a map of colon-separated command ids (e.g. `datapack:deploy`) to their
 * command classes, discovered from the files under `src/commands`. In a non-bundled context the
 * placeholder is absent and `COMMANDS` is an empty object.
 */
export const COMMANDS = {/*=COMMANDS*/} as Record<string, typeof Command>;
