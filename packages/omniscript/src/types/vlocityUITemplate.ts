/**
 * Describes a Vlocity UI Template
 */
export interface VlocityUITemplate {
    name: string; 
    html?: string;
    customJavascript?: string;
    css?: string;
    sass?: string;
}

export interface VlocityUITemplateRecord extends VlocityUITemplate {
    id: string;
    active: boolean;
}