import { XML } from '../xml';

describe('xml', () => {
    describe('#stringify', () => {
        it('should write attributes when set', () => {
            const xmlStr = '<tag attr="test"><value>foo</value></tag>';
            expect(XML.stringify({
                tag: {
                    $: { attr: 'test' },
                    value: 'foo'
                }
            }, undefined, { headless: true })).toBe(xmlStr);
        });
        it('should include namespace prefixes for attributes and tags', () => {
            const xmlStr = '<tag xsi:attr="test"><ns:value>foo</ns:value></tag>';
            expect(XML.stringify({
                tag: {
                    $: { 'xsi:attr': 'test' },
                    ['ns:value']: 'foo'
                }
            }, undefined, { headless: true })).toBe(xmlStr);
        });
        it('should write tag body with attributes', () => {
            const xmlStr = '<tag attr="test">foo</tag>';
            expect(XML.stringify({
                tag: {
                    $: { attr: 'test' },
                    '#text': 'foo'
                }
            }, undefined, { headless: true })).toBe(xmlStr);
        });
        it('should encode XML special characters', () => {
            const xmlStr = '<tag attr="&amp;&gt;">I&amp;D &apos;100&apos; &gt; &apos;200&apos;</tag>';
            expect(XML.stringify({
                tag: {
                    $: { attr: '&>' },
                    '#text': `I&D '100' > '200'`
                }
            }, { headless: true })).toBe(xmlStr);
        });
    });
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
            expect(XML.parse(`<test xmlns:ns='test'><ns:tag>test</ns:tag></test>`, { ignoreNamespacePrefix: true }).test.tag).toBe('test');
        });
        it('should not strip namespace prefixes when ignoreNameSpace is not set', () => {
            expect(XML.parse(`<test xmlns:ns='test'><ns:tag>test</ns:tag></test>`).test['ns:tag']).toBe('test');
        });
        it('should not parse strings with leading zero\'s or + as number', () => {
            expect(XML.parse(`<test><tag>000001</tag></test>`).test.tag).toBe('000001');
            expect(XML.parse(`<test><tag>+1</tag></test>`).test.tag).toBe('+1');
        });
        it('should run node values through parser', () => {
            const valueProcessor = (val: string, path: string) => path === 'test.tag' ? val + '@' : val;
            const parsed = XML.parse(`<test><tag>2&amp;</tag></test>`, { valueProcessor });
            expect(parsed).toEqual({ test: { tag: '2&@' } });
        });
        it('should run attribute values through parser', () => {
            const valueProcessor = (val: string, path: string) => path === 'test.tag@attr' ? val + '@' : val;
            const parsed = XML.parse(`<test><tag attr="1"></tag></test>`, { valueProcessor });
            expect(parsed).toEqual({ test: { tag: { $: { attr: '1@' } } }});
        });
        it('should parse everything as array when array mode true', () => {
            const parsed = XML.parse(`<test><tag>test</tag></test>`, { arrayMode: true });
            expect(parsed).toEqual({ test: [{ tag: [ 'test' ] }] });
        });
        it('should parse HTML encoded entities in values', () => {
            const parsed = XML.parse(`<test><tag>I&amp;D &#39;100&#39; &gt; &#39;200&#39;</tag></test>`);
            expect(parsed).toEqual({ test: { tag: `I&D '100' > '200'` } });
        });
        it('should parse HTML encoded entities in attributes', () => {
            const parsed = XML.parse(`<test><tag value="I&amp;D &apos;100&#39; &gt; &#39;200&apos;" /></test>`);
            expect(parsed).toEqual({ test: { tag: { $: { value: `I&D '100' > '200'` } } } });
        });
        it('should not trim values trimValues = false', () => {
            const parsed = XML.parse(`<test><tag>    \ntest\n   </tag></test>`, { trimValues: false });
            expect(parsed).toEqual({ test: { tag: `    \ntest\n   ` } });
        });
        it('should trim values', () => {
            const parsed = XML.parse(`<test><tag>    \ntest\n   </tag></test>`,);
            expect(parsed).toEqual({ test: { tag: `test` } });
        });
    });
    describe('#getRootTagName', () => {
        it('should ignore XML declaration', () => {
            expect(XML.getRootTagName(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <test><tag>test</tag></test>`)).toBe('test');
        });
        it('should ignore comments when on new line', () => {
            expect(XML.getRootTagName(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <!-- test -->
                 <test><tag>test</tag></test>`)).toBe('test');
        });
        it('should ignore comments with XML declaration', () => {
            expect(XML.getRootTagName(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <!-- test -->
                 <test><tag>test</tag></test>`)).toBe('test');
        });
    });
    describe('#getNode', () => {
        it('should get node based on property path', () => {
            expect(String(XML.getNode(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <test><tag><bar>bar</bar></tag><bar>foo</bar></test>`, 
                 'test.tag.bar'))).toEqual('<bar>bar</bar>');
        });
        it('should get node based based on indexer property in path', () => {
            expect(String(XML.getNode(
                `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
                 <test><tag><bar>bar1</bar><bar>bar2</bar></tag><bar>foo</bar></test>`, 
                 'test.tag.bar|2'))).toEqual('<bar>bar2</bar>');
        });
    });
    describe('#normalize', () => {
        it('should retain boolean attributes', () => {
            const xml = `<value xsi:nil="true"/>`
            const expected = `<value xsi:nil="true"></value>`;
            const actual = XML.normalize(xml, { headless: true });
            expect(actual).toEqual(expected);
        });
    });
    describe('#getNodeTextRange', () => {
        it('should get node text range on multiple lines', () => {
            const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
            <test>
            <tag>
            <bar>
                bar
            </bar>
            </tag>
            <bar>foo</bar>
            </test>`
            expect(XML.getNodeTextRange(xml, 'test.tag.bar')).toEqual( {
                start: { line: 4, column: 13 },
                end: { line: 6, column: 19 }
            });
        });
        it('should get node text range when on same line', () => {
            const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
            <test><tag><bar>bar</bar></tag><bar>bar</bar></test>`
            expect(XML.getNodeTextRange(xml, 'test.tag.bar')).toEqual( {
                start: { line: 2, column: 24 },
                end: { line: 2, column: 38 }
            });
        });
        it('should get node text range of root node', () => {
            const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
            <test><tag><bar>bar</bar></tag><bar>bar</bar></test>`
            expect(XML.getNodeTextRange(xml, 'test')).toEqual({
                start: { line: 2, column: 13 },
                end: { line: 2, column: 65 }
            });
        });
    });
});