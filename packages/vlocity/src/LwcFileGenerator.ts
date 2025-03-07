import * as fs from 'fs';
import * as path from 'path';

interface LwcFile {
    name: string;
    source: string;
    filepath: string;
    format: string;
}

interface CardDefinition {
    Name: string;
    Id: string;
    AuthorName: string;
    VersionNumber: string;
    IsActive: boolean;
    IsChildCard?: boolean;
    Type?: string;
    PropertySetConfig: any;
    StylingConfiguration?: any;
    Attachments?: any[];
    Label?: Record<string, string>;
    [key: string]: any;
}

interface MetaConfig {
    apiVersion: number;
    isExposed: boolean;
    masterLabel: string;
    description?: string;
    runtimeNamespace?: string;
    targets?: {
        target: string[];
    };
    targetConfigs?: string;
    lwcResources?: {
        lwcResource: LwcResource[];
    };
}

interface LwcResource {
    source: string;
    filepath: string;
    name: string;
}

export class LwcFileGenerator {
    private nsPrefix: string = 'c';
    private lwcPrefix: string = 'cf';
    private isInsidePackage: boolean = false;
    private renderedElementCount: string = '';
    private styleDefinition: Record<string, any> = {};
    private actionElementsSlotObject: Record<string, string> = {};
    private isRepeatable: boolean = true;
    private isStateActiveHtml: boolean = true;
    private downloadMode: string = '';
    private readonly DOWNLOAD_OFF_PLATFORM_MODE = 'downloadoffplatform';
    
    private readonly defaultXmlConfig = {
        targetConfigs: `<targetConfig targets="lightning__AppPage">
            <property name="debug" type="Boolean"/>
            <property name="recordId" type="String"/>
        </targetConfig>
        <targetConfig targets="lightning__RecordPage">
            <property name="debug" type="Boolean"/>
        </targetConfig>`,
        recordPageConfig: `<targetConfig targets="lightning__RecordPage">
            <property name="debug" type="Boolean"/>
            <property name="recordId" type="String"/>
        </targetConfig>`,
        appPageConfig: `<targetConfig targets="lightning__AppPage">
            <property name="debug" type="Boolean"/>
            <property name="recordId" type="String"/>
        </targetConfig>`,
        targets: ['lightning__RecordPage', 'lightning__AppPage', 'lightning__HomePage'],
        api: 56
    };

    
    private readonly requiredPermissionsError = 
        `<div class="slds-text-align_center slds-text-color_error">You do not have the required permissions to view this card.</div>`;

    private readonly FLEXCARD_COMMON_PROPS = [
        'recordId',
        'objectApiName', 
        'theme',
        'orgNsPrefix',
        'sessionVars',
        'searchParam',
        'obj',
        'isRecursive',
        'debug',
        'isChildCardTrackingEnabled',
        'trackingObj',
        'testParams',
        'size',
        'records',
        'cardNode',
        'parentData',
        'parentUniquekey',
        'isInsideParent',
        'parentRecord',
        'parentRecords',
        'parentAttribute',
        'parentMergefields',
        'listenOsDataChange',
        'omniJsonData'
    ];

    private readonly FLEXCARD_OS_SUPPORT_PROPS = [
        'omniSupportKey',
        'omniScriptHeaderDef',
        'omniResume',
        'omniSeedJson',
        'omniJsonDef',
        'omniCustomState',
        'omniJsonDataStr'
    ];

    private readonly pubsubEventVarPrefix = 'pubsubEvent';
    private readonly customEventVarPrefix = 'customEvent';

    constructor(private isStdRuntime: boolean = false) {}

    public generateLWCFiles(
        lwcComponentName: string, 
        item: CardDefinition, 
        type: string, 
        mode: string | null = null, 
        metaObject?: MetaConfig
    ): LwcFile[] {
        const files: LwcFile[] = [];
        let jsSource: string,
            defSource: string,
            htmlSource: string,
            cssSource: string,
            styleDefSource: string,
            xmlSource: string;

        // Store original namespace prefix for restoration later
        const actualNsPrefix = this.nsPrefix;

        if (mode === this.DOWNLOAD_OFF_PLATFORM_MODE) {
            this.downloadMode = this.DOWNLOAD_OFF_PLATFORM_MODE;
        }

        if (this.isInsidePackage && mode === this.DOWNLOAD_OFF_PLATFORM_MODE) {
            this.nsPrefix = 'c';
        }

        let layoutDefinition = this.getLayoutDefinition(item);
        this.actionElementsSlotObject = {};

        const theme = layoutDefinition.theme || 'slds';
        const customCssAttachmentId = item.Attachments?.[0]?.Id;
        const cardRecordId = item.Id;

        if (type === 'card' && !this.isStdRuntime) {
            htmlSource = this.generateCardHtml(layoutDefinition, theme, item);
            jsSource = this.generateCardJs(lwcComponentName, theme, item.Label, layoutDefinition, cardRecordId, customCssAttachmentId);
            cssSource = this.generateCssSource(item);
            defSource = this.generateDefinition(item);
            styleDefSource = this.generateStyleDefinition();
            xmlSource = this.generateJsMetaXML(lwcComponentName, item, metaObject);
        } else if (type === 'card' && this.isStdRuntime) {
            htmlSource = this.generateStandardRuntimeWrapperHtml(item.Name, layoutDefinition);
            jsSource = this.generateStandardRuntimeWrapperJs(lwcComponentName, layoutDefinition);
            cssSource = '/* intentionally empty */';
            xmlSource = this.generateJsMetaXML(lwcComponentName, item, metaObject);
        }

        // Push generated files
        this.pushGeneratedFiles(files, lwcComponentName, {
            jsSource,
            defSource,
            htmlSource,
            cssSource,
            styleDefSource,
            xmlSource
        });

        // Restore namespace if needed
        if (this.isInsidePackage && mode === this.DOWNLOAD_OFF_PLATFORM_MODE) {
            this.nsPrefix = actualNsPrefix;
        }

        return files;
    }

    private getLayoutDefinition(item: CardDefinition): any {
        let layoutDefinition = item.PropertySetConfig;
        if (layoutDefinition && typeof layoutDefinition === 'string') {
            layoutDefinition = JSON.parse(layoutDefinition);
        }
        return layoutDefinition;
    }

    private generateCardHtml(cardDef: any, theme: string, item: CardDefinition): string {
        let cardHtml = '';
        let stateActiveHtml = '';
        let stateInActiveHtml = '';
        let listenToWidthResize = cardDef && cardDef.listenToWidthResize;
        
        this.styleDefinition = {};
        
        // Generate HTML for each state
        cardDef.states.forEach((state: any, index: number) => {
            stateActiveHtml += this.generateStateHtml(cardDef, index, theme, true, item);
            stateInActiveHtml += this.generateStateHtml(cardDef, index, theme, false, item);
        });
        
        // Create HTML structure based on whether the card is repeatable
        if (cardDef.isRepeatable || typeof cardDef.isRepeatable === 'undefined') {
            cardHtml = `<template if:true={hasRecords}>
                        <template for:each={_records} for:item="record" for:index="rindex">
                            ${stateActiveHtml}
                        </template>
                      </template>
                      <template if:false={hasRecords}>
                            ${stateInActiveHtml}
                      </template>`;
        } else {
            cardHtml = `<template if:true={hasRecords}>
                      ${stateActiveHtml}
                </template>
                <template if:false={hasRecords}>
                      ${stateInActiveHtml}
                </template>`;
        }
        
        // Generate HTML for action elements
        let actionHtml = '';
        Object.keys(this.actionElementsSlotObject).forEach(ele => {
            actionHtml += this.actionElementsSlotObject[ele];
        });
        
        // Return complete HTML template
        return `<template>
            <div class="${theme}-grid ${theme}-wrap ${theme}-is-relative ${listenToWidthResize ? 'containersize' : ''}">
            ${this.generateToast(theme)}
            ${this.generateLoader(theme)}
            <template if:false={hasPermission}>
              ${this.requiredPermissionsError}
            </template>
            <template if:true={hasPermission}>
              ${cardHtml}
            </template>
            <template if:true={hasError}>
            {error}
            </template>
            ${this.generateEventListenerElement(cardDef)}
            <${this.nsPrefix}-action class="execute-action" re-render-flyout action-wrapperclass="slds-hide" onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} onfireactionevent={actionEvtHandler}>
            ${actionHtml}
            </${this.nsPrefix}-action>
            </div>
          </template>`;
    }

