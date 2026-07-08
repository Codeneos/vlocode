import { MultiStageOutput, MultiStageOutputOptions } from '@oclif/multi-stage-output';

import { InterceptedProblems } from './progressLogWriter';
import { detectInteractive } from './exportProgressReporter';

/**
 * sf-CLI-style live task list for multi-phase operations, built on the official
 * `@oclif/multi-stage-output` renderer (ink-based: per-stage timers, info blocks, resize-safe,
 * with an automatic plain-line fallback on non-TTY/CI terminals).
 *
 * This wrapper pairs the renderer with the CLI's {@link InterceptedProblems} log interception:
 * while the ink view owns an interactive terminal, engine log output is diverted — warnings and
 * errors are tallied and a capped sample is dumped after the view stops (a `--log-file` still
 * receives everything). On non-TTY terminals nothing is consumed; the renderer's own CI mode
 * prints stage transitions as forward lines alongside the normal log output.
 */
export class MultiStageProgress<T extends Record<string, unknown>> {

    private readonly mso: MultiStageOutput<T>;
    private readonly problems: InterceptedProblems;
    private stopped = false;

    constructor(options: Omit<MultiStageOutputOptions<T>, 'jsonEnabled'>) {
        this.mso = new MultiStageOutput<T>({ ...options, jsonEnabled: false });
        this.problems = new InterceptedProblems({ consume: detectInteractive() }).install();
    }

    /** Advance to a stage, marking stages in between as completed. */
    public goto(stage: string, data?: Partial<T>): void {
        this.mso.goto(stage, data);
    }

    /** Advance to a stage, marking stages in between as skipped. */
    public skipTo(stage: string, data?: Partial<T>): void {
        this.mso.skipTo(stage, data);
    }

    /** Update the data consumed by the info blocks without changing stage. */
    public update(data: Partial<T>): void {
        this.mso.updateData(data);
    }

    /** Stop with the current stage completed (or the given final status) and dump collected problems. */
    public succeed(finalStatus?: Parameters<MultiStageOutput<T>['stop']>[0]): void {
        this.teardown(() => this.mso.stop(finalStatus));
    }

    /** Stop with the current stage marked failed and dump any collected problems. */
    public fail(): void {
        this.teardown(() => this.mso.error());
    }

    /** ` · N errors, M warnings` suffix for summary lines; empty when clean. */
    public get problemSuffix(): string {
        return this.problems.suffix;
    }

    private teardown(stop: () => void): void {
        if (this.stopped) {
            return;
        }
        this.stopped = true;
        this.problems.uninstall();
        stop();
        this.problems.dump();
    }
}
