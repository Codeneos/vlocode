import { stat } from 'node:fs/promises';

import type { Logger } from '@vlocode/core';
import { DatapackLoader } from '@vlocode/vlocity';
import { mapAsync, Timer } from '@vlocode/util';

/**
 * Load Vlocity datapacks from a list of paths, where each path is either a folder (scanned
 * recursively for `*_DataPack.json` files) or an individual datapack file. Shared by the
 * `datapack deploy` and `datapack convert` commands.
 */
export async function loadDatapacks(loader: DatapackLoader, logger: Logger, paths: string[]) {
    logger.info(`Load datapacks: "${paths.join('", "')}"`);

    const datapackLoadTimer = new Timer();
    const datapacks = (await mapAsync(paths, async path => {
        const fileInfo = await stat(path);
        if (fileInfo.isDirectory()) {
            return loader.loadDatapacksFromFolder(path);
        }
        return [await loader.loadDatapack(path)];
    })).flat();

    if (datapacks.length === 0) {
        logger.error(`No datapacks found in specified paths: "${paths.join('", "')}"`);
    } else {
        logger.info(`Loaded ${datapacks.length} datapacks in [${datapackLoadTimer.stop()}]`);
    }

    return datapacks;
}
