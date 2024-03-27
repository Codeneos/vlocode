import { Logger, LogManager, FileSystem, injectable } from '@vlocode/core';
import { Timer, stringEqualsIgnoreCase, unique } from '@vlocode/util';
import { existsSync} from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

import { Parser } from '@vlocode/apex';
import { Argument, Option, Command } from '../command';

interface ApexClassInfo {
    name: string,
    file: string,
    isAbstract: boolean,
    isTest: boolean,
    refs: string[],
    testClasses?: string[]
}

@injectable()
export default class extends Command {

    static description = 'Find impacted unit tests for a given set of APEX classes';

    static args = [
        new Argument('<folders...>', 'path to a folder containing the APEX classes files and triggers to parse')
            .argParser((value, previous: string[] | undefined) => {
                if (!existsSync(value)) {
                    throw new Error('No such folder exists');
                }
                return (previous ?? []).concat([ value ]);
            }).argRequired()
    ];

    static options = [
        new Option('--classes <classes...>', 'list of classes to find impacted tests for'),
        new Option('--output <file>', 'path to the file to which to write the impacted tested output as JSON').default('impactedTests.json')
    ];

    constructor(
        private fileSystem: FileSystem,
        private logger: Logger = LogManager.get('vlocode-cli')
    ) {
        super();
    }

    public async run(folders: string[], options: { classes?: string[] }) {
        const timerAll = new Timer();

        const data = await this.parseSourceFiles(folders);
        const testClasses = Object.values(data).filter((info) => info.isTest);

        this.logger.info(`Parsed ${Object.keys(data).length} in ${timerAll.toString('ms')}`);
        this.logger.info(`Found ${testClasses.length} test classes`);

        for (const classInfo of Object.values(data)) {
            if (classInfo.isTest) {
                continue;
            }

            const directTestClasses = testClasses.filter(testClass =>
                testClass.refs.some(ref => stringEqualsIgnoreCase(ref, classInfo.name))
            );
            const indirectTestClasses = testClasses.filter(testClass =>
                testClass.refs.some(ref => {
                    const refInfo = data[ref.toLowerCase()];
                    return refInfo && refInfo.refs.some(ref => stringEqualsIgnoreCase(ref, classInfo.name));
                })
            );

            classInfo.testClasses = [
                ...directTestClasses,
                ...indirectTestClasses
            ].map(testClass => testClass.name);
        }

        for (const className of options.classes ?? []) {
            const classInfo = data[className.toLowerCase()];
            if (!classInfo) {
                this.logger.error(`Class ${className} not found`);
                continue;
            }

            this.logger.info(`Class ${chalk.bold(classInfo.name)} is referenced by ${chalk.bold(classInfo.testClasses?.length ?? 0)} test classes`);
            if (classInfo.testClasses?.length) {
                this.logger.info(`Test classes: ${classInfo.testClasses.join(', ')}`);
            }
        }
        this.logger.info(`Write impacted tests to impactedTests.json`);
        await this.fileSystem.writeFile('impactedTests.json', Buffer.from(JSON.stringify(data, null, 4)));
        this.logger.info(`Parsed ${Object.keys(data).length} in ${timerAll.toString('ms')}`);
    }

    private async parseSourceFiles(folders: string[]) {
        const data: Record<string, ApexClassInfo> = {};

        for (const folder of folders) {
            for await (const { buffer, file } of this.readSourceFiles(folder)) {
                const parseTimer = new Timer();
                const parser = new Parser(buffer);
                const struct = parser.getCodeStructure();

                for (const classInfo of struct.classes) {
                    //const refs = parser.getReferencedTypes({ excludeSystemTypes: true });
                    data[classInfo.name.toLowerCase()] = {
                        name: classInfo.name,
                        file,
                        isAbstract: !!classInfo.isAbstract,
                        isTest: !!classInfo.isTest,
                        refs: [...unique(classInfo.refs, ref => ref.name.toLowerCase(), ref => ref.name)]
                    };
                }

                this.logger.info(`Parsed ${file} in ${parseTimer.toString('ms')}`);
            }
        }

        return data;
    }

    private async* readSourceFiles(folder: string){
        for (const file of await this.fileSystem.readDirectory(folder)) {
            const fullPath = path.join(folder, file.name);
            if (file.isDirectory()) {
                yield* this.readSourceFiles(fullPath);
            }
            if (file.isFile() && file.name.endsWith('.cls') || file.name.endsWith('.trigger')) {
                yield {
                    buffer: await this.fileSystem.readFile(fullPath),
                    fullPath,
                    file: file.name
                };
            }
        }
    }
}
