import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';
import { promisify } from 'util';

const testRunnerConfig : Mocha.MochaOptions = {
	ui: 'bdd',
	useColors: true,
    reporter: process.env.TEST_RESULTS_FILE ? 'mocha-sonarqube-reporter' : null,
    reporterOptions: {
        output: process.env.TEST_RESULTS_FILE
    }
};

export async function run(): Promise<void> {
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