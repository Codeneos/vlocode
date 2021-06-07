import * as path from 'path';
import { promisify } from 'util';
import * as Mocha from 'mocha';
import * as glob from 'glob';
import 'source-map-support/register';

const isDebuggerAttached = /--debug|--inspect/.test(process.execArgv.join(' '));

const testRunnerConfig : Mocha.MochaOptions = {
    ui: 'bdd',
    useColors: !isDebuggerAttached,
    reporter: isDebuggerAttached ? 'spec' : 'mocha-multi-reporters',
    timeout: isDebuggerAttached ? 0 : 2000,
    reporterOptions: {
        reporterEnabled: 'spec, mocha-junit-reporter, mocha-sonarqube-reporter',
        mochaJunitReporterReporterOptions: {
            mochaFile: path.join(__dirname, '../../junit.xml')
        },
        mochaSonarqubeReporterReporterOptions: {
            output: path.join(__dirname, '../../testReport.xml')
        }
    }
};

export async function run(): Promise<void> {
    // ensure mock fs is loaded
    require('mock-fs');

    // Create the mocha test
    const mocha = new Mocha(testRunnerConfig);
    const testsRoot = path.resolve(__dirname);
    const tests = await promisify(glob)('**/**.test.js', { cwd: testsRoot });

    for (const test of tests) {
        mocha.addFile(path.join(testsRoot, test));
    }

    // Run the mocha test
    return new Promise((resolve, reject) => mocha.run(failures => failures ? reject(new Error(`${failures} tests failed.`)) : resolve()));
}