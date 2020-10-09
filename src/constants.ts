

/**
 * Default constants used in this extensipn
 */

// @ts-ignore
import * as packageJson from '../package.json';

export const VERSION = packageJson.version;
export const API_CLIENT_NAME = 'Vlocode SOAP client';
export const CONFIG_SECTION = 'vlocity';
export const OUTPUT_CHANNEL_NAME = 'Vlocity';
export const NG_APP_NAME = 'Vlocode';
export const LOG_DATE_FORMAT = 'HH:mm:ss.SS';
export const NAMESPACE_PLACEHOLDER = /(%|)vlocity_namespace(%|)/gi;
export const MD_XML_OPTIONS = {
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '    ', newline: '\n' }
};
export const DATAPACK_RESERVED_FIELDS = [
    'VlocityDataPackType',
    'VlocityMatchingRecordSourceKey',
    'VlocityLookupRecordSourceKey',
    'VlocityRecordSourceKey',
    'VlocityRecordSObjectType'
];

export enum VlocodeCommand {
    refreshDatapack = 'vlocode.refreshDatapack',
    deployDatapack = 'vlocode.deployDatapack',
    viewDatapackGeneric = 'vlocode.viewDatapack.generic',
    exportDatapack = 'vlocode.exportDatapack',
    selectOrg = 'vlocode.selectOrg',
    buildDatapack  = 'vlocode.buildDatapack',
    openInSalesforce  = 'vlocode.openSalesforce',
    renameDatapack  = 'vlocode.renameDatapack',
    cloneDatapack  = 'vlocode.cloneDatapack',
    buildParentKeyFiles  = 'vlocode.buildParentKeyFiles',
    adminCommands  = 'vlocode.adminCommands',
    refreshPriceBook  = 'vlocode.admin.refreshPriceBook',
    refreshProductHierarchy  = 'vlocode.admin.refreshProductHierarchy',
    refreshPriceBookAndProductHierarchy  = 'vlocode.admin.refreshPriceBookAndProductHierarchy',
    updateAllProdAttribCommand  = 'vlocode.admin.updateAllProdAttribCommand',
    clearPlatformCache  = 'vlocode.admin.clearPlatformCache',
    deployMetadata  = 'vlocode.deployMetadata',
    destroyMetadata  = 'vlocode.destroyMetadata',
    refreshMetadata  = 'vlocode.refreshMetadata',
    selectApiVersion  = 'vlocode.selectApiVersion',
    createMetadataCommand  = 'vlocode.createMetadataCommand',
    execAnonymousCommand = 'vlocode.execAnonymousCommand',
    viewInSalesforce = 'vlocode.viewInSalesforce',
    createApexClass = 'vlocode.createApexClass',
    createLwc = 'vlocode.createLwc',
    clearDeveloperLogs = 'vlocode.clearDeveloperLogs',
    setTraceFlags = 'vlocode.setTraceFlags',
    setLogVisibility = 'vlocode.setLogVisibility',
    execRestApi = 'vlocode.execRestApi'
}
