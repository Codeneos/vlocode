import 'jest';

import { LogLevel } from '@vlocode/core';

import {
    ExportProgressReporter,
    ProgressAwareLogWriter,
    clearLogInterceptor,
    setLogInterceptor
} from '.';

function logEntry(message: string, level: LogLevel = LogLevel.info) {
    return { level, time: new Date(0), category: 'Test', message };
}

function fakeStream(columns = 120) {
    const chunks: string[] = [];
    const stream = {
        isTTY: true,
        columns,
        write(chunk: string) {
            chunks.push(chunk);
            return true;
        }
    } as unknown as NodeJS.WriteStream;
    return { stream, chunks, output: () => chunks.join('') };
}

function fakeLogger() {
    const lines: string[] = [];
    const record = (...args: any[]) => { lines.push(args.join(' ')); };
    const logger = {
        info: record,
        log: record,
        verbose: record,
        warn: record,
        error: record,
        debug: record
    } as any;
    return { logger, lines };
}

describe('ProgressAwareLogWriter', () => {
    it('diverts entries the interceptor consumes and prints the rest', () => {
        const innerWrites: string[] = [];
        const inner = { write: (entry: any) => { innerWrites.push(entry.message); }, format: (entry: any) => `[fmt] ${entry.message}` };
        const writer = new ProgressAwareLogWriter(inner);
        const seen: string[] = [];
        // consume (suppress) warnings and above, let lower levels through
        const interceptor = (entry: any, format: () => string) => { seen.push(format()); return entry.level >= LogLevel.warn; };

        // no interceptor installed → straight to the inner writer
        writer.write(logEntry('before'));
        expect(innerWrites).toContain('before');

        setLogInterceptor(interceptor);
        writer.write(logEntry('routine info', LogLevel.info));
        writer.write(logEntry('a warning', LogLevel.error));
        clearLogInterceptor(interceptor);

        // after clearing → back to the inner writer
        writer.write(logEntry('after'));

        expect(seen).toContain('[fmt] routine info');
        expect(seen).toContain('[fmt] a warning');
        expect(innerWrites).toContain('routine info');   // not consumed → printed
        expect(innerWrites).not.toContain('a warning');  // consumed → suppressed
        expect(innerWrites).toContain('after');
    });

    it('only clears the interceptor that is currently installed', () => {
        const inner = { write: () => { /* unused */ }, format: (entry: any) => entry.message };
        const writer = new ProgressAwareLogWriter(inner);
        let calls = 0;
        const interceptor = () => { calls++; return true; };

        setLogInterceptor(interceptor);
        clearLogInterceptor(() => false); // a different function → must be a no-op
        writer.write(logEntry('x'));
        expect(calls).toBe(1);

        clearLogInterceptor(interceptor);
    });
});

describe('ExportProgressReporter (non-interactive)', () => {
    it('forward-prints throttled progress and a final summary', () => {
        const { logger, lines } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 2, rootDatapacks: 4, enabled: false });

        expect(reporter.isInteractive).toBe(false);

        reporter.start();
        reporter.beginBatch(0, 'Product2', 2);
        reporter.report({ phase: 'export', id: 'a', status: 'completed', progress: 1, total: 2 });
        reporter.report({ phase: 'export', id: 'b', status: 'completed', progress: 2, total: 2 });
        reporter.endBatch();

        reporter.beginBatch(1, 'Account', 2);
        reporter.report({ phase: 'export', id: 'c', status: 'completed', progress: 2, total: 2 });
        reporter.endBatch();
        reporter.succeed();

        expect(lines.some(line => line.includes('Exporting batch 1/2'))).toBe(true);
        expect(lines.some(line => /50% \(1\/2\)/.test(line))).toBe(true);
        expect(lines.some(line => /Exported 4 datapacks/.test(line))).toBe(true);
    });

    it('counts errors logged during the export and folds them into the summary', () => {
        const { logger, lines } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 1, rootDatapacks: 1, enabled: false });
        const writer = new ProgressAwareLogWriter({
            write: () => { /* non-interactive: still printed by the console writer */ },
            format: (entry: any) => `[fmt] ${entry.message}`
        });

        reporter.start();
        reporter.beginBatch(0, 'Product2', 1);
        reporter.report({ phase: 'export', id: 'a', status: 'completed', progress: 1, total: 1 });
        writer.write(logEntry('Error exporting a0X: boom', LogLevel.error));
        reporter.endBatch();
        reporter.succeed();

        expect(lines.some(line => /Exported 1 datapack in .*· 1 error/.test(line))).toBe(true);
    });
});

