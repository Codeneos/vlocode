import { SassCompileOptions, SassCompiler, SassCompileResult } from './interface';
import { container, injectable, LifecyclePolicy, Logger } from '@vlocode/core';
import { SassCompilerThreaded } from './sassCompilerThreaded';
import { SassCompilerImpl } from './sassCompilerImpl';

/**
 * A proxy for the SASS compiler that automatically selects the best available implementation.
 * It will use an external SASS compiler if available, otherwise it will fall back to the internal implementation.
 */
@injectable({ provides: SassCompiler, priority: 10, lifecycle: LifecyclePolicy.singleton })
export class SassCompilerProxy implements SassCompiler {

    private activeCompiler?: SassCompiler;

    public constructor(private logger: Logger) {
    }

    public compile(data: string, options?: SassCompileOptions): Promise<SassCompileResult> {
        return this.getCompiler().compile(data, options)
    }

    private getCompiler(): SassCompiler {
        if (this.activeCompiler) {
            return this.activeCompiler;
        }

       const externalCompiler = container.get(SassCompilerThreaded);
        if (externalCompiler.initialize()) {
            this.logger.verbose('Using external SASS compiler');
            this.activeCompiler = externalCompiler;
        } else {
            this.logger.warn('Unable to start external SASS compiler, using internal SASS compiler instead');
            this.activeCompiler = container.get(SassCompilerImpl);
        }
        return this.activeCompiler;
    }
}
