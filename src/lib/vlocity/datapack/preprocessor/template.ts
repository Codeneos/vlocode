import { VlocityDatapack } from 'lib/vlocity/datapack';
import { SassCompiler, ForkedSassCompiler } from 'lib/sass';
import { container } from 'lib/core/inject';

/**
 * Vlocity UI template pre-processor, mainly compiles SASS into CSS
 */
export default class TemplatePreprocessor {

    public constructor(private readonly sass: SassCompiler = container.get(ForkedSassCompiler)) {
    }

    /**
     * Pre-process template datapacks
     * @param datapack Datapack
     */
    public async preprocess(datapack: VlocityDatapack) {
        if (datapack.sass__c) {
            const result = await this.sass.compile(datapack.sass__c);

            if (result.status == 0) {
                datapack['%vlocity_namespace%__Css__c'] = result.text;
            } else {
                throw new Error(result.formatted);
            }
        }
    }
}