export type TemplateInputType = 'text' | 'select';

interface TemplateBaseInput<T extends TemplateInputType = TemplateInputType> {
    type: T;
    placeholder?: string;
    prompt?: string;
}

interface TemplateSelectInput extends TemplateBaseInput<'select'> {
    options: Array<{ label: string; value?: any }>;
}

export type TemplateInput = TemplateBaseInput<'text'> | TemplateSelectInput;

export interface NewItemTemplate {
    /**
     * The label to show in the quick pick list when selecting a template
     */
    label: string;
    /**
     * The folder name to use when creating the new item
     */
    folderName: string;
    /**
     * Optional description to show in the status bar when this template is selected
     */
    description?: string;
    /**
     * Optional notification to show when a new item is created
     */
    successNotification?: string;
    files: Array<{
        path: string;
        template: string;
    }>;
    /**
     * The inputs to show to the user when creating a new item, this is used to populate the template variables
     * in the template files above (e.g. ${name}) and is also used to populate the default values for the inputs in the UI.
     */
    input: Record<string, TemplateInput>;
}

declare const newItemTemplates : Array<NewItemTemplate>;

export default newItemTemplates;