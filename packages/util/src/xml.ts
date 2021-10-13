import * as xmlParser from 'fast-xml-parser';
import * as he from 'he';

const DEFAULT_XML_OPTIONS = {
    attributeNamePrefix : '',
    attrNodeName: '$',
    textNodeName : '#text',
    ignoreAttributes : false,
    ignoreNameSpace : false,
    allowBooleanAttributes : true,
    parseNodeValue : true,
    parseAttributeValue : true,
    trimValues: true,
    cdataTagName: '__cdata', // default is 'false'
    cdataPositionChar: '\\c',
    parseTrueNumberOnly: false,
    arrayMode: false, // "strict"
    tagValueProcessor : val => he.decode(val),
    attrValueProcessor: val => he.decode(val, { isAttributeValue: true })
};

const DEFAULT_ENCODE_XML_OPTIONS = {
    supressEmptyNode: false,
    tagValueProcessor: val => he.escape(String(val)),
    attrValueProcessor: val => he.escape(String(val))
};

export interface XMLParseOptions {
    trimValues?: boolean;
    ignoreAttributes?: boolean;
}

export interface XMLStringfyOptions {
    trimValues?: boolean;
    headless?: boolean;
    stripEmptyNodes?: boolean;
}

export namespace XML {

    /**
     * Parse XML into a JSON object with the default options.
     * @param xml XML String
     * @returns 
     */
    export function parse(xml: string | Buffer, options: XMLParseOptions = {}) : any {
        if (typeof xml !== 'string') {
            xml = xml.toString();
        }
        return xmlParser.parse(xml, {...DEFAULT_XML_OPTIONS, ...options} , true);
    }

    /**
     * Convert JSON object into XML string
     * @param jsonObj JSOn Object
     * @param indent Indent level; if set pretty prints the XML otherwise omits pretty prtining
     * @returns 
     */
    export function stringify(jsonObj: any, indent?: number | string, options: XMLStringfyOptions = {}) : string {
        const indentOptions = {
            format: indent !== undefined,
            supressEmptyNode: options.stripEmptyNodes,
            indentBy: indent !== undefined ? typeof indent === 'string' ? indent : ' '.repeat(indent) : undefined,
        };
        const xmlString = new xmlParser.j2xParser({...DEFAULT_XML_OPTIONS, ...DEFAULT_ENCODE_XML_OPTIONS, ...indentOptions}).parse(jsonObj);
        if (options?.headless !== true) {
            return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlString}`;
        }
        return xmlString;
    }

    /**
     * Get the name of the root element of a XML string excluding the XML deceleration:
     * ```xml
     * <!-- Returns name of first none-comment root tag: rootTag -->
     * <rootTag>
     *    <inner />
     * </rootTag
     * ```
     * @param xml XML string or buffer
     * @returns Name of the root tag in the XML file
     */
    export function getRootTagName(xml: string | Buffer) {
        if (typeof xml !== 'string') {
            xml = xml.toString();
        }
        if (xml.trimStart().startsWith('<?xml ')) {
            return xml.match(/<([^-?!][\w\d]*)/im)?.[1];
        }
    }

    /**
     * Determine if the specified string has a XML declaration and a root tag if so returns true otherwise false (depends on getRootTagName)
     * @param xml XML string or buffer
     * @returns true when this the buffer has a valid XML declaration and root tag otherwise false
     */
    export function isXml(xml: string | Buffer) {
        return !!getRootTagName(xml);
    }

    /**
     * Normalize an XML string by removing any line breaks, tabs and comment blocks. Trims all values from trailing spaces.
     * @param xml XML string or buffer
     * @returns normalized XML string without comments or line-breaks.
     */
    export function normalize(xml: string | Buffer) {
        return stringify(parse(xml, {  trimValues: true }));
    }
}