    private generateStateHtml(cardDef: any, index: number, theme: string, isactive: boolean, item: CardDefinition): string {
        const omniSupport = cardDef && cardDef.osSupport;
        const state = cardDef.states[index];
        
        this.isRepeatable = cardDef.isRepeatable || typeof cardDef.isRepeatable === 'undefined';
        this.isStateActiveHtml = isactive;
        
        const stateObj = this.isRepeatable ? 'record={record}' : '';
        
        if (state) {
            const elements = state.components && state.components['layer-0'].children;
            
            if (elements) {
                const stateTrackingHtml = ' tracking-obj={_childCardTrackingObj} ';
                this.renderedElementCount = '';
                
                return `<${this.nsPrefix}-flex-card-state ${isactive && this.isRepeatable ? 'if:true={record}  key={record._flex.uniqueKey} data-recordid={record.Id}' : ''} ${stateObj} data-statue="${isactive}"  data-index="${index}" data-rindex={rindex} class="cf-vlocity-state-${index} cf-vlocity-state ${this.getElementStyle(state, 'sizeClass')}" ${stateTrackingHtml}>
                <div if:true={cardLoaded} class="${theme}-grid ${theme}-wrap ${this.getElementStyle(state, 'class')}" style="${this.getElementStyle(state, 'style')}">
                    ${elements.map((element: any, elementIndex: number) => {
                        this.renderedElementCount = 'state' + index + 'element' + elementIndex;
                        
                        if (element.element === 'customLwc') {
                            let ele = this.cloneDeep(element);
                            ele.element = ele.property && ele.property.customlwcname 
                                ? ele.property.customlwcname 
                                : ele.element;
                            
                            if (ele.property && ele.property.customlwcname) {
                                delete ele.property.customlwcname;
                            }
                            
                            return this.generateElementDiv(ele, theme, 'customLwc', omniSupport, item);
                        }
                        
                        // Support for radio input elements
                        if (element.element === 'baseInputElement' && 
                            (element.name === 'RadioGroup' || element.name === 'Radio Image Group' || element.name === 'Radio Color Pick Group')) {
                            element.element = 'flexRadioInput';
                        }
                        
                        return this.generateElementDiv(element, theme, '', omniSupport, item);
                    }).join('')}
                </div>
              </${this.nsPrefix}-flex-card-state>`;
            }
        }
        
        return '';
    }

    private generateToast(theme: string): string {
        return `<div style="position: fixed;z-index: 999999;top: 0;right: 0;">
  <${this.nsPrefix}-toast class="flexcard-toast-element" theme="${theme}" title="" message="" styletype=""> </${this.nsPrefix}-toast>
</div>`;
    }

    private generateLoader(theme: string): string {
        return `<div if:true={showLoader} class="${theme}-is-absolute vloc-loader_override" style="height: 100%; width: 100%; min-height:50px; background: transparent; z-index: 99;">
  <div>
   <${this.nsPrefix}-spinner
      variant="brand"
      alternative-text="Loading content..."
      size="${theme === 'slds' ? 'medium' : 'small'}"
      theme="${theme}"
      ></${this.nsPrefix}-spinner>
  </div>
</div>`;
    }

    private generateEventListenerElement(cardDef: any): string {
        let flyoutSlots = '';
        
        if (cardDef.events) {
            cardDef.events.forEach((eve: any, eventIndex: number) => {
                // Convert previously configured single action into multiple action array
                eve.actionList = eve.actionList || (eve.actionData ? [eve.actionData] : []);
                
                if (eve.actionList) {
                    eve.actionList.forEach((action: any, actionIndex: number) => {
                        flyoutSlots += this.generateFlyoutForTriggerActionElement(
                            action, 
                            `listener${eventIndex}action${actionIndex}`
                        );
                    });
                }
            });
        }
        
        return `
      <${this.nsPrefix}-action action-wrapperclass="slds-hide" re-render-flyout class="action-trigger slds-col" 
          onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} onfireactionevent={actionEvtHandler}>
      ${flyoutSlots}
      </${this.nsPrefix}-action>
  `;
    }

    // Helper methods for HTML generation
    private getElementStyle(element: any, type: string, index?: number): string {
        if (element.styleObjects && element.styleObjects.length > 0 && typeof index !== 'undefined') {
            return element.styleObjects[index] && (element.styleObjects[index].styleObject[type] || '');
        }
        
        if (element.styleObject && element.styleObject[type]) {
            return element.styleObject[type];
        }
        
        return '';
    }

