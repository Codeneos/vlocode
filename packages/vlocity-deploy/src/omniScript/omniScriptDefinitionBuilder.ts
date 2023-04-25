import { isChoiceScriptElement, isEmbeddedScriptElement, OmniScriptDefinition, OmniScriptElementDefinition, OmniScriptElementType, OmniScriptGroupElementDefinition } from './omniScriptDefinition';
import { deepClone, escapeHtmlEntity, mapGetOrCreate } from '@vlocode/util';
import { VlocityUITemplate } from './vlocityUITemplate';
import { randomUUID } from 'crypto';

/**
 * Builds a script definition from a list of elements and templates.
 */
export class OmniScriptDefinitionBuilder implements Iterable<OmniScriptElementDefinition> {

    private indexInParent = 0;
    private requiredTemplates = new Set<string>();
    private embeddedTemplates = new Map<string, VlocityUITemplate>();
    private elements = new Map<string, OmniScriptElementDefinition>();
    private groups = new Map<string, OmniScriptElementGroupDefinitionBuilder>();
    private scriptOffsets = new Map<string, number>();
    private addElementHandlers: Partial<Record<OmniScriptElementType, OmniScriptDefinitionBuilder['addElement']>> = {
        'Input Block': this.addInputBlock.bind(this),
        'Type Ahead Block': this.addTypeAheadBlock.bind(this)
    };

    constructor(private readonly scriptDef: OmniScriptDefinition) {
    }

