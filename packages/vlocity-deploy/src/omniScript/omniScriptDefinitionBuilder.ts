import { OmniScriptDefinition, OmniScriptElementDefinition, OmniScriptEmbeddedScriptElementDefinition, OmniScriptGroupElementDefinition } from './omniScriptDefinition';
import { escapeHtmlEntity, mapGetOrCreate } from '@vlocode/util';
import { VlocityUITemplate } from './vlocityUITemplate';
/**
 * Builds a script definition from a list of elements and templates.
 */
export class OmniScriptDefinitionBuilder {

    private indexInParent = 0;
    private requiredTemplates = new Set<string>();
    private embeddedTemplates = new Map<string, VlocityUITemplate>();
    private elements = new Map<string, OmniScriptElementDefinition>();
    private groups = new Map<string, OmniScriptElementGroupDefinitionBuilder>();
    private scriptOffsets = new Map<string, number>();

    constructor(private readonly scriptDef: OmniScriptDefinition) {
    }

    /**
     * Get a list of templates that the elements in the script definition use.
     */
    public get templateNames() {
        return [...this.requiredTemplates.keys()];
    }

    /**
     * Add a template to be embedded in the script definition.
     * @param template UI Template to be embedded
     */
    public addTemplate(template: VlocityUITemplate) {
        this.embeddedTemplates.set(template.name, template);
    }

    /**
     * Adds an element to the script definition.
     * @param id ID of the element to add
     * @param ele Element definition to add
     * @param options Options for adding the element
     */
    public addElement(id: string, ele: OmniScriptElementDefinition, options?: { parentElementId?: string; scriptElementId?: string; }) {
        this.elements.set(id, ele);

        if (ele.propSetMap?.HTMLTemplateId) {
            this.requiredTemplates.add(ele.propSetMap.HTMLTemplateId);
        }

        if (options?.scriptElementId) {
            const scriptElement = this.elements.get(options.scriptElementId);
            if (!scriptElement) {
                throw new Error(`Script element "${ele.name}" (${id}) links to ` +
                    `none-existing embedded OmniScript element with Id "${options?.scriptElementId}"`);
            }
            if (scriptElement.type !== 'OmniScript') {
                throw new Error(`Script element "${ele.name}" (${id}) links to ` +
                    `element with Id "${options?.scriptElementId}" that is not of type OmniScript (${scriptElement.type})`);
            }
            ele.offSet = this.scriptOffsets.get(options.scriptElementId)!;
            ele.inheritShowProp = scriptElement.propSetMap?.show;
            ele.bEmbed = true;
        } else {
            ele.bEmbed = false;
            ele.offSet = 0;
        }

        if (options?.parentElementId) {
            const group = this.getGroup(options?.parentElementId);
            if (!group) {
                throw new Error(`Script element "${ele.name}" (${id}) has a ` +
                    `none-existing parent element with Id "${options?.parentElementId}"`);
            }
            group.addElement(ele);
        } else {
            if (this.isEmbeddedScriptElement(ele)) {
                this.scriptOffsets.set(id, this.indexInParent);
                ele.indexInParent = 0;
            } else {
                ele.indexInParent = this.indexInParent++;
            }
            this.scriptDef.children.push(ele);
        }
    }

    private getGroup(id: string) {
        const groupDefinition = this.elements.get(id);
        if (groupDefinition) {
            return mapGetOrCreate(
                this.groups, id,
                () => new OmniScriptElementGroupDefinitionBuilder(groupDefinition)
            );
        }
    }

    /**
     * Updates the script definition and returns it.
     * @returns Compiled script definition
     */
    public build() {
        this.updateEmbeddedTemplates();
        this.updateLabelMap();
        return this.scriptDef;
    }

    /**
     * Update the label to element map mapping each element name to a label; used to lookup labels of elements at run-time.
     */
    private updateLabelMap() {
        this.scriptDef.labelMap = {};
        for (const child of this.getElements()) {
            if (this.isEmbeddedScriptElement(child)) {
                continue;
            }
            this.scriptDef.labelMap[child.name] = child.propSetMap?.label ?? null;
        }
    }