    private generateElementDiv(element: any, theme: string, type: string, omniSupport: boolean, item: CardDefinition): string {
        let ele = this.cloneDeep(element);
        let elementName = this.lwcPropertyNameConversion(`${this.nsPrefix}-${ele.element}`);
        
        // Handle childCardPreview element
        if (ele.element === 'childCardPreview') {
            let childDevName = this.getDevNamefromCardname(ele.property.cardName);
            
            // if isRecursive and if card is Active then use active card name
            let cardObjectFields = this.getCardObjectFields(item);
            let isActive = item[cardObjectFields?.IsActive];
            
            if (ele.property && ele.property.isRecursive && isActive) {
                childDevName = this.getDevNamefromCardname(item.Name);
            }
            
            let selectedCustomLwcList = this.filterLwcBundles({
                DeveloperName: childDevName
            });
            
            let selectedCustomLwc;
            if (selectedCustomLwcList && selectedCustomLwcList.length === 1) {
                selectedCustomLwc = selectedCustomLwcList[0];
            } else {
                selectedCustomLwc = this.findLwcBundle({
                    DeveloperName: childDevName,
                    ManageableState: "unmanaged"
                });
            }
            
            let cNamespace = this.isInsidePackage && selectedCustomLwc && 
                selectedCustomLwc.ManageableState !== "unmanaged" && 
                selectedCustomLwc.NamespacePrefix || "c";
                
            if (this.isInsidePackage && this.downloadMode === this.DOWNLOAD_OFF_PLATFORM_MODE) {
                cNamespace = "c";
            }
            
            elementName = this.lwcPropertyNameConversion(`${cNamespace}-${childDevName}`);
            
            if (ele.property && ele.property.cardName) {
                ele.property.recordId = "{recordId}";
                ele.property.objectApiName = "{objectApiName}";
                ele.property.parentRecord = "{record}";
                ele.property.parentMergefields = "{card}";
                ele.property.records = "{_records}";
                delete ele.property.selectedState;
            }
        } 
        // Handle customLwc element
        else if (type === "customLwc") {
            let selectedCustomLwc;
            
            if (ele.property?.customLwcData) {
                selectedCustomLwc = ele.property.customLwcData;
                delete ele.property.customLwcData;
            } else {
                selectedCustomLwc = this.findLwcBundle({
                    DeveloperName: ele.element
                });
            }
            
            let cNamespace = selectedCustomLwc ? 
                this.isInsidePackage && selectedCustomLwc.ManageableState !== "unmanaged" && selectedCustomLwc.NamespacePrefix || "c" : 
                null;
                
            if (this.isInsidePackage && this.downloadMode === this.DOWNLOAD_OFF_PLATFORM_MODE) {
                cNamespace = "c";
            }
            
            const cmpName = cNamespace ? `${cNamespace}-${ele.element}` : ele.element;
            elementName = this.lwcPropertyNameConversion(cmpName);
        }
        
        let isFlyoutAction = false;
        if (this.isSingleAction(ele)) {
            let stateAction = ele.property.stateAction;
            isFlyoutAction = stateAction && stateAction.parent !== "menu" && stateAction.type === "Flyout";
        }
        
        let template;
        let trackingHtml = ` tracking-obj={_childCardTrackingObj} `;
        
        // Handle different element types with different templates
        if (isFlyoutAction) {
            this.updateStyleDefinitionJSON(this.renderedElementCount, ele);
            template = this.createFlyoutActionTemplate(elementName, ele, trackingHtml, theme);
        } else if (ele.element === "flexMenu") {
            this.updateStyleDefinitionJSON(this.renderedElementCount, ele);
            template = this.createFlexMenuTemplate(elementName, ele, trackingHtml, theme);
        } else if (ele.element === "block") {
            let actionEnabledHtml = "";
            
            if (ele.property && ele.property.action) {
                actionEnabledHtml = this.getActionEnabledProperties(ele, theme);
            }
            
            this.updateStyleDefinitionJSON(this.renderedElementCount, ele, `${actionEnabledHtml ? " slds-text-link_reset " : ""}`);
            template = this.createBlockTemplate(elementName, ele, actionEnabledHtml, theme, omniSupport, item);
        } else if (type === "customLwc") {
            let customLwcElementName = this.lwcPropertyNameConversion(`${this.nsPrefix}-customLwcWrapper`);
            let customLwcProperties = this.cloneDeep(ele.property);
            let apiVars = ["{record}", "{records}", "{recordId}", "{objectApiName}"];
            
            let keys = Object.keys(ele.property);
            keys.forEach(key => {
                let value = ele.property[key];
                
                if (typeof value === "string" && apiVars.indexOf(value) === -1 && value.indexOf("{") !== -1) {
                    delete ele.property[key];
                } else {
                    delete customLwcProperties[key];
                }
            });
            
            let propertyValue = customLwcProperties ? `'\\${JSON.stringify(customLwcProperties)}'` : "";
            this.updateStyleDefinitionJSON(this.renderedElementCount, ele);
            template = this.createCustomLwcTemplate(elementName, ele, customLwcElementName, propertyValue);
        } else {
            this.updateStyleDefinitionJSON(this.renderedElementCount, ele);
            template = this.createStandardElementTemplate(elementName, ele, trackingHtml, theme, omniSupport, item);
        }
        
        return template;
    }
    
    private generateFlyoutForTriggerActionElement(action: any, index: string, actionComponent?: string, isSingleFlyout?: boolean): string {
        let stateAction = action.stateAction;
        let customLwcElementName = this.lwcPropertyNameConversion(`${this.nsPrefix}-customLwcWrapper`);
        
        if (stateAction?.type === "Flyout" && stateAction?.flyoutType) {
            let selectedCustomLwc = {};
            
            if (stateAction.flyoutType === "customLwc") {
                selectedCustomLwc = stateAction.flyoutCustomLwcData ? 
                    stateAction.flyoutCustomLwcData : 
                    this.findLwcBundle({
                        DeveloperName: stateAction.flyoutLwc
                    });
            }
            
            let defaultNs = selectedCustomLwc ? 
                this.isInsidePackage && selectedCustomLwc.ManageableState !== "unmanaged" && selectedCustomLwc.NamespacePrefix || "c" : 
                null;
                
            if (this.isInsidePackage && this.downloadMode === this.DOWNLOAD_OFF_PLATFORM_MODE) {
                defaultNs = "c";
            }
            
            let slotName = "flyout";
            let slotControlVar = "action";
            
            if (actionComponent === "flexAction") {
                if (stateAction.openFlyoutIn === "Modal") {
                    slotName = "modalflyout";
                    slotControlVar = "modalAction";
                } else if (stateAction.openFlyoutIn === "Popover") {
                    slotName = "popoverflyout";
                    slotControlVar = "popoverAction";
                }
            }
            
            let condition = isSingleFlyout ? 
                "" : 
                `if:true={${slotControlVar}.${index}}`;
                
            return `<div slot="${slotName}" class="${index} ${stateAction.flyoutContainerClass || ""}" ${condition}>
                ${this.createFlyoutTemplate("", stateAction, customLwcElementName, defaultNs, `{${slotControlVar}.${index}}`)}
            </div>`;
        }
        
        return "";
    }

    // Helper methods for element div generation
    private createFlyoutActionTemplate(elementName: string, ele: any, trackingHtml: string, theme: string): string {
        return `<div data-style-id="${this.renderedElementCount}" class="${ele.class} ${this.getElementStyle(ele, 'class', 0)} ${this.getElementStyle(ele, 'sizeClass', 0)} ${this.getConditionalElementClass(ele)}" data-rindex={rindex} style="${this.getElementStyle(ele, 'style', 0)}" ${this.generateEachPropertyForElement(ele, "data-conditions")}>
    <${elementName} data-style-id="${this.renderedElementCount}_child" ${ele.element === 'action' ? trackingHtml : " onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} onfireactionevent={actionEvtHandler} "} ${this.generateElementProperty(ele)} theme="${theme}" ${this.preloadingConditionalElement(ele, this.renderedElementCount)}>${this.generateFlyoutActionElement(ele)}</${elementName}>
    </div>`;
    }

    private createFlexMenuTemplate(elementName: string, ele: any, trackingHtml: string, theme: string): string {
        let menuItemsArray = ele.property.menuItems;
        delete ele.property.menuItems;
        
        return `<div data-style-id="${this.renderedElementCount}" class="${ele.class} ${this.getElementStyle(ele, 'class', 0)} ${this.getElementStyle(ele, 'sizeClass', 0)} ${this.getConditionalElementClass(ele)}" data-rindex={rindex} style="${this.getElementStyle(ele, 'style', 0)}" ${this.generateEachPropertyForElement(ele, "data-conditions")}>
    <${elementName} data-style-id="${this.renderedElementCount}_child" 
    onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} ${this.generateElementProperty(ele)}
    theme="${theme}" ${this.preloadingConditionalElement(ele, this.renderedElementCount)}> 
     ${this.generateFlexMenuItems(menuItemsArray, theme, this.renderedElementCount, ele.elementLabel)}
    </${elementName}>
    </div>`;
    }

    private createBlockTemplate(elementName: string, ele: any, actionEnabledHtml: string, theme: string, omniSupport: boolean, item: CardDefinition): string {
        return `<div data-style-id="${this.renderedElementCount}" class="${ele.class} ${actionEnabledHtml ? " slds-text-link_reset " : ""} ${this.getElementStyle(ele, 'class', 0)} ${this.getElementStyle(ele, 'sizeClass', 0)} ${this.getConditionalElementClass(ele)}" data-rindex={rindex} style="${this.getElementStyle(ele, 'style', 0)}" ${this.generateEachPropertyForElement(ele, "data-conditions")}>
    <${elementName} data-style-id="${this.renderedElementCount}_child" ${this.generateElementProperty(ele)} theme="${theme}" ${this.preloadingConditionalElement(ele, this.renderedElementCount)} ${actionEnabledHtml}>${this.generateBlockDiv(ele, theme, omniSupport, item)}</${elementName}>
    </div>`;
    }

