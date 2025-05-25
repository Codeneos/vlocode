import * as React from 'react';
import { PropertyRenderConfig } from './types/propertyRenderConfig';

interface ConfigurablePropertyRendererProps {
    propertyName: string;
    propertyValue: any;
    config: PropertyRenderConfig;
    onPropertyChange: (propertyName: string, newValue: any) => void;
}

export const ConfigurablePropertyRenderer: React.FC<ConfigurablePropertyRendererProps> = ({
    propertyName,
    propertyValue,
    config,
    onPropertyChange,
}) => {
    // currentValue from props is the actual ID (e.g. '001...') or the full object for a lookup
    // inputValue is what's shown in the text field (e.g. 'Account A')
    const [currentValue, setCurrentValue] = React.useState(propertyValue); 
    const [inputValue, setInputValue] = React.useState(''); 
    const [suggestions, setSuggestions] = React.useState<Array<{ Id: string; Name: string }>>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [isHelpVisible, setIsHelpVisible] = React.useState(false); // State for help text accordion
    const blurTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const MOCK_LOOKUP_DATA = [
        { Id: '001x00000000001AAA', Name: 'Acme Corporation' },
        { Id: '001x00000000002BBB', Name: 'Beta Industries' },
        { Id: '001x00000000003CCC', Name: 'Charlie Services' },
        { Id: '001x00000000004DDD', Name: 'Delta Solutions' },
        { Id: '001x00000000005EEE', Name: 'Echo Innovations' },
    ];

    React.useEffect(() => {
        setCurrentValue(propertyValue);
        // Initialize inputValue based on propertyValue.
        // If propertyValue is an ID, we might need to find its Name from MOCK_LOOKUP_DATA or config.
        // For simplicity, if propertyValue is a string ID, find its name. If it's an object, use its Name field.
        if (typeof propertyValue === 'string' && config.uiType === 'lookup') {
            const found = MOCK_LOOKUP_DATA.find(item => item.Id === propertyValue);
            setInputValue(found ? found.Name : propertyValue); // Show ID if name not found
        } else if (typeof propertyValue === 'object' && propertyValue !== null && 'Name' in propertyValue) {
            setInputValue(String(propertyValue.Name));
        } else if (propertyValue !== null && propertyValue !== undefined) {
            setInputValue(String(propertyValue));
        } else {
            setInputValue('');
        }
    }, [propertyValue, config.uiType]);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target;
        let newValueProp: string | boolean | number | object | null; // Value to propagate via onPropertyChange
        let currentInputVal = target.value; // Value for the input field state

        if (target.type === 'checkbox' && target instanceof HTMLInputElement) {
            newValueProp = target.checked;
            currentInputVal = String(target.checked); // Keep inputValue as string for consistency if needed
        } else if (target.type === 'number' && target instanceof HTMLInputElement) {
            newValueProp = target.value === '' ? null : parseFloat(target.value);
            currentInputVal = target.value;
        } else if (target.tagName.toLowerCase() === 'select') {
            const selectTarget = target as HTMLSelectElement;
            try {
                newValueProp = JSON.parse(selectTarget.value);
            } catch (e) {
                newValueProp = selectTarget.value;
            }
            currentInputVal = selectTarget.value;
        } else { // Handles text, textarea, radio, and lookup's text input
            newValueProp = target.value;
            currentInputVal = target.value;
        }
        
        setCurrentValue(newValueProp); // For non-lookup, this is the direct value
        setInputValue(currentInputVal); // For lookup, this updates the text field

        if (config.uiType === 'lookup') {
            if (currentInputVal.length > 0) { // Or some other threshold like 2 chars
                const filteredSuggestions = MOCK_LOOKUP_DATA.filter(item =>
                    item.Name.toLowerCase().includes(currentInputVal.toLowerCase())
                );
                setSuggestions(filteredSuggestions);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
            // For lookup, onPropertyChange is called when a suggestion is selected, not on every keystroke.
            // Or, if you want to support free-text entry that's not from suggestions:
            // onPropertyChange(propertyName, currentInputVal); 
        } else {
            onPropertyChange(propertyName, newValueProp);
        }
    };

    const handleLookupSuggestionClick = (suggestion: { Id: string; Name: string }) => {
        setInputValue(suggestion.Name); // Update text field to selected name
        setCurrentValue(suggestion.Id);  // Set actual value to the ID (or object if preferred)
        onPropertyChange(propertyName, suggestion.Id); // Propagate the ID
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleLookupFocus = () => {
        if (inputValue.length > 0 && suggestions.length > 0) { // Or show all/recent if inputValue is empty
            setShowSuggestions(true);
        }
    };

    const handleLookupBlur = () => {
        // Delay hiding suggestions to allow click event on suggestion item
        blurTimeoutRef.current = setTimeout(() => {
            setShowSuggestions(false);
        }, 150); // Adjust delay as needed
    };
    
    React.useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
            }
        };
    }, []);

    const gridWidth = config.gridWidth || 12;

        if (target.type === 'checkbox' && target instanceof HTMLInputElement) {
            newValue = target.checked;
        } else if (target.type === 'number' && target instanceof HTMLInputElement) {
    // Using inline style for flex-basis for dynamic grid width.
    // Alternatively, define CSS classes like .col-1, .col-2, ..., .col-12
    const style: React.CSSProperties = {
        flexBasis: `calc(${ (gridWidth / 12) * 100 }% - 10px)`, // Adjust 10px for potential gap/margin
        boxSizing: 'border-box',
        marginBottom: '10px', // Spacing between rows of properties
        // marginRight: '10px' // If using gaps, this could be part of it
    };


    let inputElement;
    const inputId = `${propertyName}-${config.uiType}`; // Unique ID for label association

    switch (config.uiType) {
        case 'textarea':
            inputElement = (
                <textarea
                    id={inputId}
                    value={inputValue} // Lookup uses separate inputValue for display
                    onChange={handleInputChange}
                    onFocus={handleLookupFocus}
                    onBlur={handleLookupBlur}
                    className="property-input"
                    autoComplete="off" 
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="lookup-suggestions-list">
                        {suggestions.map(suggestion => (
                            <li
                                key={suggestion.Id}
                                onMouseDown={() => handleLookupSuggestionClick(suggestion)} 
                                className="lookup-suggestion-item"
                            >
                                {suggestion.Name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
        break;
    case 'list':
        const listItems = Array.isArray(currentValue) ? currentValue : [];
        
        const handleAddListItem = () => {
            const newItem = config.defaultListItemValue ? { ...config.defaultListItemValue } : {};
            // If no default value, try to infer from listItemConfig keys
            if (Object.keys(newItem).length === 0 && config.listItemConfig) {
                for (const key in config.listItemConfig) {
                    newItem[key] = ''; // Default to empty string or infer from listItemConfig's type
                }
            }
            const newList = [...listItems, newItem];
            setCurrentValue(newList);
            onPropertyChange(propertyName, newList);
        };

        const handleDeleteListItem = (index: number) => {
            const newList = listItems.filter((_, i) => i !== index);
            setCurrentValue(newList);
            onPropertyChange(propertyName, newList);
        };

        const handleListItemPropertyChange = (itemIndex: number, itemPropertyName: string, itemNewValue: any) => {
            const newList = listItems.map((item, i) => {
                if (i === itemIndex) {
                    return { ...item, [itemPropertyName]: itemNewValue };
                }
                return item;
            });
            setCurrentValue(newList);
            onPropertyChange(propertyName, newList);
        };

        inputElement = (
            <div className="property-list-container">
                {listItems.map((listItem, itemIndex) => (
                    <div key={itemIndex} className="property-list-item">
                        <div className="property-list-item-fields">
                            {config.listItemConfig && Object.entries(config.listItemConfig).map(([itemPropName, itemPropConfig]) => (
                                <ConfigurablePropertyRenderer
                                    key={`${itemIndex}-${itemPropName}`}
                                    propertyName={itemPropName}
                                    propertyValue={listItem[itemPropName]}
                                    config={itemPropConfig}
                                    onPropertyChange={(name, value) => handleListItemPropertyChange(itemIndex, name, value)}
                                />
                            ))}
                        </div>
                        <button type="button" onClick={() => handleDeleteListItem(itemIndex)} className="vscode-button vscode-button-secondary property-list-item-delete">
                            Delete
                        </button>
                    </div>
                ))}
                <button type="button" onClick={handleAddListItem} className="vscode-button property-list-add-button">
                    Add Item
                </button>
            </div>
        );
        break;
        case 'textarea':
            inputElement = (
                <textarea
                    id={inputId}
                    value={inputValue} // Use inputValue for consistency if other types also adopt it
                    onChange={handleInputChange}
                    className="property-textarea"
                    rows={(config.options?.find(opt => opt.label === 'rows')?.value as number) || 3}
                />
            );
            break;
        case 'checkbox':
            inputElement = (
                 <div className="property-checkbox-container">
                    <input
                        type="checkbox"
                        id={inputId}
                        checked={Boolean(currentValue)} // Checkbox directly uses currentValue (boolean)
                        onChange={handleInputChange}
                        className="property-checkbox"
                    />
                 </div>
            );
            break;
        case 'number':
            inputElement = (
                <input
                    type="number"
                    id={inputId}
                    value={inputValue} // Use inputValue for consistency
                    onChange={handleInputChange}
                    className="property-input"
                />
            );
            break;
        case 'select':
            inputElement = (
                <select
                    id={inputId}
                    value={typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue ?? '')}
                    onChange={handleInputChange}
                    className="property-select"
                >
                    {config.options?.map(option => (
                        <option key={option.label} value={typeof option.value === 'object' ? JSON.stringify(option.value) : String(option.value)}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
            break;
        case 'radio':
            inputElement = (
                <div className="property-radio-group">
                    {config.options?.map(option => (
                        <label key={option.label} className="property-radio-label">
                            <input
                                type="radio"
                                id={`${inputId}-${option.value}`}
                                name={propertyName} 
                                value={String(option.value)}
                                checked={currentValue === option.value} // Radio directly uses currentValue
                                onChange={handleInputChange}
                                className="property-radio"
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            );
            break;
        case 'code': 
            inputElement = (
                <textarea
                    id={inputId}
                    value={inputValue} // Use inputValue for consistency
                    onChange={(e) => {
                        setInputValue(e.target.value); // Update local inputValue
                        setCurrentValue(e.target.value); // For code, assume string value is the actual value
                        onPropertyChange(propertyName, e.target.value);
                    }}
                    className="property-textarea property-code" 
                    rows={(config.options?.find(opt => opt.label === 'rows')?.value as number) || 5}
                />
            );
            break;
        case 'text':
        default:
            inputElement = (
                <input
                    type="text"
                    id={inputId}
                    value={inputValue} // Use inputValue for consistency
                    onChange={handleInputChange}
                    className="property-input"
                />
            );
            break;
    }
    
    // For checkbox and radio, the label is part of the inputElement structure for better layout control.
    // For other types, the label is rendered here.
    const showLabelSeparately = !['checkbox', 'radio'].includes(config.uiType);
    const hasHelpText = config.helpText && config.helpText.trim() !== '';

    return (
        <div className="property-grid-item" style={style}>
            <div className={`property-group type-${config.uiType} ${config.uiType === 'lookup' ? 'lookup-container' : ''}`}>
                {showLabelSeparately && (
                    <div className="property-label-container">
                        <label htmlFor={inputId} className="property-label">
                            {config.label}:
                        </label>
                        {hasHelpText && (
                            <span 
                                className="property-help-icon" 
                                onClick={() => setIsHelpVisible(!isHelpVisible)}
                                title="Toggle help text"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsHelpVisible(!isHelpVisible);}}
                            >
                                (?)
                            </span>
                        )}
                    </div>
                )}
                 {hasHelpText && isHelpVisible && (
                    <div className="property-help-text-panel">
                        {config.helpText}
                    </div>
                )}
                {inputElement}
                {/* Moved help text display to be part of the accordion logic for non-checkbox/radio types */}
                {/* For checkbox/radio, help text might need to be displayed differently if label is not separate */}
                {/* Or, always show help text panel below the input element for consistency */}
                {!showLabelSeparately && hasHelpText && (
                     <div className="property-label-container" style={{ justifyContent: 'flex-start', marginBottom: '5px' }}>
                        {/* For checkbox/radio, help icon could be here if not next to label within inputElement */}
                         <span 
                            className="property-help-icon" 
                            onClick={() => setIsHelpVisible(!isHelpVisible)}
                            title="Toggle help text"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsHelpVisible(!isHelpVisible);}}
                        >
                            (?)
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
