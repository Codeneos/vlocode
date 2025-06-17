import * as sass from 'sass';
import { SassImporter } from './sassImporter';
import { SassCompileOptions, SassCompiler, SassCompileResult } from './interface';
import { injectable, LifecyclePolicy } from '@vlocode/core';

@injectable({ provides: SassCompiler, lifecycle: LifecyclePolicy.singleton })
export class SassCompilerImpl implements SassCompiler {
    public constructor(private logger: sass.Logger) {
    }

    public async compile(data: string, options?: SassCompileOptions): Promise<SassCompileResult> {
        const result = sass.compileString(data, {
            style: options?.style === 'compressed' ? 'compressed' : 'expanded',
            verbose: false,
            sourceMap: false,
            logger: this.logger,
            importers: [
                new SassImporter(options?.importer?.includePaths ?? [ '.' ]).bind()
            ]
        });
            
        return {
            css: result.css,
            loadedUrls: result.loadedUrls.map(url => url.href),
            sourceMap: result.sourceMap
        };
    }
}