    private createCustomLwcTemplate(elementName: string, ele: any, customLwcElementName: string, propertyValue: string): string {
        return `<div data-style-id="${this.renderedElementCount}" class="${ele.class} ${this.getElementStyle(ele, 'class', 0)} ${this.getElementStyle(ele, 'sizeClass', 0)}" data-rindex={rindex} style="${this.getElementStyle(ele, 'style', 0)}" ${this.generateEachPropertyForElement(ele, "data-conditions")}>
    <${customLwcElementName} class="${this.getConditionalElementClass(ele)}" element-name="${elementName}" property=${propertyValue} data-rindex={rindex} records={records} record={record} record-id={recordId} card={card} ${this.preloadingConditionalElement(ele, this.renderedElementCount)}><${elementName}  ${this.generateElementProperty(ele)}></${elementName}></${customLwcElementName}>
    </div>`;
    }

    private createStandardElementTemplate(elementName: string, ele: any, trackingHtml: string, theme: string, omniSupport: boolean, item: CardDefinition): string {
        let template = `<div data-style-id="${this.renderedElementCount}" class="${ele.class} ${this.getElementStyle(ele, 'class', 0)} ${this.getElementStyle(ele, 'sizeClass', 0)} ${this.getConditionalElementClass(ele)}" data-rindex={rindex} style="${this.getElementStyle(ele, 'style', 0)}" ${this.generateEachPropertyForElement(ele, "data-conditions")}>`;
        
        if (this.actionWithEvents(ele)) {
            let eventStr = this.attachEventOnTemplate(ele);
            template += `<${elementName} data-style-id="${this.renderedElementCount}_child" ${trackingHtml} ${this.generateElementProperty(ele)} theme="${theme}" ${this.preloadingConditionalElement(ele, this.renderedElementCount)} ${eventStr}></${elementName}>
        </div>`;
        } else if (ele.element === "childCardPreview") {
            let osAttributes = omniSupport && this.isStateActiveHtml ? this.getOmniAttributes(ele.property.cardName) : "";
            
            template += `<${elementName} data-style-id="${this.renderedElementCount}_child" ${trackingHtml} is-inside-parent={insideParent} parent-uniquekey={uniqueKey} ${this.generateElementProperty(ele)} theme="${theme}" ${osAttributes} ${this.preloadingConditionalElement(ele, this.renderedElementCount)} onupdateparent={updateParentData}></${elementName}>
    </div>`;
        } else {
            let actionEnabledHtml = "";
            
            if (ele.property && ele.property.action) {
                actionEnabledHtml = this.getActionEnabledProperties(ele, theme);
            }
            
            // Single action
            if (this.isSingleAction(ele)) {
                template += `<${elementName} data-style-id="${this.renderedElementCount}_child" ${trackingHtml} ${this.generateElementProperty(ele)} theme="${theme}" ${actionEnabledHtml} ${this.preloadingConditionalElement(ele, this.renderedElementCount)}></${elementName}>
        </div>`;
            } else if (this.isFlexAction(ele)) {
                // Flex action
                if (elementName.indexOf('flex-action') === -1) {
                    elementName = elementName.replace('action', 'flex-action');
                }
                
                if (!ele.property.actionList) {
                    ele.property.actionList = ele.property?.stateAction ? [ele.property] : [];
                }
                
                const showSpinner = this.escapeField(ele.property.showSpinner || 'false');
                delete ele.property.showSpinner;
                
                template += `<${elementName} data-style-id="${this.renderedElementCount}_child" ${trackingHtml} class= "${this.renderedElementCount}_child flexActionElement" 
        data-action-element-class="${this.renderedElementCount}_child" data-action-key="${this.renderedElementCount}" onexecuteaction={performAction} data-show-spinner=${showSpinner}
        data-element-label="${this.getElementLabel(ele)}"  ${this.generateElementProperty(ele)} theme="${theme}" ${actionEnabledHtml} ${this.preloadingConditionalElement(ele, this.renderedElementCount)}>${this.generateFlexActionTemplate(ele)}</${elementName}>
      </div>`;
            } else if (ele.element === "flexToggle" && typeof ele.property.updateDS !== "undefined") {
                // Flex toggle
                let updateDS = ele.property.updateDS;
                let key = ele.property.type === "checkbox" || ele.property.type === "button" ? "value" : "checked";
                let fieldName = ele.property[key]?.match(/\{([a-zA-Z.0-9_]*)\}/g) 
                    ? ele.property[key].substring(1).replace(/[{}]/g, '') 
                    : '';
                    
                delete ele.property.updateDS;
                
                template += `<${elementName} data-style-id="${this.renderedElementCount}_child" ${this.generateElementProperty(ele)} theme="${theme}" ${updateDS && fieldName ? (!actionEnabledHtml ? 'onchange={setValueOnToggle} ' : 'data-onchange=\'setValue\' ') + 'data-fieldname=\'' + fieldName + '\'' : ''} ${actionEnabledHtml} ${this.preloadingConditionalElement(ele, this.renderedElementCount)}></${elementName}>
      </div>`;
            } else {
                // Other elements
                template += `<${elementName} data-style-id="${this.renderedElementCount}_child" ${ele.element === 'flexImg' && !ele.property.card ? 'card={card}' : ''} ${this.generateElementProperty(ele)} theme="${theme}" ${actionEnabledHtml} ${this.preloadingConditionalElement(ele, this.renderedElementCount)}></${elementName}>
      </div>`;
            }
        }
        
        return template;
    }

    private createFlyoutTemplate(Id: string, action: any, customLwcElementName: string, defaultNs: string | null, listenerAction?: string): string {
        const isOsFlyout = action.flyoutType === "OmniScripts";
        const lwcname = action.flyoutLwc;
        const cmpName = defaultNs ? `${defaultNs}-${lwcname}` : lwcname;
        const elementName = this.lwcPropertyNameConversion(cmpName);
        let template = "";
        
        if (action.flyoutType === "childCard") {
            const childLwcname = this.convertNameToValidLWCCase("cf-" + action.flyoutLwc);
            const childElementName = this.lwcPropertyNameConversion(`${defaultNs}-${childLwcname}`);
            
            action.property = { ...action.flyoutParams } || {};
            const parentAttribute = { ...action.property };
            const property: Record<string, string> = {};
            
            property.recordId = "{recordId}";
            property.objectApiName = "{objectApiName}";
            property.parentAttribute = parentAttribute;
            property.parentMergefields = "{card}";
            
            if (action.cardNode) {
                property.cardNode = action.cardNode;
            }
            
            property.parentRecord = "{record}";
            property.records = "{_records}";
            action.property = { ...property };
            
            template = `<${childElementName} data-style-id="${this.renderedElementCount}_child" ${this.generateElementProperty(action)} ${Id ? "style='display:none' data-id=" + Id : ""}></${childElementName}>`;
            
            return template;
        }
        
        action.property = action.flyoutParams ? { ...action.flyoutParams } : {};
        let customLwcProperties = this.cloneDeep(action.property);
        let propertyValue = action.flyoutParams ? `'\\${JSON.stringify(action.flyoutParams)}'` : "";
        
        if (isOsFlyout) {
            const prefillObj = {
                omniscriptEmbeddedSource: "flyout"
            };
            
            if (action.flyoutParams) {
                Object.assign(prefillObj, action.flyoutParams);
            }
            
            propertyValue = `'\\${JSON.stringify({
                prefill: JSON.stringify(prefillObj)
            })}'`;
        } else {
            const apiVars = ["{record}", "{records}", "{recordId}", "{objectApiName}"];
            const keys = Object.keys(action.property);
            
            keys.forEach(key => {
                const value = action.property[key];
                
                if (apiVars.indexOf(value) === -1 && value.indexOf("{") !== -1) {
                    delete action.property[key];
                } else {
                    delete customLwcProperties[key];
                }
            });
            
            propertyValue = customLwcProperties ? `'\\${JSON.stringify(customLwcProperties)}'` : "";
        }
        
        template = `<${elementName} ${isOsFlyout ? `layout='${action.layoutType}'` : ""} ${Id ? "style='display:none' data-id=" + Id : ""} ${propertyValue && !isOsFlyout ? " " + this.generateElementProperty(action) : ""}></${elementName}>`;
        
        if (propertyValue) {
            template = `<${customLwcElementName} element-name="${elementName}" property=${propertyValue} records={records} record-id={recordId} record={record} card={card} ${listenerAction ? `action=${listenerAction}` : ""}>
                ${template}
            </${customLwcElementName}>`;
        }
        
        return template;
    }

