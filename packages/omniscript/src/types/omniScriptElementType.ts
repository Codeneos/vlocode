export type OmniScriptInputElementType =
    'Checkbox' |
    'Currency' |
    'Date' |
    'Date/Time (Local)' |
    'Disclosure' |
    'Email' |
    'File' |
    'Lookup' |
    'Number' |
    'Password' |
    'Range' |
    'Signature' |
    'Telephone' |
    'Text' |
    'Text Area' |
    'Time' |
    'Type Ahead' |
    'URL';

export type OmniScriptInputChoiceElementType = 'Radio' | 'Select' | 'Multi-select';

export type OmniScriptActionElementType = 
    'Calculation Action' |
    'DataRaptor Extract Action' |
    'DataRaptor Post Action' |
    'DocuSign Envelope Action' |
    'DocuSign Signature Action' |
    'Done Action' |
    'Email Action' |
    'PDF Action' |
    'Post to Object Action' |
    'Remote Action' |
    'Response Action' |
    'Rest Action' |
    'Review Action' |
    'DataRaptor Transform Action' |
    'Matrix Action' |
    'Integration Procedure Action' |
    'Intelligence Action' |
    'List Merge Action' |
    'Custom LWC' |
    'Navigate Action' |
    'Delete Action' |
    'Batch Action' |
    'DataRaptor Turbo Action';

export type OmniScriptGroupElementType = 
    'Block' | 
    'Step' | 
    'Loop Block' | 
    'Conditional Block' | 
    'Try Catch Block' | 
    'Filter Block' |
    'Type Ahead Block' | 
    'Edit Block' |    
    'Action Block';

export type OmniScriptBaseElementType = 
    'Aggregate' |
    'Filter' |
    'Formula' |
    'Geolocation' |
    'Headline' |
    'Image' |
    'Input Block' |
    'Line Break' |
    'Text Block' |
    'Selectable Items' |
    'Set Errors' |
    'Set Values' |
    'Submit' |
    'Validation' |
    'Custom Lightning Web Component' |
    'Cache Block' |
    'Radio Group';

/**
 * OmniScript element types
 */
export type OmniScriptElementType = 
    OmniScriptInputElementType | 
    OmniScriptActionElementType |
    OmniScriptInputChoiceElementType | 
    OmniScriptGroupElementType |
    OmniScriptBaseElementType |
    'OmniScript';