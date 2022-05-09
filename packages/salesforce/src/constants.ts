/**
 * Default XML metadata header and render options
 */
export const MD_XML_OPTIONS = {
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true, indent: '    ', newline: '\n', normalizeTags: false, normalize: false }
};

/**
 * Client name used when talking to Salesforce over SOAP API
 */
export const API_CLIENT_NAME = 'Vlocode SOAP client';