    // Action helper methods
    private isSingleAction(ele: any): boolean {
        return ele.element === 'action' && ele.property && !ele.property.actionList;
    }

    private isFlexAction(ele: any): boolean {
        return ele.element === 'action' && ele.property?.actionList?.length;
    }

    private actionWithEvents(ele: any): boolean {
        const type = this.getActionType(ele);
        return type === 'cardAction' || type === 'updateOmniScript' || type === 'DataAction';
    }

    private getActionType(ele: any): string {
        return this.isSingleAction(ele) && ele.property.stateAction ? ele.property.stateAction.type : '';
    }

    private attachEventOnTemplate(ele: any): string {
        const type = this.getActionType(ele);
        let eventStr = '';
        
        switch (type) {
            case 'cardAction':
                eventStr = ' onselectcards={updateSelectedCards} onsetvalue={updateAction} ';
                break;
            case 'updateOmniScript':
                eventStr = ' onupdateos={updateOmniscript} ';
                break;
            case 'DataAction':
                eventStr = ' onfireactionevent={actionEvtHandler} ';
                break;
        }
        
        return eventStr;
    }

    private getElementLabel(ele: any): string {
        return ele.elementLabel?.replace(/[\s-/]/gi, '').toLowerCase() || '';
    }

    private getConditionalElementClass(element: any): string {
        if (element.property && element.property['data-conditions']) {
            return 'condition-element';
        }
        return '';
    }

    private getOmniAttributes(cardName: string): string {
        // Placeholder - this would typically check for Omni support in the child card
        return ` omni-json-def={omniJsonDef} omni-script-header-def={omniScriptHeaderDef} omni-custom-state={omniCustomState} omni-json-data={omniJsonData} ${this.isRepeatable ? "omni-support-key={record._flex.uniqueKey}" : ""} `;
    }

    private generateFlexMenuItems(menuItems: any[], theme: string, renderedElementCount: string, flexMenuElementLabel: string): string {
        // Placeholder - this would generate menu items HTML
        return '';
    }

    private preloadingConditionalElement(element: any, identifier: string): string {
        if (this.isRepeatable && this.isStateActiveHtml && 
            element?.property?.hasOwnProperty('data-preloadConditionalElement') && 
            !element.property['data-preloadConditionalElement']) {
            return `if:true={record._flex.${identifier}_child}`;
        }
        return '';
    }

    private generateElementProperty(element: any): string {
        return `${this.sortParameterBasedOnDependency(
            Object.keys(element.property || {}).map(key => this.generateEachPropertyForElement(element, key)), 
            element.element || element.flyoutType
        ).join('')}`;
    }