    /**
     * Updates the template list of the script definition and embedded not already included templates in the script definition.
     */
    private updateEmbeddedTemplates() {
        const templateHtml = new Array<string>();
        const templateScript = new Array<string>();
        const templateStyle = new Array<string>();
        
        for (const [name, template] of this.embeddedTemplates) {
            if (this.scriptDef.templateList.includes(name)) {
                continue;
            }

            if (template.html) {
                templateHtml.push(this.createHtmlTag('script', template.html, { type: 'text/ng-template', id: name }));
            }
            
            if(template.css) {
                const cssSourceUrl = `\n/*# sourceURL=vlocity/dynamictemplate/${template.name}.css */\n`;
                templateStyle.push(this.createHtmlTag('style', template.css + cssSourceUrl));
            }

            if (template.customJavascript) {
                templateScript.push(this.createIIFE(name, template.customJavascript));
            }

            this.scriptDef.templateList.push(name);
        }

        // First include templates followed by CSS styling and then load the embedded script controllers
        this.scriptDef.testTemplates = (this.scriptDef.testTemplates ?? '') + templateHtml.join('') + templateStyle.join('') + templateScript.join('');
    }

    /**
     * Create script-tag with an immediate-invoked function expression (IIFE) to wrap the script body.
     * @param name Script name without extension
     * @param script Script body
     * @returns HTML script tag with IIFE
     */
    private createIIFE(name: string, script: string) {
        const sourceMap = `\n//# sourceURL=vlocity/dynamictemplate/${name}.js\n`
        const errorHandler = `console.error('Error in ${name}.js', e);`
        const scriptBody = `(function() { try {\n${script}\n} catch(e) { ${errorHandler} } })();${sourceMap}`;
        return this.createHtmlTag('script', scriptBody, { type: 'text/javascript', id: `${name}.js` });
    }

    private createHtmlTag(name: string, body?: string, attributes?: Record<string, string>) {
        const tagAttributes = Object.entries(attributes ?? {}).map(([key, value]) => `${key}="${escapeHtmlEntity(value)}"`).join(' ');
        return `<${name}${tagAttributes ? ` ${tagAttributes}>` : '>'}${body ?? ''}</${name}>`;
    }

    private isEmbeddedScriptElement(def: OmniScriptElementDefinition): def is OmniScriptEmbeddedScriptElementDefinition {
        return def.type === 'OmniScript';
    }

    private *getElements(elements: Array<OmniScriptElementDefinition> = this.scriptDef.children): IterableIterator<OmniScriptElementDefinition> {
        for (const child of elements) {
            yield child;
            if (Array.isArray(child['children'])) {
                for (const ele of child['children']) {
                    yield* this.getElements(ele.eleArray);
                }
            }
        }
    }
}

/**
 * Builder for a group element definition that keeps track of the group state and allows adding new elements to the group.
 * 
 * Groups can be Blocks or Step elements of the OmniScript.
 */
class OmniScriptElementGroupDefinitionBuilder {

    private indexInParent = 0;
    private group: OmniScriptGroupElementDefinition;
    
    constructor(group: OmniScriptElementDefinition) {
        if (!group['children']) {
            group['children'] = [{
                bHasAttachment: false,
                eleArray: [],
                indexInParent: group.indexInParent,
                level: group.level,
                response: null
            }];
        } 
        this.group = group as OmniScriptGroupElementDefinition;
    }

    /**
     * Adds a child element to the group.
     * @param child Child element to add to the group
     */
    public addElement(child: OmniScriptElementDefinition) {
        const childIndex = this.indexInParent++;

        child.rootIndex = this.group.rootIndex ?? (this.group.indexInParent - this.group.offSet);      
        child.indexInParent = childIndex;  
        child.index = 0;
        child.JSONPath = "";
        child.response = null;
        child.children = [];

        this.group.children.push({
            bHasAttachment: false,
            eleArray: [ child ],            
            indexInParent: childIndex,
            level: this.group.level + 1,
            response: null
        });
    }
}