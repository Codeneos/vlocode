import { transformOmniScriptJson, updateRawElementProperty, updateRawElementOrder, RawOmniScriptElement } from './omniScriptUtils';
import { OmniScriptItem } from './NavigationSidebar'; // Assuming OmniScriptItem is exported

// Sample OmniScript JSON for testing
const sampleOsJsonString = `{
    "Name": "TestScript",
    "Type": "OmniScript",
    "SubType": "Test",
    "elements": [
        {
            "Name": "Step1",
            "ElementType": "Step",
            "Level": 0,
            "Order": 1,
            "PropertySetConfig": { "label": "Step 1 Lbl" },
            "children": [
                {
                    "Name": "Text1",
                    "ElementType": "Text",
                    "Level": 1,
                    "Order": 1,
                    "PropertySetConfig": { "label": "Text 1 Lbl" }
                },
                {
                    "Name": "Checkbox1",
                    "ElementType": "Checkbox",
                    "Level": 1,
                    "Order": 2,
                    "PropertySetConfig": { "label": "Checkbox 1 Lbl", "checked": false }
                }
            ]
        },
        {
            "Name": "Step2",
            "ElementType": "Step",
            "Level": 0,
            "Order": 2,
            "PropertySetConfig": { "label": "Step 2 Lbl" },
            "children": [
                {
                    "Name": "Number1",
                    "ElementType": "Number",
                    "Level": 1,
                    "Order": 1,
                    "PropertySetConfig": { "label": "Number 1 Lbl", "value": 100 }
                }
            ]
        }
    ]
}`;

const sampleOsJsonDeepNesting = `{
    "Name": "DeepNestScript",
    "elements": [
        {
            "Name": "OuterStep", "ElementType": "Step", "Level": 0, "Order": 1, "PropertySetConfig": { "label": "Outer" },
            "children": [
                {
                    "Name": "MiddleStep", "ElementType": "Step", "Level": 1, "Order": 1, "PropertySetConfig": { "label": "Middle" },
                    "children": [
                        {
                            "Name": "InnerElement", "ElementType": "Text", "Level": 2, "Order": 1, "PropertySetConfig": { "label": "Inner" }
                        }
                    ]
                }
            ]
        }
    ]
}`;