describe('ExportProgressReporter (interactive)', () => {
    it('renders a bar and a success summary to the stream', () => {
        const { stream, output } = fakeStream();
        const { logger } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 1, rootDatapacks: 2, enabled: true, stream });

        expect(reporter.isInteractive).toBe(true);

        reporter.start();
        reporter.beginBatch(0, 'Product2', 2);
        reporter.report({ phase: 'export', id: 'a', status: 'completed', progress: 1, total: 2 });
        reporter.endBatch();
        reporter.succeed();

        expect(output()).toContain('50%');
        expect(output()).toContain('Exported 1 datapack');
    });

    it('snaps the gauge to 100% when export ends and shows expand/write as a finalizing counter', () => {
        const { stream, output } = fakeStream();
        const { logger } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 1, rootDatapacks: 10, enabled: true, stream });

        reporter.start();
        reporter.beginBatch(0, 'Product2', 10);
        // export drifts to just under the (grown) total — the classic "stuck at 99%"
        reporter.report({ phase: 'export', progress: 9, total: 10, sourceKey: 'Product2/A' });
        reporter.report({ phase: 'expand', progress: 5, total: 10, sourceKey: 'Product2/A' });
        reporter.report({ phase: 'write', progress: 3, total: 10, sourceKey: 'Product2/A' });
        reporter.endBatch();
        reporter.succeed();

        const out = output();
        expect(out).toContain('Exporting Product2');
        expect(out).toContain('Expanding Product2');
        expect(out).toContain('Writing Product2');
        // gauge is snapped to 100% on the first non-export update instead of sticking at 90%
        expect(out).toContain('100%');
        // expand/write are shown as a moving sub-counter, not a second gauge
        expect(out).toContain('expanding 5/10');
        expect(out).toContain('writing 3/10');
        // the committed export count is the real pre-snap value
        expect(out).toContain('Exported 9 datapacks');
    });

    it('shows a live, growing API-call count from the supplied counter', () => {
        const { stream, output } = fakeStream();
        const { logger } = fakeLogger();
        let calls = 100;
        const reporter = new ExportProgressReporter({
            logger, totalBatches: 1, rootDatapacks: 2, enabled: true, stream, apiCalls: () => calls
        });

        reporter.start();    // baseline snapshot = 100
        reporter.beginBatch(0, 'Product2', 2);
        calls = 142;         // 42 calls into the export
        reporter.report({ phase: 'export', id: 'a', status: 'completed', progress: 1, total: 2 });
        calls = 384;         // 284 by the time it finishes
        reporter.endBatch();
        reporter.succeed();

        expect(output()).toContain('42 API calls');    // live, mid-export
        expect(output()).toContain('284 API calls');   // final summary
    });

    it('counts problems and dumps them once at the end instead of scrolling them above the bar', () => {
        const { stream, output } = fakeStream();
        const { logger } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 1, rootDatapacks: 2, enabled: true, stream });
        const inner = {
            write: () => { throw new Error('inner.write must not run while the bar is active'); },
            format: (entry: any) => `[fmt] ${entry.message}`
        };
        const writer = new ProgressAwareLogWriter(inner);

        reporter.start();
        reporter.beginBatch(0, 'Product2', 2);
        reporter.report({ phase: 'export', id: 'a', status: 'completed', progress: 1, total: 2 });
        writer.write(logEntry('Error exporting a0X: boom', LogLevel.error));
        writer.write(logEntry('No data found for id a0Y', LogLevel.warn));
        reporter.endBatch();
        reporter.succeed();

        const out = output();
        expect(out).toContain('problems logged during export');
        expect(out).toContain('[fmt] Error exporting a0X: boom');
        expect(out).toContain('1 error');
        expect(out).toContain('Exported 1 datapack');
    });
});
