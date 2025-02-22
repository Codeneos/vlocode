import { Logger, LogManager, FileSystem, injectable } from '@vlocode/core';
import { pluralize, Timer } from '@vlocode/util';
import { existsSync} from 'fs-extra';

import { Apex } from '@vlocode/apex';
import { Argument, Option, Command } from '../command';

@injectable()
export default class extends Command {

    static description = 'Find impacted unit test classes for a given set of APEX classes. ' + 
        'This command parses source files to map references between APEX classes and their corresponding test classes, ' +
        'and identifies both directly and indirectly impacted tests based on the provided search depth.';

    static args = [
        new Argument('<classFiles...>', 'List of APEX class file paths to analyze. Provide one or more file paths to determine which test classes may be impacted.')
            .argParser((value, previous: string[] | undefined) => {
                if (!existsSync(value)) {
                    throw new Error('No such folder exists');
                }
                return (previous ?? []).concat([ value ]);
            }).argRequired()
    ];

    static options = [
        new Option('--sources <folder>', 'Folder containing the source files for APEX classes used to build the dependency map for impacted test classes.')
            .makeOptionMandatory(false),
        new Option('--depth <depth>', 'Specifies the search depth for identifying indirectly impacted test classes. Default is 0 (only direct test classes are considered).')
            .makeOptionMandatory(false),
        new Option('--output (<file>)', 'Path to the output file where the impacted test classes will be written as JSON. Defaults to "impactedTests.json".')
            .default('impactedTests.json')
    ];

    private apex = new Apex();

    constructor(
        private fileSystem: FileSystem,
        private logger: Logger = LogManager.get('vlocode-cli')
    ) {
        super();
    }

    public async run(apexClassFiles: string[], options: { sources?: string, output?: string, depth?: number }) {
        this.logger.info(`Searching impacted tests classes for ${pluralize('APEX file', apexClassFiles.length)}`);
        this.logger.info(`Search depth: ${options?.depth ?? 0}`);
        this.logger.info(`Source folder: ${options.sources ?? 'auto'}`);
        this.logger.info(`Output file: ${options.output ?? 'N/A'}`)
        this.logger.verbose(`APEX Classes: ${apexClassFiles.join(', ')}`);
        
        for (const classFile of apexClassFiles) {
            this.logger.verbose(`\u2022 ${classFile}`);
        }

        const timer = new Timer();
        const impactedClasses = await this.apex.findImpactedTests(apexClassFiles, { sourceFolder: options.sources, depth: options.depth });
        this.logger.info(`\u2713 Parsed ${pluralize('file', this.apex.parsedFileCount)} in ${timer.stop().toString('seconds')}`);
        this.logger.info(`Found ${pluralize('impacted test class', impactedClasses.length)}:`);
        for (const impactedClass of impactedClasses) {
            this.logger.info(`\u2022 ${impactedClass}`);
        }

        if (options.output) {
            this.logger.info(`Write impacted tests to: ${options.output}`);
            await this.fileSystem.outputFile(options.output, impactedClasses);
        }
    }
}
