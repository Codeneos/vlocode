/**
 * Default constants used in this extensipn
 */

import * as packageJson from '../package.json';

export const VERSION = packageJson.version;
export const CONFIG_SECTION = 'vlocity';
export const OUTPUT_CHANNEL_NAME = 'Vlocity';
export const NG_APP_NAME = 'Vlocode';
export const LOG_DATE_FORMAT = 'HH:mm:ss.SS';
export const NAMESPACE_PLACEHOLDER = /(%|)vlocity_namespace(%|)/gi;

export const exportQueryDefinitions =  require("exportQueryDefinitions.yaml");

export enum VlocodeCommand {
    refreshDatapack = 'vlocity.refreshDatapack',
    deployDatapack = 'vlocity.deployDatapack',
    viewDatapackGeneric = 'vlocity.viewDatapack.generic',
    exportDatapack = 'vlocity.exportDatapack',
    selectOrg = 'vlocity.selectOrg',
    buildDatapack  = 'vlocity.buildDatapack',
    buildParentKeyFiles  = 'vlocity.buildParentKeyFiles',
    adminCommands  = 'vlocity.adminCommands',
    refreshPriceBook  = 'vlocity.admin.refreshPriceBook',
    refreshProductHierarchy  = 'vlocity.admin.refreshProductHierarchy',
    updateAllProdAttribCommand  = 'vlocity.admin.updateAllProdAttribCommand',
    clearPlatformCache  = 'vlocity.admin.clearPlatformCache'
};
