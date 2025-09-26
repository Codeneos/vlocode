/* eslint-disable */
import { LightningComponentBundle } from "@vlocode/salesforce";
import { deepClone, XML } from "@vlocode/util";

namespace lodash {
    export function cloneDeep<T>(obj: T): T {
        return deepClone(obj);
    }
    export function filter<T>(collection: T[], criteria: object): T[] {
        return collection.filter(item => {
            return Object.keys(criteria).every(key => {
                return item[key] === criteria[key];
            });
        });
    }
    export function find<T>(collection: T[], criteria: object): T {
        return filter(collection, criteria)[0];
    }
    export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
        const result = deepClone(obj);
        keys.forEach(key => delete result[key]);
        return result;
    }
}

namespace utility {
    export function lwcPropertyNameConversion(name: string): string {
        return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
}

namespace window {
    export function atob(name: string): string {
        return Buffer.from(name, 'base64').toString('binary');
    }
}

export interface FlexCardDesignerOptions { 
    allLwcBundles?: LightningComponentBundle[]; 
    childCards?: any[]; 
    nsPrefix?: string; 
    lwcPrefix?: string; 
    isInsidePackge?: boolean; 
    isStdRuntime?: boolean; 
    offPlatform?: boolean;
    apiVersion?: number;
}

export namespace FlexCardDesigner {
    export let lwcPrefix = "cf";
    let allLwcBundles: LightningComponentBundle[] = [];
    let childCards: any[] = [];
    let nsPrefix = "c";
    let isInsidePackge = true;
    let isStdRuntime = false;
    const exposedAPIPrefix = "cf";
    let renderedElementCount = "";
    let styleDefinition = {};
    const DOWNLOAD_OFF_PLATFORM_MODE = "downloadoffplatform";
    let downloadMode = "";
    const defaultXmlConfig = {
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
        targets: ["lightning__RecordPage", "lightning__AppPage", "lightning__HomePage"],
        api: 56
    };
    const pubsubEventVarPrefx = "pubsubEvent";
    const customEventVarPrefx = "customEvent";
    let isRepeatable = true;
    let isStateActiveHtml = true;
    const requiredPermissionsError = "Required Permissions are missing";

    let actionElementsSlotObject = {};

    export function configure(options: FlexCardDesignerOptions) {
        allLwcBundles = options.allLwcBundles ?? allLwcBundles;
        childCards = options.childCards ?? childCards;
        nsPrefix = options.nsPrefix ?? nsPrefix;
        lwcPrefix = options.lwcPrefix ?? lwcPrefix;
        isInsidePackge = options.isInsidePackge ?? isInsidePackge;
        isStdRuntime = options.isStdRuntime ?? isStdRuntime;
        downloadMode = options.offPlatform ? DOWNLOAD_OFF_PLATFORM_MODE : "";
        defaultXmlConfig.api = options.apiVersion ?? defaultXmlConfig.api;
    }

