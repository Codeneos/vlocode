import { XML } from "../xml";

describe('xml', () => {
    describe('#parse', () => {
        it('should replace tag-value with attribute nil:true by null', () => {
            const xmlStr = `<test><tag nil='true'></tag></test>`;
            expect(XML.parse(xmlStr).test.tag).toBe(null);
        });
        it('should parse boolean like values as boolean types', () => {
            expect(XML.parse(`<test><tag>true</tag></test>`).test.tag).toBe(true);
            expect(XML.parse(`<test><tag>false</tag></test>`).test.tag).toBe(false);
        });
        it('should parse number like values as number types', () => {
            expect(XML.parse(`<test><tag>1</tag></test>`).test.tag).toBe(1);
            expect(XML.parse(`<test><tag>2</tag></test>`).test.tag).toBe(2);
        });
        it('should parse number like values as number types', () => {
            expect(XML.parse(`<test><tag>1.1</tag></test>`).test.tag).toBe(1.1);
            expect(XML.parse(`<test><tag>2.1</tag></test>`).test.tag).toBe(2.1);
        });
        it('should strip namespace prefixes when ignoreNameSpace is true', () => {
            expect(XML.parse(`<test xmlns:ns='test'><ns:tag>test</ns:tag></test>`, { ignoreNameSpace: true }).test.tag).toBe('test');
        });
        it('should not strip namespace prefixes when ignoreNameSpace is not set', () => {
            expect(XML.parse(`<test xmlns:ns='test'><ns:tag>test</ns:tag></test>`).test['ns:tag']).toBe('test');
        });
    });
    describe('#getRootTagName', () => {
        it('should return root tag for XML snippet (no declaration)', () => {
            expect(XML.getRootTagName(`<test><tag>test</tag></test>`)).toBe('test');
        });
        it('should ignore XML declaration', () => {
            expect(XML.getRootTagName(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <test><tag>test</tag></test>`)).toBe('test');
        });
        it('should ignore comments when on new line', () => {
            expect(XML.getRootTagName(
                `<!-- test -->
                 <test><tag>test</tag></test>`)).toBe('test');
        });
        it('should ignore comments when same line as root tag', () => {
            expect(XML.getRootTagName(`<!-- test --><test><tag>test</tag></test>`)).toBe('test');
        });
        it('should ignore comments with XML declaration', () => {
            expect(XML.getRootTagName(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <!-- test -->
                 <test><tag>test</tag></test>`)).toBe('test');
        });
    });
});