    private generateEachPropertyForElement(element: any, key: string): string {
        if (!element.property?.hasOwnProperty(key)) {
            return '';
        }
        
        let value = element.property[key];
        let val = `"${value}"`;
        const hasDQuote = /".*?"/g;
        const hasHtmlTag = /<\/?[a-z][\s\S]*>/g;
        
        if (typeof value === 'string' && value.charAt(0) === '{' && value.charAt(value.length - 1) === '}') {
            val = value;
        } else if (typeof value === 'object' || Array.isArray(value)) {
            const propertyValue = JSON.stringify(value).replace(/'/g, '&#39;');
            val = `'\\${propertyValue}'`;
        } else if (hasDQuote.test(value) || hasHtmlTag.test(value)) {
            val = `'${value}'`;
        }

        // Special cases for different elements
        if (element.element === 'outputField' && 
            ['label', 'placeholder', 'fieldName', 'fieldLevelHelp'].includes(key) && 
            typeof value === 'string' && value.indexOf('{') !== -1) {
            val = `"\\${value}"`;
        }
        
        if (element.element === 'block' && key === 'label' && 
            typeof value === 'string' && value.indexOf('{') !== -1 && 
            value.indexOf('\\') === -1) {
            val = `"\\${value}"`;
        }
        
        if ((element.element === 'childCardPreview' || element.flyoutType === 'childCard') && 
            key === 'cardNode' && typeof value === 'string') {
            if (value.indexOf('{') !== -1) {
                val = `"\\${value}"`;
            } else if (value.indexOf('{') === -1) {
                key = 'parentData';
                val = '{_dataNode}';
            }
        }
        
        // For FlexChart escape mergefield for title
        if (element.element === 'flexChart' && key === 'title' && 
            value.startsWith('{') && value.indexOf('{') !== -1 && 
            value.indexOf('\\') === -1) {
            val = `"\\${value}"`;
        }
        
        // Handle boolean attributes
        const isBoolean = value === 'true' || value === true || value === 'false' || value === false;
        if (isBoolean && ['disabled', 'required', 'checked'].includes(key)) {
            return value === 'true' || value === true ? ` ${key} ` : '';
        }
        
        return ` ${this.lwcPropertyNameConversion(key)}=${val} `;
    }

    private sortParameterBasedOnDependency(parametersArray: string[], type: string): string[] {
        // Sort parameters so record, card, recordId, and _records come first
        parametersArray.sort(param => {
            if (param.indexOf('={record}') !== -1 || param.indexOf('={card}') !== -1 || 
                param.indexOf('={recordId}') !== -1 || param.indexOf('={_records}') !== -1) {
                return -1;
            }
            return 1;
        });
        
        if (type === 'childCardPreview' || type === 'childCard') {
            // Move card-node or parent-data to the front if it exists
            for (let i = 0; i < parametersArray.length; ++i) {
                if (parametersArray[i].indexOf('card-node=') !== -1 || parametersArray[i].indexOf('parent-data=') !== -1) {
                    parametersArray.unshift(parametersArray.splice(i, 1)[0]);
                    break;
                }
            }
            
            // Ensure parent-record comes right after records if both exist
            const indexOfRecords = parametersArray.indexOf(' records={_records} ');
            const indexOfParentRecord = parametersArray.indexOf(' parent-record={record} ');
            
            if (indexOfRecords > -1 && indexOfParentRecord > -1 && indexOfRecords < indexOfParentRecord) {
                const parentRecord = parametersArray.splice(indexOfParentRecord, 1)[0];
                parametersArray.splice(indexOfRecords + 1, 0, parentRecord);
            }
        }
        
        return parametersArray;
    }

    private escapeField(value: string): string {
        if (typeof value === 'string' && value.indexOf('{') !== -1 && value.indexOf('\\') === -1) {
            return `"\\${value}"`;
        }
        return `"${value}"`;
    }

    private generateFlyoutActionElement(element: any): string {
        const action = this.isSingleAction(element) ? { ...element.property.stateAction } : {};
        let selectedCustomLwc = {};
        
        if (action.flyoutType === 'customLwc') {
            selectedCustomLwc = action.flyoutCustomLwcData ? 
                action.flyoutCustomLwcData : 
                this.findLwcBundle({
                    DeveloperName: action.flyoutLwc
                });
        }
        
        const defaultNs = selectedCustomLwc ? 
            this.isInsidePackage && selectedCustomLwc.ManageableState !== 'unmanaged' && selectedCustomLwc.NamespacePrefix || 'c' : 
            null;
            
        const customLwcElementName = this.lwcPropertyNameConversion(`${this.nsPrefix}-customLwcWrapper`);
        
        return `<div slot="flyout">${this.createFlyoutTemplate('', action, customLwcElementName, defaultNs)}</div>`;
    }

    private generateFlexActionTemplate(ele: any): string {
        let flyoutSlots = '';
        const elementLabel = this.getElementLabel(ele);
        
        if (ele?.property?.actionList) {
            const actionList = [...ele.property.actionList];
            const isSingleFlyout = this.isSingleFlyoutActionList(actionList);
            
            actionList.forEach((action, actionIndex) => {
                const actionFlyoutIndex = elementLabel + 'action' + actionIndex;
                flyoutSlots += this.generateFlyoutForTriggerActionElement(action, actionFlyoutIndex, 'flexAction', isSingleFlyout);
            });
        }
        
        return flyoutSlots;
    }

    private isSingleFlyoutActionList(actionList: any[]): boolean {
        return actionList.length === 1 && actionList[0].stateAction?.type === 'Flyout';
    }

    private getActionEnabledProperties(ele: any, theme: string): string {
        let actionEnabledHtml = '';
        
        if (ele.property && ele.property.action) {
            const action = ele.property.action;
            const actionType = action.type;
            
            if (actionType === 'Flyout') {
                actionEnabledHtml = ` data-action-enabled="true" data-action-type="Flyout" data-action-key="${this.renderedElementCount}" data-action-element-class="${this.renderedElementCount}_child" data-action-element-label="${this.getElementLabel(ele)}" data-action-theme="${theme}" `;
            } else if (actionType === 'Event') {
                actionEnabledHtml = ` data-action-enabled="true" data-action-type="Event" data-action-key="${this.renderedElementCount}" data-action-element-class="${this.renderedElementCount}_child" data-action-element-label="${this.getElementLabel(ele)}" data-action-theme="${theme}" `;
            } else if (actionType === 'DataAction') {
                actionEnabledHtml = ` data-action-enabled="true" data-action-type="DataAction" data-action-key="${this.renderedElementCount}" data-action-element-class="${this.renderedElementCount}_child" data-action-element-label="${this.getElementLabel(ele)}" data-action-theme="${theme}" `;
            }
        }
        
        return actionEnabledHtml;
    }

    private updateStyleDefinitionJSON(renderedElementCount: string, ele: any, additionalClass?: string): void {
        if (!this.styleDefinition[renderedElementCount]) {
            this.styleDefinition[renderedElementCount] = {};
        }
        
        if (ele.styleObject) {
            this.styleDefinition[renderedElementCount].styleObject = ele.styleObject;
        }
        
        if (ele.class) {
            this.styleDefinition[renderedElementCount].class = ele.class + (additionalClass || '');
        }
        
        if (ele.sizeClass) {
            this.styleDefinition[renderedElementCount].sizeClass = ele.sizeClass;
        }
    }

    private cloneDeep<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    private generateCardJs(
        lwcComponentName: string,
        theme: string,
        customLabels: Record<string, string>,
        cardDef: any,
        cardRecordId: string,
        customCssAttachmentId?: string
    ): string {
        const eventConfig = this.generateEventListenerAction(cardDef);
        const eventListener = eventConfig.register;
        const removeEventListeners = eventConfig.unregister;
        
        const omniSupport = cardDef?.osSupport;
        const multilanguageSupport = cardDef?.multilanguageSupport;
        const listenToWidthResize = cardDef?.listenToWidthResize;
        const globalCSS = cardDef?.globalCSS;
        const sessionVars = cardDef?.sessionVars;
        const styleSheet = cardDef?.customStyleSheet;
        
        const customStyleSheetPath = theme === 'nds' 
            ? '/assets/styles/vlocity-newport-design-system.min.css' 
            : '/assets/styles/salesforce-lightning-design-system-vf.min.css';

        const extendingMixins = omniSupport 
            ? `FlexCardMixin(OmniscriptBaseMixin(LightningElement))` 
            : `FlexCardMixin(LightningElement)`;

        return `import { FlexCardMixin } from "${this.nsPrefix}/flexCardMixin";
    import { CurrentPageReference } from 'lightning/navigation';
    import {interpolateWithRegex, interpolateKeyValue, loadCssFromStaticResource } from "${this.nsPrefix}/flexCardUtility";
    ${theme === 'nds' ? `import { load } from "${this.nsPrefix}/newportLoader";` : ''}
    import { LightningElement, api, track, wire } from "lwc";
    import pubsub from "${this.nsPrefix}/pubsub";
    import { getRecord } from "lightning/uiRecordApi";
    ${omniSupport ? `import { OmniscriptBaseMixin } from "${this.nsPrefix}/omniscriptBaseMixin";` : ''}
    import data from "./definition";
    import styleDef from "./styleDefinition";

    export default class ${lwcComponentName} extends ${extendingMixins} {
        currentPageReference;        
        @wire(CurrentPageReference)
        setCurrentPageReference(currentPageReference) {
            this.currentPageReference = currentPageReference;
        }
        @api debug;
        @api recordId;
        @api objectApiName;
        ${omniSupport ? `@track _omniSupportKey = '${lwcComponentName}';
            @api get omniSupportKey() {
                return this._omniSupportKey;
            }
            set omniSupportKey(parentRecordKey) {
                this._omniSupportKey = this._omniSupportKey  + '_' + parentRecordKey;
            }` : ''}
        @track record;
        ${sessionVars ? this.generateApiVariables(sessionVars) : ''}
        ${this.getCustomLabelTrackVariable(customLabels)}
        pubsubEvent = [];
        customEvent = [];
        
        connectedCallback() {
            super.connectedCallback();
            this.setThemeClass(data);
            this.setStyleDefinition(styleDef);
            data.Session = {} //reinitialize on reload
            ${styleSheet ? `
                loadCssFromStaticResource(this, "${styleSheet}", "${customStyleSheetPath}").then(() => {
                    this.setDefinition(data);
                    this.registerEvents();
                }).catch(() => {
                    this.setDefinition(data);
                    this.registerEvents();
                });` : ''}
            ${listenToWidthResize ? `this.flexiPageWidthAwareCB = this.flexiPageWidthAware.bind(this);
                window.addEventListener('resize', this.flexiPageWidthAwareCB);` : ''}
            ${customLabels && Object.keys(customLabels).length > 0 ? `this.customLabels = this.Label;
                ${multilanguageSupport ? `this.fetchUpdatedCustomLabels();` : ''}` : ''}
            ${theme !== 'nds' && !styleSheet ? 'this.setDefinition(data);\n this.registerEvents();' : ''}
            ${globalCSS && customCssAttachmentId ? `this.setAttribute(
                "class", (this.getAttribute("class") ? this.getAttribute("class") : "") + " card-${cardRecordId}"
            );
            this.loadCustomStylesheetAttachement("${customCssAttachmentId}");` : ''}
            ${theme === 'nds' && !styleSheet ? `
            load(this)
            .then(() => {
                this.setDefinition(data);
                this.registerEvents();
                this.isProcessing = false;
            })
            .catch(() => {
                this.setDefinition(data);
                this.registerEvents();
            });` : ''}
        }
        
        disconnectedCallback(){
            super.disconnectedCallback();
            ${omniSupport ? 'this.omniSaveState(this.records,this.omniSupportKey,true);' : ''}
            ${listenToWidthResize ? 'window.removeEventListener("resize", this.flexiPageWidthAwareCB);' : ''}
            this.unregisterEvents();
        }

        registerEvents() {
            ${eventListener}
        }

        unregisterEvents(){
            ${removeEventListeners}
        }
        
        renderedCallback() {
            super.renderedCallback();
            ${listenToWidthResize ? `
            if(!this.containerWidthInitialised) {
                this.containerWidthInitialised = true;
                this.flexiPageWidthAware();
            }` : ''}
        }
    }`;
    }

    private generateCssSource(item: CardDefinition): string {
        if (typeof item.StylingConfiguration === 'string') {
            const parsedStyle = JSON.parse(item.StylingConfiguration);
            return parsedStyle.customStyles || '/*Custom Styles*/';
        }
        return item.StylingConfiguration?.customStyles || '/*Custom Styles*/';
    }

    private generateDefinition(item: CardDefinition): string {
        let definition = item.PropertySetConfig;
        if (typeof definition === 'string') {
            definition = JSON.parse(definition);
        }

        if (definition?.dataSource?.contextVariables?.length > 0) {
            definition.dataSource.contextVariables = [];
        }

        // Add Name and UniqueKey
        definition.Name = item.Name;
        const uniqueKey = item.UniqueName || (item.IsActive ? item.Name : `${item.Name}_${item.VersionNumber}_${item.AuthorName}`);
        definition.uniqueKey = uniqueKey;
        definition.Id = item.Id;

        // Remove unwanted properties
        const definitionStr = JSON.stringify(
            // Omit xmlObject and xmlJson from the definition
            this.omitProperties(definition, ['xmlObject', 'xmlJson'])
        );

        return `let definition = ${definitionStr};\nexport default definition`;
    }

    private omitProperties(obj: any, keys: string[]): any {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    }

    private generateStyleDefinition(): string {
        return `let styleDefinition = ${JSON.stringify(this.styleDefinition)};\nexport default styleDefinition`;
    }

    private pushGeneratedFiles(files: LwcFile[], lwcComponentName: string, sources: any): void {
        const { jsSource, defSource, htmlSource, cssSource, styleDefSource, xmlSource } = sources;

        const baseFiles: LwcFile[] = [
            {
                name: `${lwcComponentName}.js`,
                source: jsSource,
                filepath: `lwc/${lwcComponentName}/${lwcComponentName}.js`,
                format: 'js'
            },
            {
                name: `${lwcComponentName}.html`,
                source: htmlSource,
                filepath: `lwc/${lwcComponentName}/${lwcComponentName}.html`,
                format: 'html'
            },
            {
                name: `${lwcComponentName}.css`,
                source: cssSource,
                filepath: `lwc/${lwcComponentName}/${lwcComponentName}.css`,
                format: 'css'
            },
            {
                name: `${lwcComponentName}.js-meta.xml`,
                source: xmlSource,
                filepath: `lwc/${lwcComponentName}/${lwcComponentName}.js-meta.xml`,
                format: 'xml'
            }
        ];

        files.push(...baseFiles);

        if (defSource) {
            files.push({
                name: 'definition.js',
                source: defSource,
                filepath: `lwc/${lwcComponentName}/definition.js`,
                format: 'js'
            });
        }

        if (styleDefSource) {
            files.push({
                name: 'styleDefinition.js',
                source: styleDefSource,
                filepath: `lwc/${lwcComponentName}/styleDefinition.js`,
                format: 'js'
            });
        }
    }

    private makeStandardRuntimeProperty(name: string): string {
        return `@api get ${name}() {
            return this.runtimeWrapper?.getExposedAttribute("${name}");
        }
        set ${name}(val) {
            this.runtimeWrapper?.updateExposedAttributes("${name}", val);
        };`;
    }

    private generateStandardRuntimeWrapperJs(lwcComponentName: string, cardDef: any): string {
        return `import { LightningElement, api } from "lwc";
export default class ${lwcComponentName} extends LightningElement {
    ${this.FLEXCARD_COMMON_PROPS.map(prop => `@api ${prop};`).join('\n\t')}
    ${cardDef?.sessionVars ? cardDef?.sessionVars
        .filter(session => session.isApi)
        .map(session => this.makeStandardRuntimeProperty('cf' + session.name))
        .join('\n\n') : ''}
    ${cardDef?.osSupport ? this.FLEXCARD_OS_SUPPORT_PROPS.map(prop => `@api ${prop};`).join('\n\t') : ''}
    ${cardDef?.osSupport ? `
    @api checkValidity() {
        return this.runtimeWrapper?.checkValidity();
    }
    @api reportValidity() {
        return this.runtimeWrapper?.reportValidity();
    }
    ` : ''}
    get runtimeWrapper() {
        return this.template.querySelector('${this.nsPrefix}-flex-card-standard-runtime-wrapper');
    }
}`;
    }

    private generateStandardRuntimeWrapperHtml(flexCardName: string, cardDef: any): string {
        return `<template>
    <${this.nsPrefix}-flex-card-standard-runtime-wrapper flexcard-name="${flexCardName}"
        ${this.FLEXCARD_COMMON_PROPS
            .map(prop => `${this.lwcPropertyNameConversion(prop)}={${prop}}`)
            .join('\n\t')}
        ${cardDef?.osSupport ? this.FLEXCARD_OS_SUPPORT_PROPS
            .map(prop => `${this.lwcPropertyNameConversion(prop)}={${prop}}`)
            .join('\n\t') : ''}>
    </${this.nsPrefix}-flex-card-standard-runtime-wrapper>
</template>`;
    }

    private generateJsMetaXML(lwcComponentName: string, cardObj: CardDefinition, metaObject?: MetaConfig): string {
        const isActive = cardObj.IsActive;
        const isChildCard = cardObj.IsChildCard || (cardObj.Type && cardObj.Type.toLowerCase() === 'child');

        let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${isActive ? metaObject?.apiVersion || this.defaultXmlConfig.api : this.defaultXmlConfig.api}</apiVersion>
    <isExposed>true</isExposed>
    <masterLabel>${isActive ? metaObject?.masterLabel || cardObj.Name : lwcComponentName}</masterLabel>`;

        if (metaObject?.description) {
            xmlStr += `\n    <description>${metaObject.description}</description>`;
        }

        if (this.isInsidePackage) {
            xmlStr += `\n    <runtimeNamespace>${this.nsPrefix}</runtimeNamespace>`;
        }

        if (isActive) {
            let targetStr = '';
            if (metaObject?.targets?.target?.length) {
                targetStr = `\n    <targets>`;
                metaObject.targets.target.forEach(target => {
                    targetStr += `\n        <target>${target}</target>`;
                });
                targetStr += `\n    </targets>`;
            } else if (!isChildCard) {
                targetStr = `\n    <targets>`;
                this.defaultXmlConfig.targets.forEach(target => {
                    targetStr += `\n        <target>${target}</target>`;
                });
                targetStr += `\n    </targets>`;
            }

            xmlStr += targetStr;
            if (targetStr !== '') {
                xmlStr += this.getTargetConfigByTarget(metaObject, targetStr);
            }
        }

        xmlStr += '\n</LightningComponentBundle>';
        return xmlStr;
    }

    private getTargetConfigByTarget(metaObject: MetaConfig | undefined, targetStr: string): string {
        let targetConfigsStr = '';
        let targetConfig = '';

        if (metaObject?.targetConfigs) {
            targetConfigsStr = `\n    <targetConfigs>
        ${atob(metaObject.targetConfigs)}
    </targetConfigs>`;
        } else {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(targetStr, 'text/xml');
            const targetElements = Array.from(xmlDoc.querySelectorAll('target'));
            
            targetElements.forEach(target => {
                if (target.textContent === 'lightning__AppPage') {
                    targetConfig += this.defaultXmlConfig.appPageConfig;
                }
                if (target.textContent === 'lightning__RecordPage') {
                    targetConfig += this.defaultXmlConfig.recordPageConfig;
                }
            });

            if (targetConfig) {
                targetConfigsStr = `\n    <targetConfigs>
        ${targetConfig}
    </targetConfigs>`;
            }
        }

        return targetConfigsStr;
    }

    private lwcPropertyNameConversion(propName: string): string {
        return propName.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    private generateEventListenerAction(cardDef: any): { register: string; unregister: string } {
        let pubSubRegisterConfig = '';
        let pubSubUnregisterConfig = '';
        let customEvents: Array<Record<string, string>> = [];

        if (cardDef.events) {
            let groupEvents: Record<string, string[]> = {};
            
            cardDef.events.forEach((eve: any, index: number) => {
                const channelName = this.getDynamicChannelName(eve.channelname);
                
                if (eve.eventtype === 'pubsub') {
                    if (!groupEvents[channelName]) {
                        groupEvents[channelName] = [];
                    }
                    
                    groupEvents[channelName].push(
                        `[interpolateWithRegex(\`${eve.eventname}\`,this._allMergeFields,this._regexPattern,"noparse")]: ` +
                        `this.handleEventAction.bind(this, data.events[${index}],${index})`
                    );
                } else if (eve.eventtype === 'event') {
                    customEvents.push({
                        [eve.eventname]: `this.handleEventAction.bind(this, data.events[${index}],${index})`
                    });
                }
            });