    //HTML
    function generateStateHtml(cardDef, index, theme, isactive, item) {
        let omniSupport = cardDef && cardDef.osSupport;
        let state = cardDef.states[index];
        isRepeatable = cardDef.isRepeatable || typeof cardDef.isRepeatable === "undefined";
        isStateActiveHtml = isactive;
        let stateObj = isRepeatable ? "record={record}" : "";
        if (state) {
            let elements = state.components && state.components["layer-0"].children;
            if (elements) {
                let stateTrackingHtml = ` tracking-obj={_childCardTrackingObj} `;
                renderedElementCount = "";
                return `<${nsPrefix}-flex-card-state ${isactive && isRepeatable ? "if:true={record}  key={record._flex.uniqueKey} data-recordid={record.Id}" : ""} ${stateObj} data-statue="${isactive}"  data-index="${index}" data-rindex={rindex} class="cf-vlocity-state-${index} cf-vlocity-state ${getElementStyle(
                    //Hardcoding styles for state as they dont support runtime styling
                    state, "sizeClass")}" ${stateTrackingHtml}>
        <div if:true={cardLoaded} class="${theme}-grid ${theme}-wrap ${getElementStyle(
                        //Hardcoding styles for state as they dont support runtime styling
                        state, "class")}" style="${getElementStyle(state, "style")}">
            ${elements.map((element, elementIndex) => {
                            renderedElementCount = "state" + index + "element" + elementIndex;
                            if (element.element === "customLwc") {
                                let ele = lodash.cloneDeep(element);
                                ele.element = ele.property && ele.property.customlwcname ? ele.property.customlwcname : ele.element;
                                if (ele.property && ele.property.customlwcname) delete ele.property.customlwcname;
                                return generateElementDiv(ele, theme, "customLwc", omniSupport, item);
                            }
                            //232 base radio input elements support
                            if (element.element === "baseInputElement" && (element.name === "RadioGroup" || element.name === "Radio Image Group" || element.name === "Radio Color Pick Group")) {
                                element.element = "flexRadioInput";
                            }
                            return generateElementDiv(element, theme, "", omniSupport, item);
                        }).join("")}
          </div>
        </${nsPrefix}-flex-card-state>`;
            }
        }
        return "";
    }
    function generateBlockDiv(element, theme, omniSupport, item) {
        let renderedElementBlockCount = renderedElementCount;
        return `<div class="${theme}-grid ${theme}-wrap">
            ${element.children.map((child, blockElementIndex) => {
            renderedElementCount = renderedElementBlockCount + "block_element" + blockElementIndex;
            if (child.element === "customLwc") {
                let ele = lodash.cloneDeep(child);
                ele.element = ele.property && ele.property.customlwcname ? ele.property.customlwcname : ele.element;
                if (ele.property && ele.property.customlwcname) delete ele.property.customlwcname;
                return generateElementDiv(ele, theme, "customLwc", omniSupport, item);
            }
            return generateElementDiv(child, theme, "", omniSupport, item);
        }).join("")}
          </div>`;
    }
    function getElementStyle(element, type, index?) {
        if (element.styleObjects && element.styleObjects.length > 0 && typeof index !== "undefined") {
            return element.styleObjects[index] && (element.styleObjects[index].styleObject[type] || "");
        }
        if (element.styleObject && element.styleObject[type]) {
            return element.styleObject[type];
        }
        return "";
    }
    function getConditionalElementClass(element) {
        if (element.property["data-conditions"]) {
            return "condition-element";
        }
        return "";
    }
    function isSingleAction(ele) {
        return ele.element === "action" && ele.property && !ele.property.actionList;
    }
    function isFlexAction(ele) {
        return ele.element === "action" && ele.property?.actionList?.length;
    }
    function getElementLabel(ele) {
        return ele.elementLabel.replace(/[\s-/]/gi, "").toLowerCase();
    }
    function getActionType(ele) {
        let type = isSingleAction(ele) && ele.property.stateAction ? ele.property.stateAction.type : "";
        return type;
    }
    function isSingleFlyoutActionList(actionList) {
        if (Array.isArray(actionList)) {
            const flyoutActions = actionList.filter(action => {
                return action?.stateAction?.type === "Flyout";
            });
            if (flyoutActions.length === 1) {
                return true;
            }
        }
        return false;
    }
    function actionWithEvents(ele) {
        let type = getActionType(ele);
        return type === "cardAction" || type === "updateOmniScript" || type === "DataAction";
    }
    function attachEventOnTemplate(ele) {
        let type = getActionType(ele);
        let eventStr = "";
        switch (type) {
            case "cardAction":
                eventStr = " onselectcards={updateSelectedCards} onsetvalue={updateAction} ";
                break;
            case "updateOmniScript":
                eventStr = " onupdateos={updateOmniscript} ";
                break;
            case "DataAction":
                eventStr = " onfireactionevent={actionEvtHandler} ";
                break;
        }
        return eventStr;
    }
    function generateElementDiv(element, theme, type, omniSupport, item) {
        let ele = lodash.cloneDeep(element);
        let elementName = utility.lwcPropertyNameConversion(`${nsPrefix}-${ele.element}`);
        if (ele.element === "childCardPreview") {
            let childDevName = getDevNamefromCardname(ele.property.cardName);
            // if isRecursive and if card is Active then use active card name
            if (ele.property && ele.property.isRecursive && item.IsActive) {
                childDevName = getDevNamefromCardname(item.Name);
            }
            let selectedCustomLwcList = lodash.filter(allLwcBundles, {
                DeveloperName: childDevName
            });
            let selectedCustomLwc;

            //check if only one state childcard exist and use that in case of multiple lwc use the unmanged one
            if (selectedCustomLwcList && selectedCustomLwcList.length === 1) {
                selectedCustomLwc = selectedCustomLwcList[0];
            } else {
                selectedCustomLwc = lodash.find(selectedCustomLwcList, {
                    ManageableState: "unmanaged"
                });
            }
            let cNamespace = isInsidePackge && selectedCustomLwc && selectedCustomLwc.ManageableState !== "unmanaged" && selectedCustomLwc.NamespacePrefix || "c";
            if (isInsidePackge && downloadMode === DOWNLOAD_OFF_PLATFORM_MODE) {
                cNamespace = "c";
            }
            elementName = utility.lwcPropertyNameConversion(`${cNamespace}-${childDevName}`);
            if (ele.property && ele.property.cardName) {
                ele.property.recordId = "{recordId}";
                ele.property.objectApiName = "{objectApiName}";
                ele.property.parentRecord = "{record}";
                ele.property.parentMergefields = "{card}";
                ele.property.records = "{_records}";
                delete ele.property.selectedState;
            }
        } else if (type === "customLwc") {
            let selectedCustomLwc;
            if (ele.property?.customLwcData) {
                selectedCustomLwc = ele.property.customLwcData;
                delete ele.property.customLwcData;
            } else {
                selectedCustomLwc = lodash.find(allLwcBundles, {
                    DeveloperName: ele.element
                });
            }
            let cNamespace = selectedCustomLwc ? isInsidePackge && selectedCustomLwc.ManageableState !== "unmanaged" && selectedCustomLwc.NamespacePrefix || "c" : null;
            if (isInsidePackge && downloadMode === DOWNLOAD_OFF_PLATFORM_MODE) {
                cNamespace = "c";
            }
            const cmpName = cNamespace ? `${cNamespace}-${ele.element}` : ele.element;
            elementName = utility.lwcPropertyNameConversion(cmpName);
        }
        let isFlyoutAction = false;
        if (isSingleAction(ele)) {
            let stateAction = ele.property.stateAction;
            isFlyoutAction = stateAction && stateAction.parent !== "menu" && stateAction.type === "Flyout";
        }
        let template;
        let trackingHtml = ` tracking-obj={_childCardTrackingObj} `;
        if (isFlyoutAction) {
            updateStyleDefinitionJSON(renderedElementCount, ele);
            template = `<div data-style-id="${renderedElementCount}" class="${ele.class} ${getElementStyle(ele, "class", 0)} ${getElementStyle(ele, "sizeClass", 0)} ${getConditionalElementClass(ele)}" data-rindex={rindex} style="${getElementStyle(element, "style", 0)}" ${generateEachPropertyForElement(ele, "data-conditions")}>
      <${elementName} data-style-id="${renderedElementCount}_child" ${ele.element === "action" ? trackingHtml : " onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} onfireactionevent={actionEvtHandler} "} ${generateElementProperty(ele)} theme="${theme}" ${preloadingConditionalElement(ele, renderedElementCount)}>${generateFlyoutActionElement(ele)}</${elementName}>
      </div>`;
        } else if (ele.element === "flexMenu") {
            updateStyleDefinitionJSON(renderedElementCount, ele);
            let menuItemsArray = ele.property.menuItems;
            delete ele.property.menuItems;
            template = `<div data-style-id="${renderedElementCount}" class="${ele.class} ${getElementStyle(ele, "class", 0)} ${getElementStyle(ele, "sizeClass", 0)} ${getConditionalElementClass(ele)}" data-rindex={rindex} style="${getElementStyle(element, "style", 0)}" ${generateEachPropertyForElement(ele, "data-conditions")}>
      <${elementName} data-style-id="${renderedElementCount}_child" 
      onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} ${generateElementProperty(ele)}
      theme="${theme}" ${preloadingConditionalElement(ele, renderedElementCount)}> 
       ${generateFlexMenuItems(menuItemsArray, theme, renderedElementCount, ele.elementLabel)}
      </${elementName}>
      </div>`;
        } else if (ele.element === "block") {
            let actionEnabledHtml = "";
            if (ele.property && ele.property.action) {
                actionEnabledHtml = getActionEnabledProperties(ele, theme);
            }
            updateStyleDefinitionJSON(renderedElementCount, ele, `${actionEnabledHtml ? " slds-text-link_reset " : ""}`);
            template = `<div data-style-id="${renderedElementCount}" class="${ele.class} ${actionEnabledHtml ? " slds-text-link_reset " : ""} ${getElementStyle(ele, "class", 0)} ${getElementStyle(ele, "sizeClass", 0)} ${getConditionalElementClass(ele)}" data-rindex={rindex} style="${getElementStyle(element, "style", 0)}" ${generateEachPropertyForElement(ele, "data-conditions")}>
      <${elementName} data-style-id="${renderedElementCount}_child" ${generateElementProperty(ele)} theme="${theme}" ${preloadingConditionalElement(ele, renderedElementCount)} ${actionEnabledHtml}>${generateBlockDiv(ele, theme, omniSupport, item)}</${elementName}>
      </div>`;
        } else if (type === "customLwc") {
            let customLwcElementName = utility.lwcPropertyNameConversion(`${nsPrefix}-customLwcWrapper`);
            let customLwcProperties = lodash.cloneDeep(ele.property);
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
            updateStyleDefinitionJSON(renderedElementCount, ele);
            template = `<div data-style-id="${renderedElementCount}" class="${ele.class} ${getElementStyle(ele, "class", 0)} ${getElementStyle(ele, "sizeClass", 0)}" data-rindex={rindex} style="${getElementStyle(element, "style", 0)}" ${generateEachPropertyForElement(ele, "data-conditions")}>
      <${customLwcElementName} class="${getConditionalElementClass(ele)}" element-name="${elementName}" property=${propertyValue} data-rindex={rindex} records={records} record={record} record-id={recordId} card={card} ${preloadingConditionalElement(ele, renderedElementCount)}><${elementName}  ${generateElementProperty(ele)}></${elementName}></${customLwcElementName}>
      </div>`;
        } else {
            updateStyleDefinitionJSON(renderedElementCount, ele);
            template = `<div data-style-id="${renderedElementCount}" class="${ele.class} ${getElementStyle(ele, "class", 0)} ${getElementStyle(ele, "sizeClass", 0)} ${getConditionalElementClass(ele)}" data-rindex={rindex} style="${getElementStyle(ele, "style", 0)}" ${generateEachPropertyForElement(ele, "data-conditions")}>`;
            if (actionWithEvents(ele)) {
                let eventStr = attachEventOnTemplate(ele);
                template += `<${elementName} data-style-id="${renderedElementCount}_child" ${trackingHtml} ${generateElementProperty(ele)} theme="${theme}" ${preloadingConditionalElement(ele, renderedElementCount)} ${eventStr}></${elementName}>
          </div>`;
            } else if (ele.element === "childCardPreview") {
                let osAttributes = omniSupport && isStateActiveHtml ? getOmniAttributes(ele.property.cardName) : "";
                if (ele.property.cardName) {
                    delete ele.property.cardName;
                }
                template += `<${elementName} data-style-id="${renderedElementCount}_child" ${trackingHtml} is-inside-parent={insideParent} parent-uniquekey={uniqueKey} ${generateElementProperty(ele)} theme="${theme}" ${osAttributes} ${preloadingConditionalElement(ele, renderedElementCount)} onupdateparent={updateParentData}></${elementName}>
      </div>`;
            } else {
                let actionEnabledHtml = "";
                if (ele.property && ele.property.action) {
                    actionEnabledHtml = getActionEnabledProperties(ele, theme);
                }
                if (isSingleAction(ele)) {
                    template += `<${elementName} data-style-id="${renderedElementCount}_child" ${trackingHtml} ${generateElementProperty(ele)} theme="${theme}" ${actionEnabledHtml} ${preloadingConditionalElement(ele, renderedElementCount)}></${elementName}>
          </div>`;
                } else if (isFlexAction(ele)) {
                    if (elementName.indexOf("flex-action") === -1) {
                        elementName = elementName.replace("action", "flex-action");
                    }
                    if (!ele.property.actionList) {
                        ele.property.actionList = ele.property?.stateAction ? [ele.property] : [];
                    }
                    const showSpinner = escapeField(ele.property.showSpinner || "false");
                    delete ele.property.showSpinner;
                    template += `<${elementName} data-style-id="${renderedElementCount}_child" ${trackingHtml} class= "${renderedElementCount}_child flexActionElement" 
          data-action-element-class="${renderedElementCount}_child" data-action-key="${renderedElementCount}" onexecuteaction={performAction} data-show-spinner=${showSpinner}
          data-element-label="${getElementLabel(ele)}"  ${generateElementProperty(ele)} theme="${theme}" ${actionEnabledHtml} ${preloadingConditionalElement(ele, renderedElementCount)}>${generateFlexActionTemplate(ele)}</${elementName}>
        </div>`;
                } else if (ele.element === "flexToggle" && typeof ele.property.updateDS !== "undefined") {
                    let updateDS = ele.property.updateDS;
                    let key = ele.property.type === "checkbox" || ele.property.type === "button" ? "value" : "checked";
                    let fieldName = ele.property[key].match(/\{([a-zA-Z.0-9_]*)\}/g) ? ele.property[key].substring(1).replace(/[{}]/g, "") : "";
                    delete ele.property.updateDS;
                    template += `<${elementName} data-style-id="${renderedElementCount}_child" ${generateElementProperty(ele)} theme="${theme}" ${updateDS && fieldName ? (!actionEnabledHtml ? "onchange={setValueOnToggle} " : "data-onchange='setValue' ") + "data-fieldname='" + fieldName + "'" : ""} ${actionEnabledHtml} ${preloadingConditionalElement(ele, renderedElementCount)}></${elementName}>
        </div>`;
                } else {
                    template += `<${elementName} data-style-id="${renderedElementCount}_child" ${ele.element === "flexImg" && !ele.property.card ? "card={card}" : ""} ${generateElementProperty(ele)} theme="${theme}" ${actionEnabledHtml} ${preloadingConditionalElement(ele, renderedElementCount)}></${elementName}>
        </div>`;
                }
            }
        }
        return template;
    }
    function escapeField(value) {
        if (typeof value === "string" && value.indexOf("{") !== -1 && value.indexOf("\\") === -1) {
            value = `"\\${value}"`;
            return value;
        }
        return `"${value}"`;
    }
    function getAllFlyouts(actionList) {
        if (Array.isArray(actionList)) {
            const flyoutActions = actionList.filter(action => {
                return action?.stateAction?.type === "Flyout";
            });
            return flyoutActions;
        }
        return [];
    }
    function getFlexActionFields(menuItem): any {
        const actionList = menuItem.actionList || (menuItem.actionData ? [menuItem.actionData] : []);
        let firstFlyoutAction: any = undefined;
        let isSingleFlyout = false;
        if (actionList.length > 0) {
            let allFlyouts = getAllFlyouts(actionList);
            firstFlyoutAction = allFlyouts[0];
            isSingleFlyout = allFlyouts.length === 1;
        }
        const flexActionFields = {
            element: "action",
            property: {
                actionList: actionList,
                label: menuItem.label,
                iconName: menuItem.iconName,
                reRenderFlyout: firstFlyoutAction?.reRenderFlyout,
                preloadFlyout: firstFlyoutAction?.preloadFlyout,
                flyoutDetails: isSingleFlyout ? {
                    openFlyoutIn: firstFlyoutAction?.stateAction?.openFlyoutIn
                } : {},
                flyoutChannel: firstFlyoutAction?.stateAction?.channelName
            }
        };
        return flexActionFields;
    }
    function generateFlexMenuItems(menuItemsArray, theme, renderedElementCount, flexMenuElementLabel) {
        let menuItems = ``;
        menuItemsArray.forEach((menuItem, index) => {
            const menuItemElement = {
                element: "action",
                property: {}
            };
            const renderedElementCountMenuItem = `${renderedElementCount}_menuitem_${index}`;
            const menuItemData = {
                iconPosition: menuItem.iconPosition
            };
            if (!menuItem.actionConditions) {
                //Read the existing condition
                menuItem.actionConditions = menuItem?.actionData?.stateAction?.actionConditions;
                //Set existing condition to null if exist
                if (menuItem?.actionData?.stateAction) {
                    menuItem.actionData.stateAction.actionConditions = null;
                }
            }
            if (menuItem?.actionConditions) {
                menuItemElement.property["data-conditions"] = menuItem?.actionConditions;
            }
            const showSpinner = escapeField(menuItem.showSpinner || "false");
            const flexActionFields = getFlexActionFields(menuItem);
            flexActionFields.elementLabel = flexMenuElementLabel + "-MenuItem-" + index;
            //eg: Menu-0-MenuItem-0
            updateStyleDefinitionJSON(renderedElementCountMenuItem, menuItemElement);
            menuItems += `<${nsPrefix}-flex-menu-item 
      name="${menuItem.name}"
      theme="${theme}"
      data-style-id="${renderedElementCountMenuItem}"
      ${generateEachPropertyForElement(menuItemElement, "data-conditions")}
      class="${getConditionalElementClass(menuItemElement)}"
      >
      <${nsPrefix}-flex-action record={record} card={card} ${generateElementProperty(flexActionFields)} class="${renderedElementCountMenuItem} flexActionElement" onexecuteaction={performAction} 
      data-action-element-class="${renderedElementCountMenuItem}" data-action-key="${renderedElementCountMenuItem}" data-show-spinner=${showSpinner} 
      data-element-label="${getElementLabel(flexActionFields)}" 
      theme="${theme}" extra-class="${theme}-dropdown__item" 
        action-wrapperclass="${menuItem.status ? theme + "-has-" + menuItem.status : ""}"
        action-labelclass="${theme}-truncate menu-item-label"
        menu-item-data="${encodeURIComponent(JSON.stringify(menuItemData))}"
        icon-size="x-small"
        icon-extraclass="${theme + "-icon-text-default " + theme + (menuItem.iconPosition && menuItem.iconPosition.toLowerCase() === "right" ? "-m-left_small " + theme + "-shrink-none" : "-m-right_x-small")}" >
       ${generateFlexActionTemplate(flexActionFields)}</${nsPrefix}-flex-action>
      </${nsPrefix}-flex-menu-item>`;
        });
        return menuItems;
    }
    function getOmniAttributes(cardName) {
        if (childCards && childCards.length > 0) {
            let selectedCard = lodash.find(childCards, {
                Name: cardName
            });
            let osSupport = false;
            if (selectedCard && selectedCard.PropertySetConfig) {
                let cardDef = typeof selectedCard.PropertySetConfig === "string" ? JSON.parse(selectedCard.PropertySetConfig) : {};
                osSupport = cardDef.osSupport;
            }
            return osSupport ? ` omni-json-def={omniJsonDef} omni-script-header-def={omniScriptHeaderDef} omni-custom-state={omniCustomState} omni-json-data={omniJsonData} ${isRepeatable ? "omni-support-key={record._flex.uniqueKey}" : ""} ` : "";
        }
        return "";
    }
    function getActionEnabledProperties(ele, theme) {
        if (ele.property) {
            ele.property.extraclass = `${ele.property.extraclass ? ele.property.extraclass : ""} ${theme}-text-link_reset`;
        }
        //Convert previously configured single action into array of action
        const actionList = ele.property.action.actionList || (ele.property.action.actionData ? [ele.property.action.actionData] : []);
        ele.property.action.actionList = actionList;
        //Convert Block-0, Date/Time-0, Text Area-21 to block0, datetime0, textarea21 e.t.c for using inside lwc conditional
        const elementLabel = getElementLabel(ele);
        if (actionList && actionList.length > 0) {
            actionList.forEach((action, actionIndex) => {
                const actionFlyoutIndex = elementLabel + "action" + actionIndex;
                //eg: block0action0
                actionElementsSlotObject[actionFlyoutIndex] = generateFlyoutForTriggerActionElement(action, actionFlyoutIndex);
            });
        }
        let actionEnabledHtml = `${ele.property.action.eventType ? ele.property.action.eventType : "onclick"}={executeAction} data-element-label="${elementLabel}" data-action-key="${renderedElementCount}"`;

        // Adding tabindex and onkeydown event only to the flexImg to minimize the impact of the change
        if ((ele.element === "flexImg" || ele.element === "block") && actionEnabledHtml && actionEnabledHtml.includes("onclick")) {
            actionEnabledHtml = `${actionEnabledHtml} onkeydown={executeActionWithKeyboard} tabindex="0"`;
        }
        return actionEnabledHtml;
    }
    function generateFlexActionTemplate(ele) {
        let flyoutSlots = "";
        const elementLabel = getElementLabel(ele);
        if (ele?.property?.actionList) {
            const actionList = [...ele.property.actionList];
            let isSingleFlyout = isSingleFlyoutActionList(actionList);
            actionList.forEach((action, actionIndex) => {
                const actionFlyoutIndex = elementLabel + "action" + actionIndex;
                //eg: menu0menuitem0action0, multipleaction0action0
                flyoutSlots += generateFlyoutForTriggerActionElement(action, actionFlyoutIndex, "flexAction", isSingleFlyout);
            });
        }
        return flyoutSlots;
    }

