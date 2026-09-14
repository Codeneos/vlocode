import { executeLint, lintCommandOptions } from '@vlocode/dplint';
import { Argument, Command } from '../command.js';

export default class extends Command {
    static description = 'Lint Vlocity/SFI DataPacks without connecting to an org';
    static args = [new Argument('[paths...]', 'files, directories, or quoted glob patterns')];
    static options = lintCommandOptions();

    public async run(paths: string[]) {
        process.exitCode = await executeLint(paths, this.options);
    }
}
