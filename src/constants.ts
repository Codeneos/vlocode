/**
 * Default constants used in this extensipn
 */

const packageJson = require("../package.json");

export const VERSION = packageJson.version;
export const CONFIG_SECTION = 'vlocity';
export const OUTPUT_CHANNEL_NAME = 'Vlocity';
export const NG_APP_NAME = 'Vlocode';
export const LOG_DATE_FORMAT = 'HH:mm:ss.SS';
export const NAMESPACE_PLACEHOLDER = /(%|)vlocity_namespace(%|)/gi;

export const exportQueryDefinitions =  require("exportQueryDefinitions.yaml");