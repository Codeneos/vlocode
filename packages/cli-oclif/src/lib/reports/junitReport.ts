import stripAnsi from 'strip-ansi';
import { XML } from '@vlocode/util';

/**
 * Junit report object
 */
export class JunitReport {
    private readonly testsuites = new Map<string, JunitTestSuite>();

    public constructor(public readonly name?: string) {}

    public get passedCount() {
        return [...this.testsuites.values()].reduce((sum, ts) => sum + ts.passedCount, 0);
    }

    public get failedCount() {
        return [...this.testsuites.values()].reduce((sum, ts) => sum + ts.failedCount, 0);
    }

    public static async load(xml: string) {
        const reportData = XML.parse(xml);
        const report = new JunitReport(reportData.testsuites.$.name);

        for (const testSuite of reportData.testsuites.testsuite) {
            const suiteName = testSuite.$.name;

            for (const testCaseData of testSuite.testcase) {
                const testCase = new JunitTestCase(
                    testCaseData.$.name,
                    testCaseData.$.classname,
                    testCaseData.$.time ? parseFloat(testCaseData.$.time) * 1000 : 0,
                );
                testCase.systemOut = testCaseData['system-out']?.[0];

                if (testCaseData.failure) {
                    testCase.setOutcome(false, testCaseData.failure[0].$.message);
                    testCase.setStacktrace(testCaseData.failure[0]._);
                } else {
                    testCase.setOutcome(true);
                }

                report.addTestCase(suiteName, testCase);
            }
        }

        return report;
    }

    public toXml() {
        return XML.stringify({
            testsuites: this.toXmlObject(),
        });
    }

    public toXmlObject() {
        const testSuites = [...this.testsuites.values()];
        return {
            $: {
                ...(this.name ? { name: this.name } : {}),
                tests: testSuites.reduce((sum, ts) => sum + ts.totalCount, 0),
                failures: testSuites.reduce((sum, ts) => sum + ts.failedCount, 0),
                time: (testSuites.reduce((sum, ts) => sum + ts.totalTime, 0) / 1000).toFixed(3),
            },
            testsuite: testSuites.map((tc, i) => tc.toXmlObject(i)),
        };
    }

    public getTestSuite(name: string): JunitTestSuite {
        if (this.testsuites.has(name)) {
            return this.testsuites.get(name)!;
        }

        const suite = new JunitTestSuite(name);
        this.testsuites.set(name, suite);
        return suite;
    }

    public addTestCase(suiteName: string, testCase: JunitTestCase): void {
        this.getTestSuite(suiteName).addTestCase(testCase);
    }

    public removeTestCase(testCase: JunitTestCase): void {
        for (const suite of this.testsuites.values()) {
            suite.removeTestCase(testCase);
        }
    }

    public *getTestCases() {
        for (const suite of this.testsuites.values()) {
            yield* suite.getTestCases();
        }
    }

    public getTestSuites() {
        return this.testsuites.values();
    }
}

/**
 * Junit test suite' contains one or more test cases
 */
export class JunitTestSuite {
    private readonly testCases = new Array<JunitTestCase>();

    public get totalCount() {
        return this.testCases.length;
    }

    public get passedCount() {
        return this.totalCount - this.failedCount;
    }

    public get failedCount() {
        return this.testCases.filter(tc => !tc.passed).length;
    }

    public get totalTime() {
        return this.testCases.reduce((sum, tc) => sum + tc.time, 0);
    }

    public constructor(public readonly name: string) {}

    public toXmlObject(id: number) {
        return {
            $: {
                id: id,
                name: this.name,
                tests: this.totalCount,
                failures: this.failedCount,
                time: (this.totalTime / 1000).toFixed(3),
            },
            testcase: this.testCases.map(tc => tc.toXmlObject()),
        };
    }

    public addTestCase(testCase: JunitTestCase) {
        this.testCases.push(testCase);
    }

    public removeTestCase(testCase: JunitTestCase) {
        const index = this.testCases.indexOf(testCase);
        if (index > 0) {
            this.testCases.splice(index, 1);
        }
    }

    public getTestCases() {
        return [...this.testCases][Symbol.iterator]();
    }
}

export class JunitTestCase {
    public passed?: boolean;
    public message?: string;
    public stacktrace?: string;
    public systemOut?: string;
    public readonly time: number; // Time in MS

    public constructor(public readonly name: string, public readonly classname: string, time: number | string = 0) {
        if (typeof time !== 'number') {
            this.time = parseFloat(time) || 0;
        } else {
            this.time = time;
        }
    }

    public toXmlObject() {
        const result: Record<string, unknown> = {
            $: {
                name: this.name,
                classname: this.classname,
                time: (this.time / 1000).toFixed(3),
            },
        };

        if (!this.passed) {
            result.failure = {
                $: {
                    message: this.message,
                },
                ...(this.stacktrace ? { _: stripAnsi(this.stacktrace) } : {}),
            };
        }

        if (this.systemOut) {
            result['system-out'] = stripAnsi(this.systemOut);
        }

        return result;
    }

    public setOutcome(passed: true): this;
    public setOutcome(passed: false, message: string): this;
    public setOutcome(passed: boolean, message?: string): this {
        this.passed = passed;
        this.message = message;
        return this;
    }

    public setStacktrace(trace: string) {
        this.stacktrace = trace;
        return this;
    }

    public appendStacktrace(trace: string) {
        this.stacktrace = (this.stacktrace ?? '') + trace;
        return this;
    }

    public setSystemOut(systemOut: string) {
        this.systemOut = systemOut;
        return this;
    }

    public appendSystemOut(systemOut: string) {
        this.systemOut = (this.systemOut ?? '') + systemOut;
        return this;
    }
}