    /**
     * True if picklists are to be loaded at script startup; otherwise false and the generator is expected to load the picklists at design time.
     * In which case picklists labels are in the same language as the activating user
     */
    public get realtimePicklistSeed() {
        return this.scriptDef.propSetMap.rtpSeed;
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
     * Add a custom picklist controller to the script definition. This controller is invoked at the start of the script to load the picklist values.
     * @param controller Name of the controller to add in the following format: `<controller>.<method>`
     */
    public addRuntimePicklistSource(
        optionSource: { type: 'SObject' | 'Custom' | 'Manual' | 'Image', source: string }, 
        controllingField?: { type?: 'SObject' | 'Custom' | 'None', source: string, element: string}) 
    {
        if (!optionSource.source) {
            return;
        }

        if (controllingField?.type === 'SObject' && controllingField.source) {
            this.scriptDef.depSOPL[`${optionSource.source}/${controllingField.source}`] = '';
        } else if (controllingField?.type === 'Custom' && controllingField.source) { 
            this.scriptDef.depCusPL[`${controllingField?.element}/${controllingField.source}`] = '';
        } else if (optionSource.type === 'Custom') {
            this.scriptDef.cusPL[optionSource.source] = '';
        } else if (optionSource.type === 'SObject') {
            this.scriptDef.sobjPL[optionSource.source] = '';
        }
    }

    /**
     * Merges anther script definition into the script definition of the builder.
     * This is used to merge the test templates and custom JS of specified definition.
     * @param scriptDef Other definition to merge
     */
    public embedScriptHeader(scriptDef: OmniScriptDefinition) {
        this.scriptDef.testTemplates += scriptDef.testTemplates;
        this.scriptDef.customJS += scriptDef.customJS;
        if (scriptDef.propSetMap.seedDataJSON) {
            Object.assign(this.scriptDef.propSetMap.seedDataJSON, scriptDef.propSetMap.seedDataJSON);
        }
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

        if (isChoiceScriptElement(ele)) {
            if (ele.propSetMap.optionSource.type === 'Custom' && ele.propSetMap.optionSource.source.includes('.')) {
                this.scriptDef.cusPL[ele.propSetMap.optionSource.source] = '';
            }
        }

        if (ele.propSetMap?.repeat == true || ['Radio', 'Multi-select', 'Radio Group', 'Edit Block'].includes(ele.type)) {
            this.scriptDef.rMap[ele.name] = "";
        }

        if (!options?.parentElementId) {
            ele.level = 0;
        }

        if (options?.scriptElementId && !options?.parentElementId) {
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
        } else if (options?.scriptElementId || !options?.parentElementId)  {
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
            if (isEmbeddedScriptElement(ele)) {
                this.scriptOffsets.set(id, this.indexInParent);
                ele.indexInParent = 0;
            } else {
                ele.indexInParent = this.indexInParent++;
            }
            this.scriptDef.children.push(ele);
        }

        this.addElementHandlers[ele.type]?.(id, ele, options);
    }
    private addInputBlock(id: string, ele: OmniScriptElementDefinition) {
         ele.JSONPath = this.getJsonPath(ele);
    }

    private addTypeAheadBlock(id: string, ele: OmniScriptElementDefinition) {
        const typeAheadElement = deepClone(ele);
        this.getGroup(id)?.addElement(typeAheadElement);

        // Update level and root index of inner type ahead
        typeAheadElement.type = 'Type Ahead';
        typeAheadElement.rootIndex = ele.indexInParent;
        typeAheadElement.level = ele.level + 1;

        // The outer type-ahead block gets a `-Block` postfix so it can be distinguished from the
        // inner element which carries the original element name
        ele.name += `-Block`;
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
        this.scriptDef.lwcId = randomUUID();
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
            if (isEmbeddedScriptElement(child)) {
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
        const tagAttributes = attributes && Object.entries(attributes).map(([key, value]) => `${key}="${escapeHtmlEntity(value)}"`).join(' ');
        return `<${name}${tagAttributes ? ` ${tagAttributes}>` : '>'}${body ?? ''}</${name}>`;
    }

    private *getElements(elements: Array<OmniScriptElementDefinition> = this.scriptDef.children): IterableIterator<OmniScriptElementDefinition> {
        for (const child of elements) {
            yield child;
            if (Array.isArray(child['children']) && child.type !== 'Type Ahead Block') {
                for (const ele of child['children']) {
                    yield* this.getElements(ele.eleArray);
                }
            }
        }
    }

    [Symbol.iterator](): Iterator<OmniScriptElementDefinition, any, undefined> {
        return this.getElements();
    }

    /**
     * Find the element matching the specified predicate or name. Returns undefined when no matching element is found
     * @param predicate predicate to which the element must match
     */
    public findElement(predicate: string | ((element: OmniScriptElementDefinition) => boolean)): OmniScriptElementDefinition | undefined {
        const filter = typeof predicate === 'string' ? ((e) => e.name === predicate) : predicate;
        for (const element of this) {
            if (filter(element)) {
                return element;
            }
        }
    }

    /**
     * Get the JSON path of an element in the script definition.
     * If the element is not part of the script definition an error is thrown.     *
     * @param element Element to get the JSON path for
     * @returns JSON path of the element
     */
    private getJsonPath(element: OmniScriptElementDefinition): string {
        if (element.level === 0) {
            return element.name;
        }

        for (const [id, group] of this.groups) {
            if (group.hasElement(element)) {
                return [this.getJsonPath(this.elements.get(id)!), element.name].join(':');
            }
        }

        throw new Error('Element not found in script definition');
    }
}

/**
 * Builder for a group element definition that keeps track of the group state and allows adding new elements to the group.
 *
 * Groups can be Blocks or Step elements of the OmniScript.
 */
class OmniScriptElementGroupDefinitionBuilder {

    private indexInParent: number;
    private group: OmniScriptGroupElementDefinition;

    constructor(group: OmniScriptElementDefinition) {
        this.indexInParent = group.children?.length ?? 0;
        this.group = group as OmniScriptGroupElementDefinition;
    }

    /**
     * Checks if the group contains the given element.
     * @param element Element to check
     * @returns `true` if the group contains the given element otherwise `false`
     */
    public hasElement(element: OmniScriptElementDefinition) {
        return this.group.children.some(c => c.eleArray.includes(element));
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

        if (this.group.type === 'Type Ahead Block' && this.group.children.length) {
            this.group.children[0].eleArray[0].propSetMap!.taAction = child;
        } else {
            this.group.children.push({
                bHasAttachment: child.bHasAttachment,
                eleArray: [ child ],
                indexInParent: childIndex,
                level: this.group.level + 1,
                response: child.response as any
            });
        }
    }
}