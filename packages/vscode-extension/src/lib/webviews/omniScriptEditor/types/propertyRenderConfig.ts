export interface PropertyRenderConfig {
    label: string; // Display label for the property
    uiType: 'text' | 'checkbox' | 'number' | 'textarea' | 'select' | 'radio' | 'code' | 'lookup' | 'expression' | 'list';
    gridWidth?: number; // 1-12, defaults to 12
    section?: string; // Name of the section this property belongs to
    helpText?: string;
    options?: Array<{ label: string; value: any }>; // For select, radio
    query?: string; // For lookup: SOQL query
    listItemConfig?: { [key: string]: PropertyRenderConfig }; // Configuration for properties of objects within the list
    defaultListItemValue?: { [key: string]: any }; // Default structure for a new list item
    // Future considerations:
    // readOnly?: boolean;
    // required?: boolean;
    // condition?: string; // Condition to show/hide this property editor
    // placeholder?: string;
}
