import * as React from 'react';

// Define a generic type for an OmniScript element's properties
interface OmniScriptElementProperties {
    [key: string]: any;
}

interface MainViewProps {
    selectedElement: {
        id: string;
        content: string;
        type: string;
        properties?: OmniScriptElementProperties;
    } | null;
}

export const MainView: React.FC<MainViewProps> = ({ selectedElement }) => {
    if (!selectedElement) {
        return (
            <div style={{ padding: '20px', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Select an element from the sidebar to see its properties.</p>
            </div>
        );
    }

interface MainViewProps {
    selectedElement: {
        id: string;
        content: string;
        type: string;
        properties?: OmniScriptElementProperties;
    } | null;
    onPropertyChange: (elementId: string, propertyKey: string, newValue: any) => void;
}

import * as React from 'react';
import { ConfigurablePropertyRenderer } from './ConfigurablePropertyRenderer';
import { PropertyRenderConfig } from './types/propertyRenderConfig';

// Define a generic type for an OmniScript element's properties
interface OmniScriptElementProperties {
    [key: string]: any;
}

interface MainViewProps {
    selectedElement: {
        id: string;
        content: string;
        type: string;
        properties?: OmniScriptElementProperties;
    } | null;
    onPropertyChange: (elementId: string, propertyKey: string, newValue: any) => void;
}

export const MainView: React.FC<MainViewProps> = ({ selectedElement, onPropertyChange }) => {
    if (!selectedElement) {
        return (
            <div className="main-view-placeholder">
                <p>Select an element from the sidebar to see its properties.</p>
            </div>
        );
    }

    const propertiesToRender = selectedElement.properties || {};

    const handlePropertyUpdate = (propertyName: string, newValue: any) => {
        if (selectedElement) {
            onPropertyChange(selectedElement.id, propertyName, newValue);
        }
    };

    // Group properties by section
    const groupedProperties: { [section: string]: Array<{ name: string; value: any; config: PropertyRenderConfig }> } = {};

    Object.entries(propertiesToRender).forEach(([propertyName, propertyValue]) => {
        // Mock configuration generation - this will be replaced by a proper config system
        let uiType: PropertyRenderConfig['uiType'] = 'text';
        let section = 'General';
        let gridWidth = 12;
        let helpText = '';
        let options: PropertyRenderConfig['options'] = undefined;

        // More sophisticated mock config generation
        const lowerPropName = propertyName.toLowerCase();

        if (lowerPropName.includes('name') || lowerPropName.includes('label')) {
            uiType = 'text';
            section = 'Basic Information';
            gridWidth = 6;
            helpText = `The ${propertyName} of the element.`;
        } else if (typeof propertyValue === 'boolean') {
            uiType = 'checkbox';
            section = 'Options';
            gridWidth = 3;
        } else if (typeof propertyValue === 'number') {
            uiType = 'number';
            section = 'Numeric Settings';
            gridWidth = 4;
        } else if (lowerPropName.includes('condition') || lowerPropName.includes('formula')) {
            uiType = 'textarea';
            section = 'Logic';
            gridWidth = 12;
            helpText = 'Enter a SOQL query, a formula expression, or other conditional logic that determines element behavior.';
        } else if (lowerPropName.includes('options') && Array.isArray(propertyValue)) { 
            uiType = 'list';
            section = 'List Configuration';
            gridWidth = 12;
            helpText = 'Configure list items. Each item typically has a "label" for display and a "value" for submission.';
            config.listItemConfig = { // This was 'config.listItemConfig', should be assigned to the 'config' object being built
                label: { label: 'Display Label', uiType: 'text', gridWidth: 6, helpText: 'Text shown to the user.' },
                value: { label: 'Actual Value', uiType: 'text', gridWidth: 6, helpText: 'Value stored when selected.' }
            };
            config.defaultListItemValue = { label: 'New Option', value: 'new_option_value' };
        } else if (lowerPropName.includes('accountid') || lowerPropName.includes('parentid') || lowerPropName.includes('contactid')) {
            uiType = 'lookup';
            section = 'Relationships';
            gridWidth = 8;
            helpText = `Search and select a ${propertyName.replace('Id', '').toLowerCase()} record. Type to see suggestions.`;
        } else if (lowerPropName.includes('type') && !lowerPropName.includes('elementtype')) { 
            uiType = 'select';
            section = 'Configuration';
            helpText = 'Choose a type from the predefined options.';
            gridWidth = 6;
            options = [
                { label: 'Type A', value: 'A' },
                { label: 'Type B', value: 'B' },
                { label: 'Type C', value: 'C' },
            ];
            if (options.find(opt => opt.value === propertyValue) === undefined) {
            }
        } else if (lowerPropName.includes('status') && typeof propertyValue === 'string') { 
            uiType = 'radio';
            section = 'Configuration';
            helpText = 'Select the current status of this item.';
            gridWidth = 6;
            options = [
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Pending', value: 'Pending' },
            ];
        } else if (typeof propertyValue === 'object' && propertyValue !== null) {
            if (lowerPropName.includes('advancedconfig') || lowerPropName.includes('propertySetConfig')) { 
                 uiType = 'code';
                 section = 'Advanced JSON';
                 gridWidth = 12;
                 helpText = 'Edit the raw JSON configuration. Ensure valid JSON format.';
            } else {
                section = 'Advanced Data'; 
                 helpText = 'This property contains complex data, shown as read-only JSON.';
            }
        } else if (lowerPropName.includes('description') || lowerPropName.includes('notes')) {
            uiType = 'textarea';
            section = 'Details';
            gridWidth = 12;
            helpText = 'Enter any additional details or notes for this element.';
        }

        // Default help text if none is assigned by specific rules and uiType is not checkbox
        if (!helpText && uiType !== 'checkbox') { 
             helpText = `Set the value for the '${propertyName.replace(/([A-Z](?=[a-z]))/g, ' $1').toLowerCase()}' property.`;
        }


        const tempConfig: PropertyRenderConfig = { // Renamed to tempConfig to avoid conflict with the outer config variable
            label: propertyName.replace(/([A-Z](?=[a-z]))/g, ' $1').replace(/^./, str => str.toUpperCase()), 
            uiType,
            section,
            gridWidth,
            options,
            helpText: helpText 
        };
        
        // This section was problematic in the previous attempt.
        // 'config' was used before assignment when trying to assign to config.listItemConfig.
        // The 'tempConfig' is now correctly built first.
        if (uiType === 'list' && lowerPropName.includes('options') && Array.isArray(propertyValue)) {
            tempConfig.listItemConfig = {
                label: { label: 'Display Label', uiType: 'text', gridWidth: 6, helpText: 'Text shown to the user.' },
                value: { label: 'Actual Value', uiType: 'text', gridWidth: 6, helpText: 'Value stored when selected.' }
            };
            tempConfig.defaultListItemValue = { label: 'New Option', value: 'new_option_value' };
        }
        
        const currentSection = tempConfig.section || 'General';
        if (!groupedProperties[currentSection]) {
            groupedProperties[currentSection] = [];
        }
        groupedProperties[currentSection].push({ name: propertyName, value: propertyValue, config });
    });


    return (
        <div className="main-view">
            <h3 className="main-view-title">{selectedElement.content} ({selectedElement.type}) Properties</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                {Object.entries(groupedProperties).map(([sectionName, propsInSection]) => (
                    <div key={sectionName} className="property-section">
                        <h4 className="property-section-header">{sectionName}</h4>
                        <div className="property-grid-container">
                            {propsInSection.map(({ name, value, config }) => {
                                // Still rendering objects/arrays directly as read-only textareas
                                if (typeof value === 'object' && value !== null) {
                                    return (
                                        <div key={name} className="property-grid-item" style={{flexBasis: `calc(100% - 10px)`}}>
                                            <div className={`property-group type-object`}>
                                                <label htmlFor={`${name}-readonly`} className="property-label">{config.label} (Object/Array):</label>
                                                <textarea
                                                    id={`${name}-readonly`}
                                                    value={JSON.stringify(value, null, 2)}
                                                    readOnly
                                                    className="property-textarea"
                                                    rows={4}
                                                />
                                                 {config.helpText && <p className="property-help-text">{config.helpText}</p>}
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <ConfigurablePropertyRenderer
                                        key={name}
                                        propertyName={name}
                                        propertyValue={value}
                                        config={config}
                                        onPropertyChange={handlePropertyUpdate}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </form>
        </div>
    );
};
