import { OmniScriptItem } from './NavigationSidebar';

// This is a simplified interface for the raw OmniScript element structure
// based on the provided SampleOmniScript.json
export interface RawOmniScriptElement {
    Name: string;
    ElementType: string;
    Level: number;
    Order: number;
    PropertySetConfig: { [key: string]: any };
    children?: RawOmniScriptElement[];
    // Other properties like Active, etc., can be added if needed
}

export interface TransformedOmniScript {
    items: OmniScriptItem[];
    rawJson: any; // Keep the original parsed JSON to allow updating it
}

// Helper function to recursively transform raw elements
const transformElement = (element: RawOmniScriptElement, parentId?: string): OmniScriptItem => {
    const id = `${parentId ? parentId + '-' : ''}${element.Name || 'unnamed'}-${element.Order}`;
    return {
        id: id,
        content: element.PropertySetConfig?.label || element.Name || `Unnamed ${element.ElementType}`,
        type: element.ElementType,
        parentId: parentId,
        // For simplicity, we'll pass the whole PropertySetConfig as 'properties'
        // In a real scenario, you might want to map or filter these.
        properties: { ...element.PropertySetConfig, Name: element.Name }, // Also include Name for editing
        // Store original Level and Order for potential restructuring logic later
        originalLevel: element.Level,
        originalOrder: element.Order,
    };
};

export const transformOmniScriptJson = (jsonString: string): TransformedOmniScript | null => {
    try {
        const rawScript = JSON.parse(jsonString);
        const items: OmniScriptItem[] = [];

        const processElements = (elements: RawOmniScriptElement[], parentId?: string) => {
            // Sort elements by Order before processing
            const sortedElements = [...elements].sort((a, b) => a.Order - b.Order);

            for (const element of sortedElements) {
                const transformed = transformElement(element, parentId);
                items.push(transformed);
                if (element.children && element.children.length > 0) {
                    processElements(element.children, transformed.id);
                }
            }
        };

        if (rawScript && rawScript.elements) {
            processElements(rawScript.elements);
        } else {
            console.error('OmniScript JSON does not contain an "elements" array.');
            return null;
        }

        return { items, rawJson: rawScript };
    } catch (error) {
        console.error('Error parsing or transforming OmniScript JSON:', error);
        return null;
    }
};

// Utility to find an element in the raw JSON structure by its Name (unique within parent)
// This is a simplified search; a more robust solution might use IDs or paths if available
export const findRawElementByName = (elements: RawOmniScriptElement[], name: string): RawOmniScriptElement | null => {
    for (const element of elements) {
        if (element.Name === name) {
            return element;
        }
        if (element.children) {
            const foundInChildren = findRawElementByName(element.children, name);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }
    return null;
};

// Utility to update a property in the raw JSON structure
// This will be more complex for nested properties or if IDs are not consistently paths
export const updateRawElementProperty = (
    rawJson: any,
    elementId: string, // The ID from OmniScriptItem (e.g., Step1-Name-1)
    propertyKey: string,
    value: any
): boolean => {
    if (!rawJson || !rawJson.elements) return false;

    // This is a simplification. The 'elementId' from OmniScriptItem is not directly usable
    // to find elements in the raw JSON without a more complex mapping or search.
    // For now, we'll assume 'Name' is the primary identifier for properties in PropertySetConfig
    // and we'll need to locate the element by its 'Name' which is part of the 'elementId'.
    // A proper solution would involve a more robust way to map UI items back to raw data items.

    const nameParts = elementId.split('-');
    const elementName = nameParts.length > 1 ? nameParts[nameParts.length-2] : nameParts[0]; // Heuristic to get Name

    const findAndUpdate = (elements: RawOmniScriptElement[]): boolean => {
        for (const element of elements) {
            // Assuming the 'Name' property in PropertySetConfig or the element's Name field is what we match
            if (element.Name === elementName || (element.PropertySetConfig && element.PropertySetConfig.Name === elementName)) {
                 if (propertyKey === 'Name') { // If we are editing the element's actual Name
                    element.Name = value;
                    return true;
                }
                if (element.PropertySetConfig) {
                    element.PropertySetConfig[propertyKey] = value;
                    return true;
                }
            }
            if (element.children) {
                if (findAndUpdate(element.children)) return true;
            }
        }
        return false;
    };

    return findAndUpdate(rawJson.elements);
};


// Utility to update the order of elements in the raw JSON structure
export const updateRawElementOrder = (
    rawJson: any,
    movedItemId: string,
    newParentId: string | undefined, // For now, assume reordering within the same parent
    newIndex: number,
    allItems: OmniScriptItem[] // The full list of transformed items from the sidebar
): boolean => {
    if (!rawJson || !rawJson.elements) return false;

    // Find the moved element's original data
    const movedItemInfo = allItems.find(item => item.id === movedItemId);
    if (!movedItemInfo) return false;

    const getElementsByParentId = (elements: RawOmniScriptElement[], targetParentId?: string): RawOmniScriptElement[] | null => {
        if (!targetParentId) return elements; // Root elements

        for (const el of elements) {
            const currentElIdPrefix = `${el.Name}-${el.Order}`; // Approximate ID prefix for steps
            // This logic is very basic. A robust solution needs proper ID mapping.
            // Here, we assume parentId is like "StepName-Order" for steps.
            if (targetParentId.startsWith(currentElIdPrefix) && el.children) {
                 // If parentId matches a step-like ID and it has children, return those
                if(el.ElementType === "Step" && targetParentId === `${el.Name}-${el.Order}`) {
                    return el.children;
                }
                // If we are deeper, recurse
                const childrenOfParent = getElementsByParentId(el.children, targetParentId);
                if (childrenOfParent) return childrenOfParent;
            }
        }
        return null;
    };

    const targetList = getElementsByParentId(rawJson.elements, movedItemInfo.parentId);
    if (!targetList) {
        console.error("Could not find the target list in raw JSON for reordering", movedItemInfo.parentId);
        return false;
    }
    
    const originalName = movedItemInfo.properties?.Name || movedItemInfo.content; // Get the 'Name' of the element

    // Find the raw element to move
    const elementToMoveIndex = targetList.findIndex(el => el.Name === originalName);
    if (elementToMoveIndex === -1) {
        console.error("Could not find the element to move in raw JSON:", originalName);
        return false;
    }
    const [elementToMove] = targetList.splice(elementToMoveIndex, 1);

    // Insert it at the new position
    targetList.splice(newIndex, 0, elementToMove);

    // Update the 'Order' property for all elements in this list
    targetList.forEach((el, idx) => {
        el.Order = idx + 1;
    });

    return true;
};
