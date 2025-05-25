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

export const MainView: React.FC<MainViewProps> = ({ selectedElement, onPropertyChange }) => {
    if (!selectedElement) {
        return (
            <div className="main-view-placeholder">
                <p>Select an element from the sidebar to see its properties.</p>
            </div>
        );
    }

    const [currentProperties, setCurrentProperties] = React.useState(selectedElement.properties || {});

    React.useEffect(() => {
        setCurrentProperties(selectedElement.properties || {});
    }, [selectedElement]);

    const handleInputChange = (key: string, value: any) => {
        setCurrentProperties(prev => ({ ...prev, [key]: value }));
        onPropertyChange(selectedElement.id, key, value);
    };

    const renderPropertyField = (key: string, value: any) => {
        const inputId = `${selectedElement.id}-${key}`;

        if (typeof value === 'string') {
            return (
                <div key={key} className="property-group">
                    <label htmlFor={inputId} className="property-label">{key}:</label>
                    <input
                        type="text"
                        id={inputId}
                        value={value}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="property-input"
                    />
                </div>
            );
        } else if (typeof value === 'boolean') {
            return (
                <div key={key} className="property-checkbox-group">
                    <input
                        type="checkbox"
                        id={inputId}
                        checked={value}
                        onChange={(e) => handleInputChange(key, e.target.checked)}
                        className="property-checkbox"
                    />
                    <label htmlFor={inputId} className="property-checkbox-label">{key}</label>
                </div>
            );
        } else if (typeof value === 'number') {
            return (
                <div key={key} className="property-group">
                    <label htmlFor={inputId} className="property-label">{key}:</label>
                    <input
                        type="number"
                        id={inputId}
                        value={value}
                        onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                        className="property-input"
                    />
                </div>
            );
        }
        // For other types (like object, array, or null/undefined), display as read-only JSON string
        return (
            <div key={key} className="property-group">
                <label htmlFor={inputId} className="property-label">{key} (read-only):</label>
                <textarea
                    id={inputId}
                    value={JSON.stringify(value, null, 2)}
                    readOnly
                    className="property-textarea"
                />
            </div>
        );
    };

    return (
        <div className="main-view">
            <h3>{selectedElement.content} Properties</h3>
            <form onSubmit={(e) => e.preventDefault()}>
                {Object.entries(currentProperties).map(([key, value]) => renderPropertyField(key, value))}
            </form>
        </div>
    );
};