            Object.keys(groupEvents).forEach((key, index) => {
                pubSubRegisterConfig += `
                this.${this.pubsubEventVarPrefix}[${index}] = {
                    ${groupEvents[key].join(',\n')}
                };
                this.pubsubChannel${index} = interpolateWithRegex(\`${key}\`,this._allMergeFields,this._regexPattern,"noparse");
                pubsub.register(this.pubsubChannel${index},this.${this.pubsubEventVarPrefix}[${index}]);\n`;
                
                pubSubUnregisterConfig += `pubsub.unregister(this.pubsubChannel${index},this.${this.pubsubEventVarPrefix}[${index}]);\n`;
            });

            if (customEvents.length > 0) {
                customEvents.forEach((eve, index) => {
                    Object.keys(eve).forEach(cusEve => {
                        pubSubRegisterConfig += `
                        this.customEventName${index} = interpolateWithRegex(\`${cusEve}\`,this._allMergeFields,this._regexPattern,"noparse");
                        this.${this.customEventVarPrefix}[${index}] = ${eve[cusEve]};
                        this.template.addEventListener(this.customEventName${index},this.${this.customEventVarPrefix}[${index}]);\n`;
                        
                        pubSubUnregisterConfig += `
                        this.template.removeEventListener(this.customEventName${index},this.${this.customEventVarPrefix}[${index}]);\n`;
                    });
                });
            }
        }

        return {
            register: pubSubRegisterConfig,
            unregister: pubSubUnregisterConfig
        };
    }

    private getDynamicChannelName(name: string): string {
        const regex = /\{([a-zA-Z.0-9_[\]]*)\}/g;
        return name.replace(regex, (match, exp) => {
            if (exp && exp === 'recordId') {
                return '${this.recordId}';
            }
            return match;
        });
    }

    private generateApiVariables(sessionVars: any[]): string {
        let sessionHandler = '@track _sessionApiVars = {};';
        const exposedAPIPrefix = 'cf';
        
        sessionVars.forEach(session => {
            if (session.isApi) {
                sessionHandler += `
                @api set ${exposedAPIPrefix}${session.name}(val) {
                    if(typeof val !== "undefined") {
                        this._sessionApiVars["${session.name}"] = val;
                    }
                } 
                get ${exposedAPIPrefix}${session.name}() {
                    return this._sessionApiVars["${session.name}"] || "${session.val}";
                }`;
            }
        });
        
        return sessionHandler;
    }

    private getCustomLabelTrackVariable(customLabels?: Record<string, any>): string {
        if (!customLabels || Object.keys(customLabels).length === 0) {
            return '';
        }
        
        let variableString = '@track Label={';
        Object.keys(customLabels).forEach((key, index) => {
            if (typeof customLabels[key] !== 'string') {
                variableString += `${key}:{`;
                const nsPrefixLabel = customLabels[key];
                
                Object.keys(nsPrefixLabel).forEach((item, ind) => {
                    variableString += `${item}:"${nsPrefixLabel[item]}"${
                        Object.keys(nsPrefixLabel).length - 1 === ind ? '' : ','
                    }`;
                });
                
                variableString += `}${Object.keys(customLabels).length - 1 === index ? '' : ','}`;
            } else {
                variableString += `${key}:"${customLabels[key]}"${
                    Object.keys(customLabels).length - 1 === index ? '' : ','
                }`;
            }
        });
        
        variableString += '};';
        return variableString;
    }

    private getDevNamefromCardname(cardName: string): string {
        const name = this.downloadMode === this.DOWNLOAD_OFF_PLATFORM_MODE ? cardName : this.lwcPrefix + "-" + cardName;
        return this.convertNameToValidLWCCase(name);
    }

    private convertNameToValidLWCCase(str: string): string {
        return str.replace(/\s(.)/g, function(a) {
            return a.toUpperCase();
        }).replace(/\s/g, "")
        .replace(/^(.)/, function(b) {
            return b.toLowerCase();
        })
        .replace(/-(\w)/g, m => m[1].toUpperCase())
        .replace(/__/g, "_");
    }

    private getCardObjectFields(item: CardDefinition): Record<string, string> {
        // This is a simplified implementation - in a real scenario, 
        // we'd likely use a more sophisticated approach from flexCardUtility
        return {
            Name: 'Name',
            Id: 'Id',
            AuthorName: 'AuthorName',
            VersionNumber: 'VersionNumber',
            IsActive: 'IsActive',
            IsChildCard: 'IsChildCard',
            Type: 'Type',
            PropertySetConfig: 'PropertySetConfig',
            StylingConfiguration: 'StylingConfiguration',
            OmniUiCardKey: 'OmniUiCardKey',
            SampleDataSourceResponse: 'SampleDataSourceResponse',
            Description: 'Description',
            CardType: 'CardType'
        };
    }

    private generateBlockDiv(element: any, theme: string, omniSupport: boolean, item: CardDefinition): string {
        let renderedElementBlockCount = this.renderedElementCount;
        return `<div class="${theme}-grid ${theme}-wrap">
          ${element.children.map((child: any, blockElementIndex: number) => {
            this.renderedElementCount = renderedElementBlockCount + "block_element" + blockElementIndex;
            if (child.element === "customLwc") {
                let ele = this.cloneDeep(child);
                ele.element = ele.property && ele.property.customlwcname ? ele.property.customlwcname : ele.element;
                if (ele.property && ele.property.customlwcname) delete ele.property.customlwcname;
                return this.generateElementDiv(ele, theme, "customLwc", omniSupport, item);
            }
            return this.generateElementDiv(child, theme, "", omniSupport, item);
        }).join("")}
        </div>`;
    }
}
