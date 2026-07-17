import { existsSync } from 'fs';

import { CachedFileSystemAdapter, Container, FileSystem, Logger } from '@vlocode/core';
import { DatapackInfoService, DatapackLoader, VlocityDatapack } from '@vlocode/vlocity';
import { DatapackExportDefinitionStore, loadDatapacks as loadDatapackPaths } from '@vlocode/vlocity-deploy';
import { Timer } from '@vlocode/util';

import { DatapackExportFileLoader, DatapackExportDefinitions } from './datapackExportFileLoader';

/**
 * Export definition files loaded from the working directory when present.
 */
const defaultExportDefinitionFiles = [ 'export-definitions.yaml', 'export-definitions.yml', 'export-definitions.json' ];

/**
 * Load export definitions from the specified file into the {@link DatapackExportDefinitionStore} and
 * register the datapack types from the definitions on the {@link DatapackInfoService} so datapacks
 * report their actual datapack type (e.g. `ProductRule/<name>`) instead of the generic `SObject` type.
 * @param container Container holding the definition store and datapack info service
 * @param filePath Path of the export definitions file to load
 * @param logger Logger to report the loaded definitions to
 */
export async function loadExportDefinitions(container: Container, filePath: string, logger: Logger): Promise<DatapackExportDefinitions> {
    const definitions = await new DatapackExportFileLoader().loadDefinitions(filePath);
    const store = container.get(DatapackExportDefinitionStore);
    store.load(definitions);
    container.get(DatapackInfoService).registerDatapackDefinitions(
        store.objectDefinitions()
            // The generic SObject fallback definition does not define a datapack type for an object
            .filter(({ datapackType, objectType }) => objectType && datapackType && datapackType !== 'SObject')
            .map(({ datapackType, objectType }) => ({ datapackType, sobjectType: objectType }))
    );
    logger.info(`Loaded ${Object.keys(definitions).length} export definition(s) from: ${filePath}`);
    return definitions;
}

/**
 * Load the default export definitions file (`export-definitions.yaml`) from the working directory
 * when present; see {@link loadExportDefinitions}. Errors are reported as warnings so a malformed
 * definitions file does not fail the command.
 */
export async function loadDefaultExportDefinitions(container: Container, logger: Logger): Promise<void> {
    const file = defaultExportDefinitionFiles.find(file => existsSync(file));
    if (!file) {
        return;
    }
    try {
        await loadExportDefinitions(container, file, logger);
    } catch (error) {
        logger.warn(`Failed to load export definitions from ${file}: ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Load datapacks from the specified paths reporting progress to the logger; folders are scanned
 * recursively for datapacks and files are loaded as single datapacks. Shared by the deploy and
 * compare commands.
 * @param loader Datapack loader used to load the datapacks
 * @param paths Folders or datapack files to load
 * @param logger Logger to report load progress to
 * @param fileSystem Optional file system used to load the datapacks; when it caches file contents the
 * cache is released after loading as the datapack files are not read again (large catalogs otherwise
 * hold hundreds of MBs of raw JSON in the cache for the duration of the command)
 * @returns Array with the loaded datapacks; empty when no datapacks are found
 */
export async function loadDatapacks(loader: DatapackLoader, paths: string[], logger: Logger, fileSystem?: FileSystem): Promise<VlocityDatapack[]> {
    logger.info(`Load datapacks: "${paths.join('", "')}"`);

    const datapackLoadTimer = new Timer();
    const datapacks = await loadDatapackPaths(loader, paths);

    if (fileSystem instanceof CachedFileSystemAdapter) {
        fileSystem.clearCache();
    }

    if (datapacks.length == 0) {
        logger.error(`No datapacks found in specified paths: "${paths.join('", "')}"`);
    } else {
        logger.info(`Loaded ${datapacks.length} datapacks in [${datapackLoadTimer.stop()}]`);
    }

    return datapacks;
}