    /*
    This method adds if:true to parent div of the element only if we uncheck preload component in designer
    If we say Preload is true then we dont have to add this in HTML
    */
    function preloadingConditionalElement(element, identifier) {
        if (isRepeatable && isStateActiveHtml && element && element.property && element.property.hasOwnProperty("data-preloadConditionalElement") && !element.property["data-preloadConditionalElement"]) {
            return `if:true={record._flex.${identifier}_child}`;
        }
        return ``;
    }
    function generateElementProperty(element) {
        let cmp = `${sortParameterBasedOnDependency(Object.keys(element.property).map(key => {
            return generateEachPropertyForElement(element, key);
        }), element.element || element.flyoutType).join("")}`;
        return cmp;
    }
    function generateEachPropertyForElement(element, key) {
        let propertyText = "";
        if (element.property.hasOwnProperty(key)) {
            let value = element.property[key];
            let val = `"${value}"`;
            let hasDQuote = /".*?"/g;
            let hasHtmlTag = /<\/?[a-z][\s\S]*>/g;
            if (typeof value === "string" && value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") {
                val = value;
            }
            if (typeof value === "object" || Array.isArray(value)) {
                //replace single quote with html single quote character reference
                let propertyValue = JSON.stringify(value).replace(/'/g, "&#39;");
                val = `'\\${propertyValue}'`;
            } else if (hasDQuote.test(value) || hasHtmlTag.test(value)) {
                val = `'${value}'`;
            }

            //special case as outputField label interpolates itself
            if (element.element === "outputField" && (key === "label" || key === "placeholder" || key === "fieldName" || key === "fieldLevelHelp") && typeof value === "string" && value.indexOf("{") !== -1) {
                val = `"\\${value}"`;
            }
            if (element.element === "block" && key === "label" && typeof value === "string" && value.indexOf("{") !== -1 && value.indexOf("\\") === -1) {
                val = `"\\${value}"`;
            }
            if ((element.element === "childCardPreview" || element.flyoutType === "childCard") && key === "cardNode" && typeof value === "string" && value.indexOf("{") !== -1) {
                val = `"\\${value}"`;
            } else if ((element.element === "childCardPreview" || element.flyoutType === "childCard") && key === "cardNode" && value && typeof value === "string" && value.indexOf("{") === -1) {
                key = "parentData";
                val = "{_dataNode}";
            }
            // For FlexChart escape mergefield for title
            if (element.element === "flexChart" && key === "title" && value.startsWith("{") && value.indexOf("{") !== -1 && value.indexOf("\\") === -1) {
                val = `"\\${value}"`;
            }
            let isBoolean = value === "true" || value === true || value === "false" || value === false;
            if (isBoolean && (key === "disabled" || key === "required" || key === "checked")) {
                propertyText = value === "true" || value === true ? ` ${key} ` : "";
            } else {
                propertyText = ` ${utility.lwcPropertyNameConversion(key)}=${val} `;
            }
        }
        return propertyText;
    }
    function sortParameterBasedOnDependency(parametersArray, type) {
        parametersArray.sort(param => {
            if (param.indexOf("={record}") !== -1 || param.indexOf("={card}") !== -1 || param.indexOf("={recordId}") !== -1 || param.indexOf("={_records}") !== -1) {
                return -1;
            }
            return 1;
        });
        if (type === "childCardPreview" || type === "childCard") {
            for (let i = 0; i < parametersArray.length; ++i) {
                if (parametersArray[i].indexOf("card-node=") !== -1 || parametersArray[i].indexOf("parent-data=") !== -1) {
                    parametersArray.unshift(parametersArray.splice(i, 1)[0]);
                    break;
                }
            }
            const indexOfRecords = parametersArray.indexOf(" records={_records} ");
            const indexOfParentRecord = parametersArray.indexOf(" parent-record={record} ");
            if (indexOfRecords < indexOfParentRecord) {
                let parentRecord = parametersArray.splice(indexOfParentRecord, 1)[0];
                parametersArray.splice(indexOfRecords, 0, parentRecord);
            }
        }
        return parametersArray;
    }
    function generateFlyoutForTriggerActionElement(action, index, actionComponent?, isSingleFlyout?) {
        let stateAction = action.stateAction;
        let customLwcElementName = utility.lwcPropertyNameConversion(`${nsPrefix}-customLwcWrapper`);
        if (stateAction.type === "Flyout" && stateAction.flyoutType) {
            let selectedCustomLwc: any = {};
            if (stateAction.flyoutType === "customLwc") {
                selectedCustomLwc = stateAction.flyoutCustomLwcData ? stateAction.flyoutCustomLwcData : lodash.find(allLwcBundles, {
                    DeveloperName: stateAction.flyoutLwc
                });
            }
            let defaultNs = selectedCustomLwc ? isInsidePackge && selectedCustomLwc.ManageableState !== "unmanaged" && selectedCustomLwc.NamespacePrefix || "c" : null; //generate OS and Childcard will have namespace as c
            if (isInsidePackge && downloadMode === DOWNLOAD_OFF_PLATFORM_MODE) {
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
            let condition = isSingleFlyout ? "" : `if:true={${slotControlVar}.${index}}`;
            return `<div slot="${slotName}" class="${index} ${stateAction.flyoutContainerClass ? stateAction.flyoutContainerClass : ""}" ${condition}>${createFlyoutTemplate("", stateAction, customLwcElementName, defaultNs, `{${slotControlVar}.${index}}`)}</div>`;
        }
        return "";
    }
    function generateFlyoutActionElement(element) {
        let action = isSingleAction(element) ? { ...element.property.stateAction } : {};
        let selectedCustomLwc: any = {};
        if (action.flyoutType === "customLwc") {
            selectedCustomLwc = action.flyoutCustomLwcData ? action.flyoutCustomLwcData : lodash.find(allLwcBundles, {
                DeveloperName: action.flyoutLwc
            });
        }
        let defaultNs = selectedCustomLwc ? isInsidePackge && selectedCustomLwc.ManageableState !== "unmanaged" && selectedCustomLwc.NamespacePrefix || "c" : null; //generate OS and Childcard will have namespace as c
        if (isInsidePackge && downloadMode === DOWNLOAD_OFF_PLATFORM_MODE) {
            defaultNs = "c";
        }
        let customLwcElementName = utility.lwcPropertyNameConversion(`${nsPrefix}-customLwcWrapper`);
        return `<div slot="flyout"> ${createFlyoutTemplate("", action, customLwcElementName, defaultNs)}</div>`;
    }
    function createFlyoutTemplate(Id, action, customLwcElementName, defaultNs?, listenerAction?) {
        let isOsFlyout = action.flyoutType === "OmniScripts";
        let lwcname = action.flyoutLwc;
        let cmpName = defaultNs ? `${defaultNs}-${lwcname}` : lwcname;
        let elementName = utility.lwcPropertyNameConversion(cmpName);
        let template = "";
        if (action.flyoutType === "childCard") {
            lwcname = convertNameToValidLWCCase("cf-" + action.flyoutLwc);
            elementName = utility.lwcPropertyNameConversion(`${defaultNs}-${lwcname}`);
            action.property = { ...action.flyoutParams };
            let parentAttribute = { ...action.property };
            let property: any = {};
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
            template = ` <${elementName} data-style-id="${renderedElementCount}_child" ${generateElementProperty(action)} ${Id ? "style='display:none'  data-id=" + Id : ""}></${elementName}>`;
            return template;
        }
        action.property = action.flyoutParams ? { ...action.flyoutParams } : {};
        let customLwcProperties = lodash.cloneDeep(action.property);
        let propertyValue = action.flyoutParams ? `'\\${JSON.stringify(action.flyoutParams)}'` : "";
        if (isOsFlyout) {
            let prefillObj = {
                omniscriptEmbeddedSource: "flyout"
            };
            if (action.flyoutParams) {
                prefillObj = {
                    ...prefillObj,
                    ...action.flyoutParams
                }
            }
            propertyValue = `'\\${JSON.stringify({
                prefill: JSON.stringify(prefillObj)
            })}'`;
        } else {
            let apiVars = ["{record}", "{records}", "{recordId}", "{objectApiName}"];
            let keys = Object.keys(action.property);
            keys.forEach(key => {
                let value = action.property[key];
                if (apiVars.indexOf(value) === -1 && value.indexOf("{") !== -1) {
                    delete action.property[key];
                } else {
                    delete customLwcProperties[key];
                }
            });
            propertyValue = customLwcProperties ? `'\\${JSON.stringify(customLwcProperties)}'` : "";
        }
        template = ` <${elementName}  ${isOsFlyout ? ` layout='${action.layoutType}' ` : ""} ${Id ? "style='display:none'  data-id=" + Id : ""} ${propertyValue && !isOsFlyout ? " " + generateElementProperty(action) : ""} ></${elementName}>`;
        if (propertyValue) {
            template = `<${customLwcElementName} element-name="${elementName}" property=${propertyValue} records={records} record-id={recordId} record={record}  card={card} ${listenerAction ? ` action=${listenerAction} ` : ""}>
      ${template}
      </${customLwcElementName}>`;
        }
        return template;
    }

    //card html
    function generateCardHtml(cardDef, theme, item) {
        let cardHtml = "";
        let stateActiveHtml = "";
        let stateInActiveHtml = "";
        let listenToWidthResize = cardDef && cardDef.listenToWidthResize;
        styleDefinition = {};
        cardDef.states.forEach((state, index) => {
            stateActiveHtml += generateStateHtml(cardDef, index, theme, true, item);
            stateInActiveHtml += generateStateHtml(cardDef, index, theme, false, item);
        });
        if (cardDef.isRepeatable || typeof cardDef.isRepeatable === "undefined") {
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
        let actionHtml = "";
        Object.keys(actionElementsSlotObject).forEach(ele => {
            actionHtml += actionElementsSlotObject[ele];
        });
        return `<template>
              <div class="${theme}-grid ${theme}-wrap ${theme}-is-relative ${listenToWidthResize ? "containersize" : ""}">
              ${generateToast(theme)}
              ${generateLoader(theme)}
              <template if:false={hasPermission}>
                ${requiredPermissionsError}
              </template>
              <template if:true={hasPermission}>
                ${cardHtml}
              </template>
              <template if:true={hasError}>
              {error}
              </template>
              ${generateEventListenerElement(cardDef)}
              <${nsPrefix}-action class="execute-action" re-render-flyout action-wrapperclass="slds-hide" onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} onfireactionevent={actionEvtHandler}>
              ${actionHtml}
              </${nsPrefix}-action>
              </div>
            </template>`;
    }

    //card js
    function generateCardJs(lwcComponentName, theme, customLabels, cardDef, cardRecordId, customCssAttachmentId) {
        const eventConfig = generateEventListenerAction(cardDef);
        let eventListener = eventConfig.register;
        let removeEventListeners = eventConfig.unregister;
        let extendingMixins = "";
        let omniSupport = cardDef && cardDef.osSupport;
        let multilanguageSupport = cardDef && cardDef.multilanguageSupport;
        let listenToWidthResize = cardDef && cardDef.listenToWidthResize;
        let globalCSS = cardDef && cardDef.globalCSS;
        let sessionVars = cardDef && cardDef.sessionVars;
        let styleSheet = cardDef && cardDef.customStyleSheet;
        let customStyleSheetPath = theme === "nds" ? "/assets/styles/vlocity-newport-design-system.min.css" : "/assets/styles/salesforce-lightning-design-system-vf.min.css";
        extendingMixins = omniSupport ? "FlexCardMixin(OmniscriptBaseMixin(LightningElement))" : "FlexCardMixin(LightningElement)";
        return `import { FlexCardMixin } from "${nsPrefix}/flexCardMixin";
      import { CurrentPageReference } from 'lightning/navigation';
      import {interpolateWithRegex, interpolateKeyValue, loadCssFromStaticResource } from "${nsPrefix}/flexCardUtility";
      ${theme === "nds" ? `import { load } from "${nsPrefix}/newportLoader";
            ` : ``}
            import { LightningElement, api, track, wire } from "lwc";
            import pubsub from "${nsPrefix}/pubsub";
            import { getRecord } from "lightning/uiRecordApi";
            ${omniSupport ? `import { OmniscriptBaseMixin } from "${nsPrefix}/omniscriptBaseMixin";` : ""}
            import data from "./definition";
            
            import styleDef from "./styleDefinition";
                
            ` + `export default class ${lwcComponentName} extends ` + extendingMixins + `{
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
                    }` : ""}
                @track record;
                ${sessionVars ? generateApiVariables(sessionVars) : ""}
                ` + getCustomLabelTrackVariable(customLabels) + `
                ${pubsubEventVarPrefx} = [];
                ${customEventVarPrefx} = [];
                ${getRecordWireAdapter(cardDef.events)}
                connectedCallback() {
                  super.connectedCallback();
                  this.setThemeClass(data);
                  this.setStyleDefinition(styleDef);
                  data.Session = {} //reinitialize on reload
                  ${styleSheet ? `
                        loadCssFromStaticResource(this, "${styleSheet}", "${customStyleSheetPath}").then(() => {
                        this.setDefinition(data);
                        this.isProcessing = false;
                        this.registerEvents();
                        }).catch(() => {
                        this.setDefinition(data);
                        this.registerEvents();
                      });` : ""}
                  ${listenToWidthResize ? `this.flexiPageWidthAwareCB = this.flexiPageWidthAware.bind(this);
                    window.addEventListener('resize', this.flexiPageWidthAwareCB);` : ``}
                  ${customLabels && Object.keys(customLabels).length > 0 ? `this.customLabels = this.Label;
                        ${multilanguageSupport ? `
                            this.fetchUpdatedCustomLabels();
                        ` : ""}` : ""}
                  ${theme !== "nds" && !styleSheet ? "this.setDefinition(data);\n this.registerEvents();" : ""}
                  ${globalCSS && customCssAttachmentId ? `this.setAttribute(
                    "class", (this.getAttribute("class") ? this.getAttribute("class") : "") +
                    " card-${cardRecordId}"
                  );
                  this.loadCustomStylesheetAttachement("${customCssAttachmentId}");
                  ` : ""}
                  ${theme === "nds" && !styleSheet ? `
                  load(this)
                  .then(() => {
                    ${theme === "nds" ? "this.setDefinition(data); \n this.registerEvents();" : ""}
                    this.isProcessing = false;
                    //this.isNewport = false;
                  })
                  .catch(() => {
                    ${theme === "nds" ? "this.setDefinition(data); \n this.registerEvents();" : ""}
                  });
                  ` : ""}
                }
                
                disconnectedCallback(){
                  super.disconnectedCallback();
                      ${omniSupport ? "this.omniSaveState(this.records,this.omniSupportKey,true);" : ""}
                      ${listenToWidthResize ? `window.removeEventListener('resize', this.flexiPageWidthAwareCB);` : ``}
  
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
                  }` : ``}
                }
            }`;
    }
    const FLEXCARD_COMMON_PROPS = ["recordId", "objectApiName", "theme", "orgNsPrefix", "sessionVars", "searchParam", "obj", "isRecursive", "debug", "isChildCardTrackingEnabled", "trackingObj", "testParams", "size", "records", "cardNode", "parentData", "parentUniquekey", "isInsideParent", "parentRecord", "parentRecords", "parentAttribute", "parentMergefields", "listenOsDataChange", "omniJsonData"];
    const FLEXCARD_OS_SUPPORT_PROPS = ["omniSupportKey", "omniScriptHeaderDef", "omniResume", "omniSeedJson", "omniJsonDef", "omniCustomState", "omniJsonDataStr"];
    function makeStandardRuntimeProperty(name) {
        // how do generated sessionVars get exposed on the flexcard component?
        return `@api get ${name}() {
      return this.runtimeWrapper?.getExposedAttribute("${name}");
    }
    set ${name}(val) {
      this.runtimeWrapper?.updateExposedAttributes("${name}", val);
    };`;
    }
    function generateStandardRuntimeWrapperJs(lwcComponentName, cardDef, nsPrefix) {
        return `import { LightningElement, api } from "lwc";
  export default class ${lwcComponentName} extends LightningElement {
      ${FLEXCARD_COMMON_PROPS.map(prop => `@api ${prop};`).join("\n\t")}
      ${cardDef?.sessionVars ? cardDef?.sessionVars.filter(session => session.isApi).map(session => makeStandardRuntimeProperty(exposedAPIPrefix + session.name)).join("\n\n") : ""}
      ${cardDef?.osSupport ? FLEXCARD_OS_SUPPORT_PROPS.map(prop => `@api ${prop};`).join("\n\t") : ""}
      ${cardDef?.osSupport ? `
      @api checkValidity() {
        return this.runtimeWrapper?.checkValidity();
      }
      @api reportValidity() {
        return this.runtimeWrapper?.reportValidity();
      }
      ` : ""}
      get runtimeWrapper() {
        return this.template.querySelector('${nsPrefix}-flex-card-standard-runtime-wrapper');
      }
  }`;
    }
    function generateStandardRuntimeWrapperHtml(flexCardName, cardDef, nsPrefix) {
        return `<template>
      <${nsPrefix}-flex-card-standard-runtime-wrapper flexcard-name="${flexCardName}"
        ${FLEXCARD_COMMON_PROPS.map(prop => `${utility.lwcPropertyNameConversion(prop)}={${prop}}`).join("\n\t")}
        ${cardDef?.osSupport ? FLEXCARD_OS_SUPPORT_PROPS.map(prop => `${utility.lwcPropertyNameConversion(prop)}={${prop}}`).join("\n\t") : ""}>
      </${nsPrefix}-flex-card-standard-runtime-wrapper>
  </template>`;
    }
    function generateApiVariables(sessionVars) {
        let sessionHandler = "@track _sessionApiVars = {};";
        sessionVars.forEach(session => {
            if (session.isApi) {
                sessionHandler += `
          @api set ${exposedAPIPrefix}${session.name}(val) {
            if(typeof val !== "undefined") {
              this._sessionApiVars["${session.name}"] = val;
            }
          } get ${exposedAPIPrefix}${session.name}() {
            return this._sessionApiVars["${session.name}"] || "${session.val}";
          }
        `;
            }
        });
        return sessionHandler;
    }
    function getCustomLabelTrackVariable(customLabels) {
        if (customLabels && Object.keys(customLabels).length > 0) {
            let variableString = "@track Label={";
            Object.keys(customLabels).forEach((key, index) => {
                if (typeof customLabels[key] !== "string") {
                    variableString = variableString + `${key}:{`;
                    let nsPrefixLabel = customLabels[key];
                    Object.keys(nsPrefixLabel).forEach((item, ind) => {
                        variableString = variableString + `${item}:"${nsPrefixLabel[item]}" ${Object.keys(nsPrefixLabel).length - 1 === ind ? "" : ","}`;
                    });
                    variableString = variableString + `} ${Object.keys(customLabels).length - 1 === index ? "" : ","}`;
                } else {
                    variableString += `${key}:"${customLabels[key]}"${Object.keys(customLabels).length - 1 === index ? "" : ","}
          `;
                }
            });
            variableString += "};";
            return variableString;
        }
        return ``;
    }

    //Loader support
    function generateLoader(theme) {
        return `<div if:true={showLoader} class="${theme}-is-absolute vloc-loader_override" style="height: 100%; width: 100%; min-height:50px; background: transparent; z-index: 99;">
    <div>
     <${nsPrefix}-spinner
        variant="brand"
        alternative-text="Loading content..."
        size="${theme === "slds" ? "medium" : "small"}"
        theme="${theme}"
        ></${nsPrefix}-spinner>
    </div>
  </div>`;
    }
    function generateToast(theme) {
        return `<div style="position: fixed;z-index: 999999;top: 0;right: 0;">
    <${nsPrefix}-toast class="flexcard-toast-element" theme="${theme}" title="" message="" styletype=""> </${nsPrefix}-toast>
  </div>`;
    }

    //Event Listener Support
    function generateEventListenerElement(cardDef) {
        let flyoutSlots = "";
        if (cardDef.events) {
            cardDef.events.forEach((eve, eventIndex) => {
                //Convert previously configured single action into multiple action array
                eve.actionList = eve.actionList || (eve.actionData ? [eve.actionData] : []);
                if (eve.actionList) {
                    eve.actionList.forEach((action, actionIndex) => {
                        flyoutSlots += generateFlyoutForTriggerActionElement(action, `listener${eventIndex}action${actionIndex}`);
                    });
                }
            });
        }
        return `
        <${nsPrefix}-action action-wrapperclass="slds-hide" re-render-flyout class="action-trigger slds-col" onupdateos={updateOmniscript} onselectcards={updateSelectedCards} onsetvalue={updateAction} onfireactionevent={actionEvtHandler}>
        ${flyoutSlots}
        </${nsPrefix}-action>
    `;
    }
    function getDynamicChannelName(name) {
        const regex = /\{([a-zA-Z.0-9_[\]]*)\}/g;
        let dynamicName;
        dynamicName = name.replace(regex, function (match, exp) {
            if (exp && exp === "recordId") {
                return "${this.recordId}";
            }
            return match;
        });
        return dynamicName;
    }
    function generateEventListenerAction(cardDef) {
        let pubSubRegisterConfig = "";
        let pubSubUnregisterConfig = "";
        let customEvents: any[] = [];
        if (cardDef.events) {
            let groupEvents = {};
            cardDef.events.forEach((eve, index) => {
                const channelName = getDynamicChannelName(eve.channelname);
                if (eve.eventtype === "pubsub") {
                    if (!groupEvents[channelName]) {
                        groupEvents[channelName] = [];
                    }
                    groupEvents[channelName].push(`[interpolateWithRegex(\`${eve.eventname}\`,this._allMergeFields,this._regexPattern,"noparse")]: this.handleEventAction.bind(this, data.events[${index}],${index})`);
                } else if (eve.eventtype === "event") {
                    customEvents.push({
                        [eve.eventname]: `this.handleEventAction.bind(this, data.events[${index}],${index})`
                    });
                }
            });
            Object.keys(groupEvents).forEach((key, index) => {
                pubSubRegisterConfig += `
          this.${pubsubEventVarPrefx}[${index}] = {
            ${groupEvents[key].join(",\n")}
          };
          this.pubsubChannel${index} = interpolateWithRegex(\`${key}\`,this._allMergeFields,this._regexPattern,"noparse");
          pubsub.register(this.pubsubChannel${index},this.${pubsubEventVarPrefx}[${index}]);\n`;
                pubSubUnregisterConfig += `pubsub.unregister(this.pubsubChannel${index},this.${pubsubEventVarPrefx}[${index}]);\n`;
            });
            if (customEvents.length > 0) {
                customEvents.forEach((eve, index) => {
                    Object.keys(eve).forEach(cusEve => {
                        pubSubRegisterConfig += `
              this.customEventName${index} = interpolateWithRegex(\`${cusEve}\`,this._allMergeFields,this._regexPattern,"noparse");
              this.${customEventVarPrefx}[${index}] = ${eve[cusEve]};\n
              this.template.addEventListener(this.customEventName${index},this.${customEventVarPrefx}[${index}]);\n
            `;
                        pubSubUnregisterConfig += `
              this.template.removeEventListener(this.customEventName${index},this.${customEventVarPrefx}[${index}]);\n`;
                    });
                });
            }
        }
        return {
            register: pubSubRegisterConfig,
            unregister: pubSubUnregisterConfig
        };
    }

    //getDefinitoon
    function generateDefinition(object) {
        var itemDefinition = object.PropertySetConfig;
        if (itemDefinition.bypassSave) delete itemDefinition.bypassSave;
        if (itemDefinition && typeof itemDefinition === "string") {
            itemDefinition = JSON.parse(itemDefinition);
        }
        if (itemDefinition && itemDefinition.dataSource && itemDefinition.dataSource.contextVariables && itemDefinition.dataSource.contextVariables.length > 0) {
            itemDefinition.dataSource.contextVariables = [];
        }
        // TODO - For filebased cards add the Name and UniqueKey [UniqueName]
        itemDefinition.Name = object?.Name;
        // If uniqueName is available use that else generate new
        const uniqueKey = object.UniqueName ? object.UniqueName : object.IsActive ? object.Name : `${object.Name}_${object.VersionNumber}_${object.AuthorName}`;
        itemDefinition.uniqueKey = uniqueKey;
        itemDefinition.Id = object.Id;
        itemDefinition.OmniUiCardKey = object.OmniUiCardKey;
        itemDefinition.Type = object.Type;
        itemDefinition.IsChildCard = object.IsChildCard;

        //Perf fix xml data is not required on def
        return `let definition = ${JSON.stringify(lodash.omit(itemDefinition, ["xmlObject", "xmlJson"]))};\nexport default definition`;
    }
    function updateStyleDefinitionJSON(id, ele, additionalClasses?) {
        //Adding runtime styling only when its a conditional element or it support conditional style and for others adding default style
        if (ele.styleObjects?.length > 1 || ele.styleObjects?.length > 0 && ele.property["data-conditions"]) {
            styleDefinition[id] = [];
            ele.styleObjects.forEach((style, index) => {
                let styleObject = updateStyleDefinitionJSONStyleObject(ele, additionalClasses, style, index);
                styleDefinition[id].push(styleObject);
            });
        } else if (ele.property["data-conditions"]) {
            styleDefinition[id] = [];
            let styleObject = updateStyleDefinitionJSONStyleObject(ele, additionalClasses);
            styleDefinition[id].push(styleObject);
        }
    }
    function updateStyleDefinitionJSONStyleObject(ele, additionalClasses, style?, index?) {
        return {
            conditions: style ? style.conditions : "default",
            styleObject: {
                class: `${ele.class ? ele.class : ""} ${getConditionalElementClass(ele)} ${getElementStyle(ele, "class", index)} ${getElementStyle(ele, "sizeClass", index)} ${additionalClasses ? additionalClasses : ""}`,
                style: getElementStyle(ele, "style", index),
                styleProperties: getElementStyle(ele, "elementStyleProperties", index)
            }
        };
    }

    //get style definition
    function generataStyleDefinition() {
        return `let styleDefinition =
        ${JSON.stringify(styleDefinition)};
    export default styleDefinition`;
    }
    function getComponentSvg() {
        return `<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 200 200" height="200px" width="200px">
    <g fill-rule="evenodd" fill="#059DD3" stroke-width="1" stroke="none">
        <path d="M148,47.9c-4.2-11.3-15.1-18.8-27-18.8c-4,0-7.8,0.8-11.4,2.3c-8.4-8-19.4-12.4-31.1-12.4c-23.7,0-43.4,18.4-45.1,42
            C19.1,67,9.8,80.9,9.8,96.5c0,21.2,17.3,38.5,38.5,38.5c4.1,0,9,0,14.3,0l2.3-15.2l-16.4,0c-12.6,0-23-10.7-23-23.3
            c0-10.7,7.2-19.8,17.6-22.3l6.4-1.5L49,65.6l0-0.1c0-0.4-0.1-0.9-0.1-1.3c0-16.3,13.3-29.6,29.6-29.6c9.2,0,17.7,4.2,23.4,11.5
            l4.8,6.1l0.2-0.3c2.7-4.8,7.9-7.7,13.3-7.7c8.5,0,15.4,6.9,15.4,15.4c0,1.6-0.7,5.2-0.7,5.2l-0.1,0.4l0.4-0.1
            c0.1,0,5.9-1.6,12.2-1.6c15.5,0,28.1,12.6,28.1,28.1c0,15.5-12.6,28.1-28.1,28.1l-9.2,0l-8.5,15.3c7.9,0,14.3,0,18.2,0h0h0
            c23.9-0.7,43.3-20.2,43.3-43.4C191.1,67.9,171.8,48.3,148,47.9z"></path>
        <polygon points="87.3,76 115.6,76 100.1,119.8 123.1,119.9 89.1,180.1 96,135.2 76.7,135.2"></polygon>
    </g>
  </svg>`;
    }
    function generateInActiveHtml(item) {
        return `<template><div class="slds-card slds-p-around_medium slds-size_1-of-1">
                          There is no active instance of <br>
                          <b>CARD</b> ${item.Name}
                      </div></template>`;
    }
    function generateJsMetaXML(lwcComponentName, cardObj, metaObject) {
        const isActive = cardObj.IsActive;
        const isChildCard = cardObj.IsChildCard || cardObj.Type && cardObj.Type.toLowerCase() === "child";
        let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>
    <LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
      <apiVersion>${isActive ? metaObject?.apiVersion || defaultXmlConfig.api : defaultXmlConfig.api}</apiVersion>
      <isExposed>true</isExposed>
      <masterLabel>${isActive ? metaObject?.masterLabel || cardObj.Name : lwcComponentName}</masterLabel>
      `;
        if (metaObject?.description) {
            xmlStr += `<description>${metaObject?.description}</description>
      `;
        }
        if (isInsidePackge) {
            xmlStr += `<runtimeNamespace>${nsPrefix}</runtimeNamespace>
      `;
        }
        if (isActive) {
            /**
             * This change was done to support backward compatibility post 246 change
             * Pre 246 users could expose childcards to lightning pages
             */
            let targetStr = "";
            if (metaObject?.targets?.target?.length) {
                targetStr = `<targets>
        `;
                metaObject.targets.target.forEach(target => {
                    targetStr += `<target>${target}</target>
          `;
                });
                targetStr += `</targets>
        `;
            } else {
                if (!isChildCard) {
                    targetStr = `<targets>
          `;
                    defaultXmlConfig.targets.forEach(target => {
                        targetStr += `<target>${target}</target>
            `;
                    });
                    targetStr += `</targets>
        `;
                }
            }
            xmlStr += targetStr;
            if (targetStr !== "") {
                xmlStr += getTargetConfigByTarget(metaObject, targetStr);
            }
        }
        xmlStr += `</LightningComponentBundle>`;
        return xmlStr;
    }
    function getTargetConfigByTarget(metaObject, targetStr) {
        let targetConfigsStr = "";
        let targetConfig = "";
        if (metaObject?.targetConfigs) {
            targetConfigsStr = `<targetConfigs>
      ${window.atob(metaObject.targetConfigs)}
      </targetConfigs>`;
        } else {
            const targetElements = Array.from(XML.getElementsByTagName(targetStr, "target"));
            targetElements.map(target => {
                if (target.textContent === "lightning__AppPage") targetConfig += defaultXmlConfig.appPageConfig;
                if (target.textContent === "lightning__RecordPage") targetConfig += defaultXmlConfig.recordPageConfig;
            });
            if (targetConfig) {
                targetConfigsStr = `<targetConfigs>
        ${targetConfig}
        </targetConfigs>`;
            }
        }
        return targetConfigsStr;
    }

    //get all components files
    export function generateLWCFiles(lwcComponentName, item, type, mode = null, metaObject) {
        let files: any[] = [];
        let jsSource, defSource, htmlSource, cssSource, styleDefSource, xmlSource;
        let actualNsPrefix = nsPrefix; //for restoring nsPrefix later
        if (mode === DOWNLOAD_OFF_PLATFORM_MODE) {
            downloadMode = DOWNLOAD_OFF_PLATFORM_MODE;
        }
        if (isInsidePackge && mode === DOWNLOAD_OFF_PLATFORM_MODE) {
            nsPrefix = "c";
        }
        let layoutDefinition = item.PropertySetConfig;
        actionElementsSlotObject = {};
        if (layoutDefinition && typeof layoutDefinition === "string") {
            layoutDefinition = JSON.parse(layoutDefinition);
        }
        let theme = layoutDefinition.theme || "slds";
        let customCssAttachmentId = item.Attachments && item.Attachments[0] && item.Attachments[0].Id;
        let cardRecordId = item.Id;
        if (type === "card" && !isStdRuntime) {
            htmlSource = generateCardHtml(layoutDefinition, theme, item);
            jsSource = generateCardJs(lwcComponentName, theme, item.Label, layoutDefinition, cardRecordId, customCssAttachmentId);
            cssSource = typeof item.StylingConfiguration === "string" ? JSON.parse(item.StylingConfiguration).customStyles ? JSON.parse(item.StylingConfiguration).customStyles : "/*Custom Styles*/" : item.StylingConfiguration ? item.StylingConfiguration.customStyles ? item.StylingConfiguration.customStyles : "/*Custom Styles*/" : "/*Custom Styles*/";
            defSource = generateDefinition(item);
            styleDefSource = generataStyleDefinition();
            xmlSource = generateJsMetaXML(lwcComponentName, item, metaObject).trim();
        } else if (type === "card" && isStdRuntime) {
            htmlSource = generateStandardRuntimeWrapperHtml(item.Name, layoutDefinition, nsPrefix);
            jsSource = generateStandardRuntimeWrapperJs(lwcComponentName, layoutDefinition, nsPrefix);
            cssSource = "/* intentionally empty */";
            xmlSource = generateJsMetaXML(lwcComponentName, item, metaObject).trim();
        }
        files.push({
            name: `${lwcComponentName}.js`,
            source: jsSource,
            filepath: `lwc/${lwcComponentName}/${lwcComponentName}.js`,
            format: "js"
        });
        if (defSource) {
            files.push({
                name: `definition.js`,
                source: defSource,
                filepath: `lwc/${lwcComponentName}/definition.js`,
                format: "js"
            });
        }
        if (styleDefSource) {
            files.push({
                name: `styleDefinition.js`,
                source: styleDefSource,
                filepath: `lwc/${lwcComponentName}/styleDefinition.js`,
                format: "js"
            });
        }
        files.push({
            name: `${lwcComponentName}.html`,
            source: htmlSource,
            filepath: `lwc/${lwcComponentName}/${lwcComponentName}.html`,
            format: "html"
        });
        files.push({
            name: `${lwcComponentName}.svg`,
            source: getComponentSvg(),
            filepath: `lwc/${lwcComponentName}/${lwcComponentName}.svg`,
            format: "svg"
        });
        files.push({
            name: `${lwcComponentName}.css`,
            source: cssSource,
            filepath: `lwc/${lwcComponentName}/${lwcComponentName}.css`,
            format: "css"
        });
        files.push({
            name: `${lwcComponentName}.js-meta.xml`,
            source: xmlSource,
            filepath: `lwc/${lwcComponentName}/${lwcComponentName}.js-meta.xml`,
            format: "xml"
        });
        files.push({
            name: `package.xml`,
            source: `<?xml version="1.0" encoding="UTF-8"?>
    <Package xmlns="http://soap.sforce.com/2006/04/metadata">
      <types>
        <members>*</members>
        <name>LightningComponentBundle</name>
      </types>
      <version>${defaultXmlConfig.api}</version>
    </Package>`,
            filepath: `package.xml`,
            format: "xml"
        });
        if (isInsidePackge && mode === DOWNLOAD_OFF_PLATFORM_MODE) {
            nsPrefix = actualNsPrefix; //to restore nsPrefix
        }
        return files;
    }

    function getDevNamefromCardname(cardName) {
        const name = downloadMode === DOWNLOAD_OFF_PLATFORM_MODE ? cardName : lwcPrefix + "-" + cardName;
        return convertNameToValidLWCCase(name);
    }

    function getRecordWireAdapter(events) {
        let wireAdapterStr = "";
        if (events && events.length) {
            events.forEach((event, index) => {
                if (event.eventtype === "recordChange" && event.sobject) {
                    wireAdapterStr = wireAdapterStr + ` 
            firstRender${index} = true;
            @wire(getRecord , {recordId: ${event.recordId.indexOf("{") !== -1 ? '"$recordId"' : `"${event.recordId}"`} , fields:"${event.sobject}.Id",`;
                    wireAdapterStr = wireAdapterStr + (event.optionalFields ? `optionalFields: $cmp.getWireOptionalFields(data.events[${index}])` : "");
                    wireAdapterStr = wireAdapterStr + `})
              wiredRecord${index}({ error, data }){
                if (this.objectApiName === '${event.sobject}'){
                  if(data && this.firstRender${index}){
                    this.firstRender${index} = false;
                    return;
                  }else{
                    this.recordChangeEventHandler(error,data,${index})
                  }
                }
              }
            `;
                }
            });
        }
        return wireAdapterStr;
    }

    export function convertNameToValidLWCCase(str) {
        return str.replace(/\s(.)/g, function (a) {
            return a.toUpperCase();
        }).replace(/\s/g, "").replace(/^(.)/, function (b) {
            return b.toLowerCase();
        }).replace(/-(\w)/g, m => m[1].toUpperCase()).replace(/__/g, "_");
    }
}