import path from 'node:path';

import { Args, Flags } from '@oclif/core';
import chalk from 'chalk';
import { existsSync } from 'fs-extra';

import { FileSystem } from '@vlocode/core';
import { Timer, stringEqualsIgnoreCase, unique } from '@vlocode/util';
import { Parser } from '@vlocode/apex';

import { BaseCommand } from '../../baseCommand';

interface ApexClassInfo {
    name: string;
    file: string;
    isAbstract: boolean;
    isTest: boolean;
    refs: string[];
    testClasses?: string[];
}

export default class ImpactedTests extends BaseCommand<typeof ImpactedTests> {

    static description = 'Find impacted unit tests for a given set of APEX classes';

    static args = {
        folders: Args.string({
            description: 'path to a folder containing the APEX class files and triggers to parse',
            required: true,
        }),
    };

    static flags = {
        classes: Flags.string({
            multiple: true,
            summary: 'list of classes to find impacted tests for',
        }),
        output: Flags.string({
            default: 'impactedTests.json',
            summary: 'path to the file to which to write the impacted tests output as JSON',
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> ./force-app/main/default/classes',
        '<%= config.bin %> <%= command.id %> ./classes --classes MyService,MyController',
    ];

    private get fileSystem() {
        return this.container.get(FileSystem);
    }

    public async run() {
        const folders = this.positionals;
        for (const folder of folders) {
            if (!existsSync(folder)) {
                this.error(`No such folder exists: ${folder}`);
            }
        }

        const timerAll = new Timer();

        const data = await this.parseSourceFiles(folders);
        const testClasses = Object.values(data).filter(info => info.isTest);

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

        for (const className of this.flags.classes ?? []) {
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

        this.logger.info(`Write impacted tests to ${this.flags.output}`);
        await this.fileSystem.writeFile(this.flags.output, Buffer.from(JSON.stringify(data, null, 4)));
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

    private async* readSourceFiles(folder: string): AsyncGenerator<{ buffer: Buffer; file: string }> {
        for (const file of await this.fileSystem.readDirectory(folder)) {
            const fullPath = path.join(folder, file.name);
            if (file.isDirectory()) {
                yield* this.readSourceFiles(fullPath);
            }
            if (file.isFile() && (file.name.endsWith('.cls') || file.name.endsWith('.trigger'))) {
                yield {
                    buffer: await this.fileSystem.readFile(fullPath),
                    file: file.name
                };
            }
        }
    }
}
