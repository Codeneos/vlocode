import 'jest';

import { ProgressTracker, formatCount, formatDuration, formatRate } from '../progressTracker';

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

describe('formatCount', () => {
    it('adds thousands separators', () => {
        expect(formatCount(42)).toBe('42');
        expect(formatCount(1284)).toBe('1,284');
    });
});

describe('ProgressTracker', () => {
    it('clamps the ratio as the total grows while work is discovered', () => {
        const tracker = new ProgressTracker();
        tracker.report(1, 2);
        expect(tracker.percent).toBe(50);

        tracker.report(2, 4);
        expect(tracker.value).toBe(2);
        expect(tracker.total).toBe(4);
        expect(tracker.percent).toBe(50);

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

    it('reset() clears the gauge and applies a new floor', () => {
        const tracker = new ProgressTracker({ minTotal: 5 });
        tracker.report(3, 8);
        tracker.reset(2);
        expect(tracker.value).toBe(0);
        expect(tracker.total).toBe(2);
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

    it('shows elapsed time instead of an ETA once there is no time remaining', () => {
        const tracker = new ProgressTracker();
        tracker.report(5, 5);
        expect(tracker.timeText).toContain('elapsed');
        expect(tracker.timeText).not.toContain('ETA');
    });
});
