import { CancellationToken } from '@vlocode/util';
import { DatapackLoader } from '@vlocode/vlocity';

import { DatapackComparer, DatapackComparerOptions, DatapackComparisonResult } from './datapackComparer';
import { DatapackConnectionOptions, createDatapackContainer, loadDatapacks } from './datapackDeploy';

interface DatapackCompareOptions extends DatapackComparerOptions, DatapackConnectionOptions {
}

/**
 * Compare 1 or more datapacks from the specified folders against the data in a target org without deploying them.
 * At minimum a connection or sfdxAlias should be specified which will tell the comparison to which environment to connect.
 *
 * This is a simple straight forward method that can be used to run a comparison without having to prepare and setup the
 * dependent classes and objects; see {@link DatapackComparer} for details on how datapacks are compared.
 * @param input The folder(s) to load the datapacks from that will be compared
 * @param options options that control the comparison and datapack conversion
 * @param cancelToken An optional cancellation token to abort the comparison
 * @returns A promise of the comparison result detailing per datapack root if it is in sync with the target org and how it mismatches
 */
export async function compare(input: string | string[], options: DatapackCompareOptions, cancelToken?: CancellationToken): Promise<DatapackComparisonResult> {
    const localContainer = await createDatapackContainer(options);
    const datapacks = await loadDatapacks(localContainer.new(DatapackLoader), input);
    if (!datapacks.length) {
        throw new Error(`No datapacks found in specified paths: ${input}`);
    }
    return localContainer.new(DatapackComparer).compare(datapacks, options, cancelToken);
}
