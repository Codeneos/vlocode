import { isChoiceScriptElement, OmniScriptDefinition, OmniScriptElementDefinition, OmniScriptElementType, OmniScriptGroupElementDefinition, VlocityUITemplate } from './types';
import { CustomError, deepClone, escapeHtmlEntity, isCustomError, mapGetOrCreate } from '@vlocode/util';
import { randomUUID } from 'crypto';
import { OmniScriptAllowedRootElementTypes } from './constants';

export interface AddElementOptions {
    /**
     * ID of the parent element to add the element to.
     */
    parentElementId?: string;
    /**
     * ID of the embedded OmniScript element to link the element to.
     */
    scriptElementId?: string;
}

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
        'Selectable Items': this.addInputBlock.bind(this),
        'Type Ahead Block': this.addTypeAheadBlock.bind(this)
    };

    constructor(private readonly scriptDef: OmniScriptDefinition) {
    }

    /**
     * Determines whether the script definition supports multiple languages.
     * Returns `true` if the `bpLang` property matches "MultiLanguage" or "Multi-Language" (case-insensitive).
     */
    public get isMultiLanguage() {
        return /^Multi-?Language$/i.test(this.scriptDef.bpLang);
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

    public addRuntimePicklistSource(
        optionSource: { type: 'SObject' | 'Custom' | 'Manual' | 'Image', source: string }, 
        controllingField?: { type?: 'SObject' | 'Custom' | 'None', source: string, element: string } | undefined
    ) {
        this.setPicklistValues(optionSource, controllingField, '');
    }

    /**
     * Sets the design time picklist values for the specified option source.
     * This is used to set the picklist values for the script definition at design time.
     * @param optionSource 
     * @param values 
     * @returns 
     */
    public setPicklistValues(
        optionSource: { type: 'SObject' | 'Custom' | 'Manual' | 'Image', source: string }, 
        controllingField?: { type?: 'SObject' | 'Custom' | 'None', source: string, element: string } | undefined,
        values?: { value: string, name: string }[] | ''
    ) {
        if (!optionSource.source) {
            return;
        }

        if (controllingField?.type === 'SObject' && controllingField.source) {
            this.scriptDef.depSOPL[`${optionSource.source}/${controllingField.source}`] = values ?? '';
        } else if (controllingField?.type === 'Custom' && controllingField.source) { 
            this.scriptDef.depCusPL[`${controllingField.element}/${controllingField.source}`] = values ?? '';
        } else if (optionSource.type === 'Custom') {
            this.scriptDef.cusPL[optionSource.source] = values ?? '';
        } else if (optionSource.type === 'SObject') {
            this.scriptDef.sobjPL[optionSource.source] = values ?? '';
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
     * @param element Element definition to add
     * @param options Options for adding the element
     */
    public addElement(id: string, element: OmniScriptElementDefinition, options?: AddElementOptions) {
        // Validate if the element can be added
        this.validateElement(element, options);

        // Add labels to the script definition
        this.addElementLabels(element);

        this.elements.set(id, element);

        if (element.propSetMap?.HTMLTemplateId) {
            this.requiredTemplates.add(element.propSetMap.HTMLTemplateId);
        }

        if (isChoiceScriptElement(element)) {
            if (element.propSetMap.optionSource.type === 'Custom' && element.propSetMap.optionSource.source.includes('.')) {
                this.scriptDef.cusPL[element.propSetMap.optionSource.source] = '';
            }
            for (const option of (element.propSetMap.options ?? []).filter(o => o.value)) {
                this.scriptDef.labelKeyMap[option.value] = option.value;
            }
        }

        if (element.propSetMap?.repeat == true || ['Radio', 'Multi-select', 'Radio Group', 'Edit Block'].includes(element.type)) {
            this.scriptDef.rMap[element.name] = "";
        }

        const elementLevel = options?.parentElementId ? this.findElementById(options.parentElementId).level + 1 : 0;
        if (element.level === undefined || elementLevel > 0) {
            element.level = elementLevel;
        }

        if (options?.scriptElementId && !options?.parentElementId) {
            const scriptElement = this.findElementById(options.scriptElementId);
            element.offSet = this.scriptOffsets.get(options.scriptElementId)!;
            element.inheritShowProp = scriptElement.propSetMap?.show;
            element.bEmbed = true;
        } else if (options?.scriptElementId || !options?.parentElementId)  {
            element.bEmbed = false;
            element.offSet = 0;
        }

        if (options?.parentElementId) {
            try {
                this.group(options.parentElementId).addElement(element);
            } catch (err) {
                if (isCustomError(err) && err.code === 'ELEMENT_NOT_FOUND') {
                    throw new Error(`Script element "${element.name}" (${id}) has a ` +
                        `none-existing parent element with Id "${options?.parentElementId}"`);
                }
                throw err;
            }
        } else {
            if (element.type === 'OmniScript') {
                this.scriptOffsets.set(id, this.indexInParent);
                element.indexInParent = 0;
            } else {
                element.indexInParent = this.indexInParent++;
            }
            this.scriptDef.children.push(element);
        }

        this.addElementHandlers[element.type]?.(id, element, options);
    }

    private addElementLabels(element: OmniScriptElementDefinition) {
        if (element.propSetMap) {
            for (const [key, value] of Object.entries(element.propSetMap)) {
                if (!value || typeof value !== 'string') {
                    // Skip null and non-string values
                    continue;
                }
                if (/(label|message)$/i.test(key)) {
                    // All label and message keys are registered in the label key map
                    this.addLabel(value);
                }
            }
        }

        if (element.type === 'Step' && element.propSetMap.instruction) {
            this.addLabel(element.propSetMap.instruction);
        }

        if (element.type === 'Validation' && element.propSetMap.messages) {
            for (const msg of Object.values(element.propSetMap.messages)) { 
                this.addLabel(msg.text);
            }
        }
    }

    private addLabel(labelName: string | undefined) {
        if (!labelName || labelName.includes(' ')) {
            // If a label key includes a space, it is not a valid label key and should not be added
            return;
        }
        this.scriptDef.labelKeyMap[labelName] = labelName;
    }

    /**
     * Validates if the specified element can be added to the script definition. 
     * Throws an error when the element is invalid or not supported.
     * @param element Element to validate for adding
     * @param options Options for adding the element
     */
    private validateElement(element: OmniScriptElementDefinition, options?: AddElementOptions) : void | never {
        if (options?.parentElementId) {
            const scriptElement = this.findElementById(options.parentElementId, { throwsException: false });
            if (!scriptElement) {
                throw new Error(
                    `Element "${element.name}" (${element.type
                    }) links to none-existing parent element with Id "${options.scriptElementId}"`
                );
            }
        }

        if (options?.scriptElementId) {
            const scriptElement = this.findElementById(options.scriptElementId, { throwsException: false });
            if (!scriptElement) {
                throw new Error(
                    `Element "${element.name}" (${element.type
                    }) links to none-existing embedded OmniScript element with Id "${options.scriptElementId}"`
                );
            }

            if (scriptElement.type !== 'OmniScript') {
                throw new Error(
                    `Element "${element.name}" (${element.type}) links to ` +
                    `element with Id "${options?.scriptElementId}" that is not of type OmniScript (${scriptElement.type})`
                );
            }
        }

        // Specific for OmniScripts
        if (!options?.parentElementId) {
            const isAllowedInRoot = OmniScriptAllowedRootElementTypes.some(
                type => typeof type === 'string' ? type === element.type : type.test(element.type)
            );
            if (!isAllowedInRoot) {
                throw new Error(`${element.type} elements are not allowed allowed in root of an OmniScript (name: ${element.name})`);
            }
        } else if (element.type === 'OmniScript' || element.type === 'Step') {
            throw new Error(`${element.type} elements are only allowed allowed in root of an OmniScript (name: ${element.name})`);
        }
    }

    /**
     * Level of an existing element in the script definition.
     * @param id ID of the ekement to get the level
     */
    public elementLevel(id: string) {
        return this.findElementById(id).level;
    }

    /**
     * Calculate next order number for an element in the script definition.
     * @param parentId Optional ID of the parent element to get the next order number for
     */
    public nextOrder(parentId?: string) {
        return parentId ? this.group(parentId).nextOrder() : this.scriptDef.children.length;
    }

    private addInputBlock(id: string, element: OmniScriptElementDefinition) {
         element.JSONPath = this.elementPath(element);
    }

    private addTypeAheadBlock(id: string, element: OmniScriptElementDefinition) {
        const typeAheadElement = deepClone(element);
        this.group(id).addElement(typeAheadElement);

        // Update level and root index of inner type ahead
        typeAheadElement.type = 'Type Ahead';
        typeAheadElement.rootIndex = element.indexInParent;
        typeAheadElement.level = element.level + 1;

        // The outer type-ahead block gets a `-Block` postfix so it can be distinguished from the
        // inner element which carries the original element name
        element.name += `-Block`;
   }

    private group(id: string) {
        return mapGetOrCreate(
            this.groups, id,
            () => new OmniScriptElementGroupDefinitionBuilder(this.findElementById(id))
        );
    }

    private findElementById(id: string, options: { errorMessage?: string, throwsException: false }) : OmniScriptElementDefinition | undefined;
    private findElementById(id: string, options?: { errorMessage?: string, throwsException?: true }): OmniScriptElementDefinition | never;
    private findElementById(id: string, options?: { errorMessage?: string, throwsException?: boolean }): OmniScriptElementDefinition | undefined;
    private findElementById(id: string, options?: { errorMessage?: string, throwsException?: boolean }) : OmniScriptElementDefinition | undefined | never {
        const elementDefinition = this.elements.get(id);
        if (!elementDefinition && options?.throwsException) {
            throw new CustomError(options?.errorMessage ?? `Unable to find element with id "${id}"`, {
                code: 'ELEMENT_NOT_FOUND',
                source: 'OMNI_SCRIPT_DEFINITION_BUILDER'
            });
        }
        return elementDefinition
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
        for (const child of this.iterateElements()) {
            if (child.type === 'OmniScript') {
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

    private *iterateElements(elements: Array<OmniScriptElementDefinition> = this.scriptDef.children): IterableIterator<OmniScriptElementDefinition> {
        for (const child of elements) {
            yield child;
            if (Array.isArray(child['children']) && child.type !== 'Type Ahead Block') {
                for (const ele of child['children']) {
                    yield* this.iterateElements(ele.eleArray);
                }
            }
        }
    }

    [Symbol.iterator](): Iterator<OmniScriptElementDefinition, any, undefined> {
        return this.iterateElements();
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
    private elementPath(element: OmniScriptElementDefinition): string {
        if (element.level === 0) {
            return element.name;
        }

        for (const [id, group] of this.groups) {
            if (group.hasElement(element)) {
                return [this.elementPath(this.elements.get(id)!), element.name].join(':');
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

    public get level() {
        return this.group.level;
    }

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
     * Gets the next element order number in the group.
     * @returns The next element order number in the group
     */
    public nextOrder() { 
        return this.group.children?.length ?? 0;
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

        if (this.group.type === 'Type Ahead Block' && 
            this.group.children.length && 
            !this.group.children[0].eleArray[0].propSetMap?.taAction
        ) {
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