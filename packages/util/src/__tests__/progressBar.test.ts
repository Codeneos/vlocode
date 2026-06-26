import 'jest';

import { ProgressBar } from '../progressBar';

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

    it('tracks isActive across start/stop', () => {
        const { stream } = fakeStream();
        const bar = new ProgressBar({ stream, total: 4, refreshIntervalMs: 1_000_000 });

        expect(bar.isActive).toBe(false);
        bar.start({ value: 1 });
        expect(bar.isActive).toBe(true);
        bar.stop();
        expect(bar.isActive).toBe(false);
    });

    it('renders caller-supplied detail lines beneath the gauge', () => {
        const { stream, output } = fakeStream();
        const bar = new ProgressBar({ stream, total: 10, refreshIntervalMs: 1_000_000 });

        bar.start({ value: 5, details: ['5 items  ·  3 records'] });
        bar.stop();

        expect(output()).toContain('5 items  ·  3 records');
    });

    it('redraws a multi-line block in place (moves the cursor up the block height)', () => {
        const { stream, output } = fakeStream();
        const bar = new ProgressBar({ stream, total: 10, refreshIntervalMs: 1_000_000 });

        bar.start({ value: 1, details: ['line one', 'line two'] });
        bar.update({ value: 2 });
        bar.stop();

        // gauge + 2 detail lines = 3 rows, so a redraw returns the cursor up 2 lines
        expect(output()).toContain('\x1B[2A');
    });

    it('re-evaluates a details thunk on every redraw', () => {
        const { stream, output } = fakeStream();
        let counter = 0;
        const bar = new ProgressBar({ stream, total: 10, refreshIntervalMs: 1_000_000, details: () => [`count ${++counter}`] });

        bar.start({ value: 1 });
        bar.update({ value: 2 });
        bar.stop();

        expect(output()).toContain('count 1');
        expect(output()).toContain('count 2');
    });

    it('omits ANSI colour when the stream is not a TTY', () => {
        const { FORCE_COLOR, NO_COLOR } = process.env;
        delete process.env.FORCE_COLOR;
        delete process.env.NO_COLOR;
        try {
            const { stream, output } = fakeStream();
            (stream as { isTTY: boolean }).isTTY = false;
            const bar = new ProgressBar({ stream, label: 'Plain', total: 4, refreshIntervalMs: 1_000_000 });

            bar.start({ value: 2 });
            bar.stop();

            // no SGR colour escapes (the cursor-control escapes are still emitted)
            // eslint-disable-next-line no-control-regex -- asserting the ESC colour sequence is absent
            expect(output()).not.toMatch(/\x1B\[[0-9;]*m/);
        } finally {
            if (FORCE_COLOR !== undefined) { process.env.FORCE_COLOR = FORCE_COLOR; }
            if (NO_COLOR !== undefined) { process.env.NO_COLOR = NO_COLOR; }
        }
    });
});
