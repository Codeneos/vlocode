import { XMLParser, XMLBuilder, X2jOptions, XmlBuilderOptions } from 'fast-xml-parser';
import { DOMParser } from '@xmldom/xmldom';
import { visitObject } from './object';

export interface XMLParseOptions {
    /**
     * When true the parser will trim white spaces values of text nodes. When not set defaults to true.
     * When false all whitespace characters from the text node are preserved.
     *
     * @remark `\r\n` is normalized to `\n`
     * @default true
     */
    trimValues?: boolean;
    /**
     * When true the parser will ignore attributes and only parse the node name and value.
     * @default false
     */
    ignoreAttributes?: boolean;
    /**
     * When true the parser will ignore namespace prefixes in tags and attributes. 
     * The returned object will not contain any namespace prefixes.
     * @default false
     */
    ignoreNamespacePrefix?: boolean;
    /**
     * When true always return arrays for nodes even if there is only one child node.
     * If false return the node as an object when there is only one child node.
     * Or use a function to determine if the node should be an array or not.
     */
    arrayMode?: boolean | ((nodePath: string) => any);
    /**
     * Process the value of a node before returning it to the node.
     * Useful for converting values to a specific type.
     * If you return undefined the node is ignored.
     * @param value Value of the node
     * @param nodePath full path of the node seperated by dots, i.e. `rootTag.innerTag`. 
     *                 For attributes the path is prefixed with `@`, i.e. `rootTag.innerTag.@attr`
     */
    valueProcessor?: (value: string, nodePath: string) => any;
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

    const options: Partial<X2jOptions & XmlBuilderOptions> = {
        attributeNamePrefix : '',
        attributesGroupName: '$',
        textNodeName : '#text',
        cdataPropName: '__cdata', // default is 'false'
        ignoreAttributes : false,
        allowBooleanAttributes : true,
        parseNodeValue : true,
        parseAttributeValue : true,
        removeNSPrefix : false,
        trimValues: true, 
        arrayMode: false, // "strict"
        ignoreDeclaration: false,
        ignorePiTags: true,
        processEntities: true,
        numberParseOptions: {
            leadingZeros: false,
            hex: false,
            skipLike: /^\+.*/,
        }
    } as const;

    /**
     * Global parser options for XML to JSON; changing the defaults affects all parsing in all packages. Change with care.
     */
    export const globalParserOptions: Partial<X2jOptions> = {
        ...options
    } as const;

    /**
     * Global stringify options for converting JSON to XML; changing the defaults affects JSON to XML formatting in all packages. Change with care.
     */
    export const globalStringifyOptions: Partial<XmlBuilderOptions> = {
        ...options,
        supressEmptyNode: false
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

        const parserOptions : Partial<X2jOptions> = { 
            ...globalParserOptions, 
            ignoreAttributes: options.ignoreAttributes ?? globalParserOptions.ignoreAttributes,
            trimValues: options.trimValues ?? globalParserOptions.trimValues,
            removeNSPrefix: options.ignoreNamespacePrefix ?? globalParserOptions.removeNSPrefix
        };

        if (options.valueProcessor) {
            parserOptions.attributeValueProcessor = (attr, value, path) => {
                return options.valueProcessor!(value, `${path}@${attr}`);
            };
            parserOptions.tagValueProcessor = (tag, value, path) => {
                return options.valueProcessor!(value, path);
            };
        }

        if (options.arrayMode) {
            parserOptions.isArray = (name, path, leaf, isAttribute) => {
                if (isAttribute) {
                    return false;
                }
                if (typeof options.arrayMode === 'function') {
                    return options.arrayMode(path);
                }
                return options.arrayMode === true;
            };
        }

        return visitObject(new XMLParser(parserOptions).parse(xml), (prop, value, target) => {
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
        const indentOptions: Partial<XmlBuilderOptions> = {
            format: indent !== undefined,
            supressEmptyNode: options.stripEmptyNodes,
            indentBy: indent !== undefined ? typeof indent === 'string' ? indent : ' '.repeat(indent) : undefined,
        };
        const xmlString = new XMLBuilder({ ...globalStringifyOptions, ...indentOptions }).build(jsonObj);
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
