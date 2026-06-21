import 'jest';

import { LogLevel } from '@vlocode/core';

import {
    ExportProgressReporter,
    ProgressAwareLogWriter,
    ProgressBar,
    ProgressTracker,
    formatDuration,
    formatRate
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

describe('formatDuration', () => {
    it('formats sub-hour durations as m:ss', () => {
        expect(formatDuration(0)).toBe('0:00');
        expect(formatDuration(5000)).toBe('0:05');
        expect(formatDuration(65000)).toBe('1:05');
    });

    it('formats durations over an hour as h:mm:ss', () => {
        expect(formatDuration(3_725_000)).toBe('1:02:05');
    });

    it('returns a placeholder for non-finite input', () => {
        expect(formatDuration(Infinity)).toBe('--:--');
        expect(formatDuration(-1)).toBe('--:--');
    });
});

describe('formatRate', () => {
    it('uses one decimal below 10 and whole numbers above', () => {
        expect(formatRate(0)).toBe('0');
        expect(formatRate(2.345)).toBe('2.3');
        expect(formatRate(42.7)).toBe('43');
    });
});

describe('ProgressTracker', () => {
    it('clamps the ratio as the total grows while the dependency graph is discovered', () => {
        const tracker = new ProgressTracker();
        tracker.report(1, 2);
        expect(tracker.percent).toBe(50);

        // the exporter discovers more work, so the total grows and the percentage regresses honestly
        tracker.report(2, 4);
        expect(tracker.value).toBe(2);
        expect(tracker.total).toBe(4);
        expect(tracker.percent).toBe(50);

        tracker.report(3, 4);
        expect(tracker.percent).toBe(75);

        tracker.report(4, 4);
        expect(tracker.percent).toBe(100);
        expect(tracker.ratio).toBeLessThanOrEqual(1);
        expect(tracker.eta).toBeUndefined();
    });

    it('never reports a ratio above 1 even if value briefly exceeds a stale total', () => {
        const tracker = new ProgressTracker();
        tracker.report(5, 2);
        expect(tracker.ratio).toBeLessThanOrEqual(1);
        expect(tracker.percent).toBeLessThanOrEqual(100);
    });

    it('floors the total at minTotal so it never looks complete too early', () => {
        const tracker = new ProgressTracker({ minTotal: 10 });
        tracker.report(1, 2);
        expect(tracker.total).toBe(10);
        expect(tracker.percent).toBe(10);
    });

    it('accumulates committed batches on top of the running total', () => {
        const tracker = new ProgressTracker();
        tracker.report(2, 2);
        tracker.commitBatch();
        tracker.report(3, 3);
        expect(tracker.value).toBe(5);
        expect(tracker.total).toBe(5);
    });

    it('is indeterminate until a total is known', () => {
        const tracker = new ProgressTracker();
        expect(tracker.indeterminate).toBe(true);
        expect(tracker.percentText).toBe('--%');

        tracker.report(0, 4);
        expect(tracker.indeterminate).toBe(false);
    });

    it('produces a plain, colourless summary line', () => {
        const tracker = new ProgressTracker({ minTotal: 4 });
        tracker.report(1, 4);
        expect(tracker.summary()).toMatch(/^25% \(1\/4\)/);
    });
});

describe('ProgressBar', () => {
    it('hides the cursor, renders the percentage and restores on stop', () => {
        const { stream, output } = fakeStream();
        const bar = new ProgressBar({ stream, label: 'Test', total: 10, refreshIntervalMs: 1_000_000 });

        bar.start({ value: 0 });
        expect(output()).toContain('\x1B[?25l');

        bar.update({ value: 5, total: 10 });
        expect(output()).toContain('50%');

        bar.stop('done');
        expect(output()).toContain('done\n');
        expect(output()).toContain('\x1B[?25h');
    });

    it('prints log lines above the bar while active', () => {
        const { stream, chunks } = fakeStream();
        const bar = new ProgressBar({ stream, total: 4, refreshIntervalMs: 1_000_000 });

        bar.start({ value: 1 });
        bar.log('a line above the bar');
        bar.stop();

        expect(chunks).toContain('a line above the bar\n');
    });

    it('registers as the active bar only while running', () => {
        const { stream } = fakeStream();
        const bar = new ProgressBar({ stream, total: 4, refreshIntervalMs: 1_000_000 });

        expect(bar.isActive).toBe(false);
        bar.start({ value: 1 });
        expect(bar.isActive).toBe(true);
        bar.stop();
        expect(bar.isActive).toBe(false);
    });
});

describe('ProgressAwareLogWriter', () => {
    it('routes log output through the active bar and falls back to the inner writer otherwise', () => {
        const { stream, chunks } = fakeStream();
        const innerWrites: string[] = [];
        const inner = {
            write: (entry: any) => { innerWrites.push(entry.message); },
            format: (entry: any) => `[fmt] ${entry.message}`
        };
        const writer = new ProgressAwareLogWriter(inner);

        // no active bar → delegates to the inner writer unchanged
        writer.write(logEntry('before'));
        expect(innerWrites).toContain('before');

        const bar = new ProgressBar({ stream, total: 4, refreshIntervalMs: 1_000_000 });
        bar.start({ value: 1 });
        writer.write(logEntry('during', LogLevel.error));
        bar.stop();

        // while the bar runs the formatted line is printed above it, not via the inner writer
        expect(chunks).toContain('[fmt] during\n');
        expect(innerWrites).not.toContain('during');

        // after stop → back to the inner writer
        writer.write(logEntry('after'));
        expect(innerWrites).toContain('after');
    });
});

describe('ExportProgressReporter (non-interactive)', () => {
    it('forward-prints throttled progress and a final summary', () => {
        const { logger, lines } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 2, rootDatapacks: 4, enabled: false });

        expect(reporter.isInteractive).toBe(false);

        reporter.start();
        reporter.beginBatch(0, 'Product2', 2);
        reporter.report({ id: 'a', status: 'completed', progress: 1, total: 2 });
        reporter.report({ id: 'b', status: 'completed', progress: 2, total: 2 });
        reporter.endBatch();

        reporter.beginBatch(1, 'Account', 2);
        reporter.report({ id: 'c', status: 'completed', progress: 2, total: 2 });
        reporter.endBatch();
        reporter.succeed();

        expect(lines.some(line => line.includes('Exporting batch 1/2'))).toBe(true);
        expect(lines.some(line => /Export progress.*50%/.test(line))).toBe(true);
        expect(lines.some(line => /Exported 4 datapacks/.test(line))).toBe(true);
    });

    it('reports the number of failed datapacks in the summary', () => {
        const { logger, lines } = fakeLogger();
        const reporter = new ExportProgressReporter({ logger, totalBatches: 1, rootDatapacks: 1, enabled: false });

        reporter.start();
        reporter.beginBatch(0, 'Product2', 1);
        reporter.report({ id: 'a', status: 'failed', progress: 1, total: 1 });
        reporter.endBatch();
        reporter.succeed();

        expect(lines.some(line => /Exported 1 datapack in .*, 1 failed/.test(line))).toBe(true);
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
        reporter.report({ id: 'a', status: 'completed', progress: 1, total: 2 });
        reporter.endBatch();
        reporter.succeed();

        expect(output()).toContain('50%');
        expect(output()).toContain('Exported 1 datapack');
    });
});
