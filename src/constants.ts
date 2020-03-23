

/**
 * Default constants used in this extensipn
 */

const packageJson = require('../package.json');
import metadataTypes = require('metadataTypes.yaml');

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
export const SF_META_EXTENSIONS = [ '-meta.xml' ]
    .concat(Object.values(metadataTypes).map(type => type.fileExtensions).flat());

export enum VlocodeCommand {
    refreshDatapack = 'vlocity.refreshDatapack',
    deployDatapack = 'vlocity.deployDatapack',
    viewDatapackGeneric = 'vlocity.viewDatapack.generic',
    exportDatapack = 'vlocity.exportDatapack',
    selectOrg = 'vlocity.selectOrg',
    buildDatapack  = 'vlocity.buildDatapack',
    openInSalesforce  = 'vlocity.openSalesforce',
    renameDatapack  = 'vlocity.renameDatapack',
    cloneDatapack  = 'vlocity.cloneDatapack',
    buildParentKeyFiles  = 'vlocity.buildParentKeyFiles',
    adminCommands  = 'vlocity.adminCommands',
    refreshPriceBook  = 'vlocity.admin.refreshPriceBook',
    refreshProductHierarchy  = 'vlocity.admin.refreshProductHierarchy',
    refreshPriceBookAndProductHierarchy  = 'vlocity.admin.refreshPriceBookAndProductHierarchy',
    updateAllProdAttribCommand  = 'vlocity.admin.updateAllProdAttribCommand',
    clearPlatformCache  = 'vlocity.admin.clearPlatformCache',
    deployMetadata  = 'vlocity.deployMetadata',
    destroyMetadata  = 'vlocity.destroyMetadata',
    refreshMetadata  = 'vlocity.refreshMetadata',
    selectApiVersion  = 'vlocity.selectApiVersion',
    createMetadataCommand  = 'vlocity.createMetadataCommand',
    execAnonymousCommand = 'vlocity.execAnonymousCommand',
    viewInSalesforce = 'vlocity.viewInSalesforce',
    createApexCLass = 'vlocity.createApexCLass',
    createLwc = 'vlocity.createLwc'
}