describe('omniScriptUtils', () => {
    describe('transformOmniScriptJson', () => {
        it('should transform valid OmniScript JSON to a flat list of OmniScriptItems', () => {
            const result = transformOmniScriptJson(sampleOsJsonString);
            expect(result).not.toBeNull();
            expect(result?.items).toBeInstanceOf(Array);
            expect(result?.items.length).toBe(5); // 2 Steps + 3 child elements

            // Check item properties (spot check)
            const step1 = result?.items.find(item => item.content === 'Step 1 Lbl');
            expect(step1).toBeDefined();
            expect(step1?.type).toBe('Step');
            expect(step1?.properties?.Name).toBe('Step1');

            const text1 = result?.items.find(item => item.content === 'Text 1 Lbl');
            expect(text1).toBeDefined();
            expect(text1?.type).toBe('Text');
            expect(text1?.parentId).toBe(step1?.id);
            expect(text1?.properties?.Name).toBe('Text1');
        });

        it('should store the raw JSON', () => {
            const result = transformOmniScriptJson(sampleOsJsonString);
            expect(result?.rawJson).toBeDefined();
            expect(result?.rawJson.Name).toBe("TestScript");
        });

        it('should handle empty elements array', () => {
            const emptyElementsJson = `{ "Name": "EmptyScript", "elements": [] }`;
            const result = transformOmniScriptJson(emptyElementsJson);
            expect(result?.items.length).toBe(0);
            expect(result?.rawJson.Name).toBe("EmptyScript");
        });

        it('should return null for invalid JSON', () => {
            const invalidJson = `{ "Name": "InvalidScript", "elements": [`;
            const result = transformOmniScriptJson(invalidJson);
            expect(result).toBeNull();
        });
        
        it('should correctly create hierarchical IDs', () => {
            const result = transformOmniScriptJson(sampleOsJsonString);
            const step1 = result?.items.find(item => item.properties?.Name === 'Step1');
            const text1 = result?.items.find(item => item.properties?.Name === 'Text1');
            expect(step1?.id).toBe('Step1-1'); // Name-Order
            expect(text1?.id).toBe('Step1-1-Text1-1'); // ParentId-Name-Order
        });
    });

    describe('updateRawElementProperty', () => {
        let rawJson: any;
        let transformedItems: OmniScriptItem[];

        beforeEach(() => {
            const transformed = transformOmniScriptJson(sampleOsJsonString);
            rawJson = transformed!.rawJson;
            transformedItems = transformed!.items;
        });

        it('should update a string property (label) of a top-level element', () => {
            const step1Item = transformedItems.find(item => item.properties?.Name === 'Step1')!;
            const success = updateRawElementProperty(rawJson, step1Item.id, 'label', 'New Step 1 Label');
            expect(success).toBe(true);
            expect(rawJson.elements[0].PropertySetConfig.label).toBe('New Step 1 Label');
        });
        
        it('should update the Name of a top-level element', () => {
            const step1Item = transformedItems.find(item => item.properties?.Name === 'Step1')!;
            const success = updateRawElementProperty(rawJson, step1Item.id, 'Name', 'Step1NewName');
            expect(success).toBe(true);
            expect(rawJson.elements[0].Name).toBe('Step1NewName');
        });

        it('should update a boolean property of a child element', () => {
            const checkbox1Item = transformedItems.find(item => item.properties?.Name === 'Checkbox1')!;
            const success = updateRawElementProperty(rawJson, checkbox1Item.id, 'checked', true);
            expect(success).toBe(true);
            expect(rawJson.elements[0].children[1].PropertySetConfig.checked).toBe(true);
        });

        it('should update a number property of a child element', () => {
            const number1Item = transformedItems.find(item => item.properties?.Name === 'Number1')!;
            const success = updateRawElementProperty(rawJson, number1Item.id, 'value', 200);
            expect(success).toBe(true);
            expect(rawJson.elements[1].children[0].PropertySetConfig.value).toBe(200);
        });
        
        it('should update property in a deeply nested element', () => {
            const transformedDeep = transformOmniScriptJson(sampleOsJsonDeepNesting)!;
            const rawJsonDeep = transformedDeep.rawJson;
            const innerElementItem = transformedDeep.items.find(item => item.properties?.Name === 'InnerElement')!;
            
            const success = updateRawElementProperty(rawJsonDeep, innerElementItem.id, 'label', 'New Inner Label');
            expect(success).toBe(true);
            expect(rawJsonDeep.elements[0].children[0].children[0].PropertySetConfig.label).toBe('New Inner Label');
        });

        it('should return false if element is not found by heuristic ID matching', () => {
            const success = updateRawElementProperty(rawJson, 'NonExistent-1-Element-1', 'label', 'NewLabel');
            expect(success).toBe(false);
        });
    });

    describe('updateRawElementOrder', () => {
        let rawJson: any;
        let initialItems: OmniScriptItem[];

        beforeEach(() => {
            const transformed = transformOmniScriptJson(sampleOsJsonString)!;
            rawJson = transformed.rawJson;
            initialItems = transformed.items;
        });

        it('should reorder elements within the same parent (Step1 children)', () => {
            // Move Checkbox1 (Order 2) before Text1 (Order 1) within Step1
            const checkbox1Item = initialItems.find(item => item.properties?.Name === 'Checkbox1')!; // id: Step1-1-Checkbox1-2
            
            // Simulate dnd reorder: Checkbox1 is now at index 0 in its parent's list
            // Create a representation of how the sidebar items would look after drag
            const step1ChildrenSidebar = initialItems.filter(item => item.parentId === checkbox1Item.parentId);
            const reorderedSidebarChildren = [
                step1ChildrenSidebar.find(i => i.properties?.Name === 'Checkbox1')!,
                step1ChildrenSidebar.find(i => i.properties?.Name === 'Text1')!,
            ];

            const success = updateRawElementOrder(rawJson, checkbox1Item.id, checkbox1Item.parentId, 0, reorderedSidebarChildren);
            expect(success).toBe(true);

            const step1Raw = rawJson.elements.find((el: RawOmniScriptElement) => el.Name === 'Step1');
            expect(step1Raw.children[0].Name).toBe('Checkbox1');
            expect(step1Raw.children[0].Order).toBe(1);
            expect(step1Raw.children[1].Name).toBe('Text1');
            expect(step1Raw.children[1].Order).toBe(2);
        });
        
        it('should reorder top-level Step elements', () => {
            // Move Step2 before Step1
            const step2Item = initialItems.find(item => item.properties?.Name === 'Step2')!; // id: Step2-2
            
            const reorderedTopLevelSidebar = [
                initialItems.find(i => i.properties?.Name === 'Step2')!,
                initialItems.find(i => i.properties?.Name === 'Step1')!,
            ];

            const success = updateRawElementOrder(rawJson, step2Item.id, step2Item.parentId, 0, reorderedTopLevelSidebar);
            expect(success).toBe(true);
            
            expect(rawJson.elements[0].Name).toBe('Step2');
            expect(rawJson.elements[0].Order).toBe(1);
            expect(rawJson.elements[1].Name).toBe('Step1');
            expect(rawJson.elements[1].Order).toBe(2);
        });

        it('should return false if element to move is not found', () => {
            const success = updateRawElementOrder(rawJson, 'NonExistent-1', undefined, 0, initialItems);
            expect(success).toBe(false);
        });
    });
});
