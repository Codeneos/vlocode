import * as xmlParser from 'fast-xml-parser';
import { DOMParser } from '@xmldom/xmldom';
import { decode, escape } from 'he';
import { visitObject } from './object';

export interface XMLParseOptions {
    trimValues?: boolean;
    ignoreAttributes?: boolean;
    ignoreNameSpace?: boolean;
    /**
     * Always put child nodes in an array if true; otherwise an array is created only if there is more than one.
     */
    arrayMode?: boolean | 'strict' | ((nodePath: string) => any);
    /**
     * Process the value of a node before returning it to the node.
     * Useful for converting values to a specific type.
     * If you return undefined the node is ignored.
     */
    valueProcessor?: (val: string, nodePath: string) => any;
}

export interface XMLStringfyOptions {
    trimValues?: boolean;
    headless?: boolean;
    stripEmptyNodes?: boolean;
}

export interface TextPosition {
    column: number;
    line: number;
}

export interface TextRange {
    start: TextPosition;
    end: TextPosition;
}

export namespace XML {

    const options: Partial<xmlParser.X2jOptions> = {
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
    } as const;
    
    /**
     * Global parser options for XML to JSON; changing the defaults affects all parsing in all packages. Change with care.
     */
    export const globalParserOptions: Partial<xmlParser.X2jOptions> = {
        ...options,
        tagValueProcessor : val => decode(val),
        attrValueProcessor: val => decode(val, { isAttributeValue: true })
    } as const;

    /**
     * Global stringify options for converting JSON to XML; changing the defaults affects JSON to XML formatting in all packages. Change with care.
     */
    export const globalStringifyOptions: Partial<xmlParser.J2xOptions> = {
        ...options,
        supressEmptyNode: false,
        tagValueProcessor: val => escape(String(val)),
        attrValueProcessor: val => escape(String(val))
    } as const;

    /**
     * Parse XML into a JSON object with the default options.
     * @param xml XML String
     * @returns 
     */
    export function parse<T extends object = Record<string, any>>(xml: string | Buffer, options: XMLParseOptions = {}) : T {
        if (typeof xml !== 'string') {
            xml = xml.toString();
        }
        const parserOptions = { ...globalParserOptions, ...options };
        if (options.valueProcessor) {
            parserOptions.tagValueProcessor = (val, nodePath) => {
                return options.valueProcessor!(
                    decode(val, { isAttributeValue: true }), 
                    nodePath
                );
            };
            parserOptions.tagValueProcessor = (val, nodePath) => {
                return options.valueProcessor!(decode(val), nodePath);
            };
        }
        return visitObject(xmlParser.parse(xml, parserOptions, true), (prop, value, target) => {
            if (typeof value === 'object') {
                // Parse nil as null as per XML spec
                if (value['$']?.['nil'] === true) {
                    target[prop] = null;
                }
            }
        });
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
        const xmlString = new xmlParser.j2xParser({...globalStringifyOptions, ...indentOptions}).parse(jsonObj);
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
        return stringify(parse(xml, { trimValues: true }));
    }

    /**
     * Find the first node in a XML string matching the specified path. The path is a dot separated list of tags and can include a index number to select a specific node.
     * @example 
     * Returns the first inner node of rootTag:
     * ```js
     * const xml = `<rootTag> <inner /> <inner /> </rootTag>`;
     * const tag = getNode(xml, 'rootTag.inner|1');
     * ```
     * @param xml XML string or buffer
     * @param path Dot separated path to the node
     * @returns Node or undefined if not found
     */
    export function getNode(xml: string, path: string): Node | undefined {
        if (Buffer.isBuffer(xml)) {
            xml = xml.toString('utf-8');
        }
        return path.split(/\.|:/).reduce((node, tagWithIndex) => {
            const [tag, index] = tagWithIndex.split('|');
            let childNodeIndex = 0;
            return node && Array.from(node.childNodes).find(child => 
               (tag === '*' || child.nodeName === tag) && (!index || ++childNodeIndex === Number(index))
            );
        }, new DOMParser().parseFromString(xml, 'text/xml') as Node);
    }

    export function getNodeTextRange(xml: string, path: string): TextRange | undefined {
        const node = getNode(xml, path);
        if (node) {
            const lines = String(node).split('\n');
            const start = {
                column: node['columnNumber'],
                line: node['lineNumber'],
            };
            const end = {
                column: (lines.length === 1 ? start.column : 1) + lines[lines.length - 1].length,
                line: start.line + lines.length - 1,
            };
            return { start, end };
        }
    }
}
