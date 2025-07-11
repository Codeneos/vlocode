import { removeNamespacePrefix } from '@vlocode/util';
import { DatapackFields } from './datapack';
import { SalesforceQueryData } from '@vlocode/salesforce';

/**
 * Interface defining the query properties for a datapack type
 */
export interface DatapackTypeDefinition {
    /**
     * Name of the datapack type
     */
    datapackType: string;

    /*
    * Human friendnamly of the datapack type
    */
    typeLabel: string;

    /**
     * Defines the source query how to retrieve the datapack records from Salesforce.
     */
    source: SalesforceQueryData;
    
    /**
     * Function to format the name of the datapack for display in the UI
     */
    displayName?: string | ((record: any) => string);

    /**
     * Description of a single datapack for the UI. Single line format.
     */
    description?: string | ((record: any) => string);
    
    /**
     * Defines optional grouping logic for the datapack type.
     */
    grouping?: {
        fields: string[];
        displayName: string | ((record: any) => string);
    }
    
    /**
     * Allows overwriting the default Salesforce URL for the datapack type.
     */
    salesforceUrl?: ((record: any) => string) | Record<string, ((record: any) => string)>;
    
    /**
     * Allows changing the default Matching Key for the datapack type.
     */
    matchingKey?: {
        fields: string[];
        returnField?: string;
    };
}

/**
 * Complete datapack query definitions
 */
export const DatapackTypeDefinitions: Record<string, DatapackTypeDefinition | DatapackTypeDefinition[]> = {
    VlocityUILayout: {
        typeLabel: "Vlocity UI Layout",
        datapackType: "VlocityUILayout",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityUILayout__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__Author__c", "%vlocity_namespace%__Active__c"],
            whereCondition: "%vlocity_namespace%__Active__c = true"
        },
        grouping: {
            fields: ["Name"],
            displayName: "Name"
        },
        salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__carddesignernew?id=${record.Id}`,
        displayName: (record: any) => `Version ${record.Version__c || 0}`,
        description: (record: any) => `${record.Author__c}${record.Active__c ? (record.Author__c ? ' - ' : '') + 'Active' : ''}`,
        matchingKey: {
            fields: ["Name", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__Author__c"]
        }
    },
    OmniScript: [
        {
            typeLabel: "OmniScript",
            datapackType: "OmniScript",
            source: {
                sobjectType: "%vlocity_namespace%__OmniScript__c",
                fieldList: ["Id", "Name", "LastModifiedDate", "%vlocity_namespace%__IsLwcEnabled__c", "%vlocity_namespace%__Type__c", "%vlocity_namespace%__SubType__c", "%vlocity_namespace%__Language__c", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__IsActive__c"],
                whereCondition: "%vlocity_namespace%__IsProcedure__c = false",
                orderBy: ["%vlocity_namespace%__Version__c"]
            },
            salesforceUrl: {
                'Standard Designer (Summer \'25)': (record: any) => `/builder_omnistudio/omnistudioBuilder.app?type=omniscript&id=${record.Id}`,
                'LWC Designer': (record: any) => `/lightning/cmp/%vlocity_namespace%__OmniDesignerAuraWrapper?c__recordId=${record.Id}`,
                'Classic Designer': (record: any) => `/apex/%vlocity_namespace%__omniscriptdesigner?id=${record.Id}`
            },            
            displayName: (record: any) => `Version ${record.Version__c || 0}`,
            description: (record: any) => `${record.IsActive__c ? 'Active - ' : ''}${record.IsLwcEnabled__c ? 'LWC' : 'classic'}`,
            grouping: {
                fields: ["Type__c", "SubType__c", "Language__c"],
                displayName: (record: any) => `${record.Type__c}/${record.SubType__c} (${record.Language__c})`
            },
            matchingKey: {
                fields: ["%vlocity_namespace%__SubType__c", "%vlocity_namespace%__Type__c", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__Language__c"]
            }
        }, 
        {
            typeLabel: "OmniScript (OmniProcess)",
            datapackType: "OmniScript",
            source: {
                sobjectType: "OmniProcess",
                fieldList: ["Id", "Name", "LastModifiedDate", "Type", "SubType", "Language", "VersionNumber", "IsActive"],
                whereCondition: "IsIntegrationProcedure = false",
                orderBy: ["VersionNumber"]
            },
            salesforceUrl: {
                'Standard Designer (Summer \'25)': (record: any) => `/apex/%vlocity_namespace%__integrationproceduredesigner?id=${record.Id}`,
                'LWC Designer': (record: any) => `/lightning/cmp/%vlocity_namespace%__OmniDesignerAuraWrapper?c__recordId=${record.Id}`,
                'Classic Designer': (record: any) => `/apex/%vlocity_namespace%__omniscriptdesigner?id=${record.Id}`
            },
            displayName: (record: any) => `Version ${record.VersionNumber || 0}`,
            description: (record: any) => `${record.IsActive ? 'Active' : ''}`,
            grouping: {
                fields: ["Type", "SubType", "Language"],
                displayName: (record: any) => `${record.Type}/${record.SubType} (${record.Language})`
            },
            matchingKey: {
                fields: ["SubType", "Type", "VersionNumber", "Language"]
            }
        }
    ],
    IntegrationProcedure: [
        {
            typeLabel: "Integration Procedure",
            datapackType: "IntegrationProcedure",
            source: {
                sobjectType: "%vlocity_namespace%__OmniScript__c",
                fieldList: ["Id", "Name", "%vlocity_namespace%__Type__c", "%vlocity_namespace%__SubType__c", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__IsActive__c"],
                whereCondition: "%vlocity_namespace%__IsProcedure__c = true"
            },
            salesforceUrl: {
                'Standard Designer (Summer \'25)': (record: any) => `/builder_industries_interaction_rule/industriesBuilder.app?recordId=${record.Id}`,
                'Classic Package Designer': (record: any) => `/apex/%vlocity_namespace%__integrationproceduredesigner?id=${record.Id}`
            },
            displayName: (record: any) => `Version ${record.Version__c || 0}`,
            description: (record: any) => record.IsActive__c ? 'Active' : '',
            grouping: {
                fields: ["Type__c", "SubType__c"],
                displayName: (record: any) => `${record.Type__c}/${record.SubType__c}`
            },
            matchingKey: {
                fields: ["%vlocity_namespace%__SubType__c", "%vlocity_namespace%__Type__c", "%vlocity_namespace%__Version__c"]
            }
        }, 
        {
            typeLabel: "Integration Procedure (OmniProcess)",
            datapackType: "IntegrationProcedure",
            source: {
                sobjectType: "OmniProcess",
                fieldList: ["Id", "Name", "LastModifiedDate", "Type", "SubType", "VersionNumber", "IsActive"],
                whereCondition: "IsIntegrationProcedure = true",
                orderBy: ["Type", "SubType", "VersionNumber"] 
            },
            salesforceUrl: {
                'Standard Designer (Summer \'25)': (record: any) => `/builder_industries_interaction_rule/industriesBuilder.app?recordId=${record.Id}`,
                'Classic Package Designer': (record: any) => `/apex/%vlocity_namespace%__integrationproceduredesigner?id=${record.Id}`
            },
            displayName: (record: any) => `Version ${record.VersionNumber || 0}`,
            description: (record: any) => `${record.IsActive ? 'Active' : ''}`,
            grouping: {
                fields: ["Type", "SubType"],
                displayName: (record: any) => `${record.Type}/${record.SubType}`
            },
            matchingKey: {
                fields: ["SubType", "Type", "VersionNumber"]
            }
        }
    ],
    DataRaptor: [
        {
            typeLabel: "DataRaptor",
            datapackType: "DataRaptor",
            source: {
                sobjectType: "%vlocity_namespace%__DRBundle__c",
                fieldList: ["Id", "Name"],
                whereCondition: "%vlocity_namespace%__Type__c != 'Migration'"
            },
            salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__drmapper?id=${record.Id}`,
            matchingKey: {
                fields: ["Name"]
            }
        },{
            typeLabel: "DataMapper (OmniDataTransform)",
            datapackType: "DataRaptor",
            source: {
                sobjectType: "OmniDataTransform",
                fieldList: ["Id", "Name"]
            },
            salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__drmapper?id=${record.Id}`,
            matchingKey: {
                fields: ["Name"]
            }
        }
    ],
    VlocityCard: {
        typeLabel: "Vlocity Card",
        datapackType: "VlocityCard",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityCard__c",
            fieldList: ["Id", "Name", "LastModifiedDate", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__Active__c", "%vlocity_namespace%__Author__c"]
        },
        grouping: {
            fields: ["Name"],
            displayName: "Name"
        },
        salesforceUrl: {
            'Standard Designer (Summer \'25)': (record: any) => `/builder_omnistudio/omnistudioBuilder.app?type=flexcard&id=${record.Id}`,
            'Classic Designer': (record: any) => `/apex/%vlocity_namespace%__carddesignernew?id=${record.Id}`,
        },
        matchingKey: {
            fields: ["Name", "%vlocity_namespace%__Version__c", "%vlocity_namespace%__Author__c"]
        }
    },    
    FlexCard: {
        typeLabel: "FlexCard",
        datapackType: "FlexCard",
        source: {
            sobjectType: "OmniUiCard",
            fieldList: ["Id", "Name"],
            whereCondition: "IsActive = true"
        }
    },
    AttributeAssignmentRule: {
        typeLabel: "Attribute Assignment Rule",
        datapackType: "AttributeAssignmentRule",
        source: {
            sobjectType: "%vlocity_namespace%__AttributeAssignmentRule__c",
            fieldList: ["Id", "Name"]
        }
    },
    AttributeCategory: {
        typeLabel: "Attribute Category",
        datapackType: "AttributeCategory",
        source: {
            sobjectType: "%vlocity_namespace%__AttributeCategory__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__Code__c"]
        },
        displayName: (record: any) => `${record.Name} - ${record.UIControlType__c ?? record.Code__c ?? ''}`.replace(/ - $/, "")
    },
    CalculationMatrix: {
        typeLabel: "Calculation Matrix",
        datapackType: "CalculationMatrix",
        source: {
            sobjectType: "%vlocity_namespace%__CalculationMatrix__c",
            fieldList: ["Id", "Name"]
        }
    },
    CalculationMatrixVersion: {
        typeLabel: "Calculation Matrix Version",
        datapackType: "CalculationMatrixVersion",
        source: {
            sobjectType: "%vlocity_namespace%__CalculationMatrixVersion__c",
            fieldList: ["Id", "Name"],
            whereCondition: "%vlocity_namespace%__IsEnabled__c = true"
        }
    },
    CalculationProcedure: {
        typeLabel: "Calculation Procedure",
        datapackType: "CalculationProcedure",
        source: {
            sobjectType: "%vlocity_namespace%__CalculationProcedure__c",
            fieldList: ["Id", "Name"]
        },
        salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__VlocityIntelligenceMachineEdit?id=${record.Id}`
    },
    CalculationProcedureVersion: {
        typeLabel: "Calculation Procedure Version",
        datapackType: "CalculationProcedureVersion",
        source: {
            sobjectType: "%vlocity_namespace%__CalculationProcedureVersion__c",
            fieldList: ["Id", "Name"],
            whereCondition: "%vlocity_namespace%__IsEnabled__c = true"
        }
    },
    Catalog: {
        typeLabel: "Catalog",
        datapackType: "Catalog",
        source: {
            sobjectType: "%vlocity_namespace%__Catalog__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c", "%vlocity_namespace%__CatalogCode__c"]
        }
    },
    ChargeMeasurement: {
        typeLabel: "Charge Measurement",
        datapackType: "ChargeMeasurement",
        source: {
            sobjectType: "%vlocity_namespace%__ChargeMeasurement__c",
            fieldList: ["Id", "Name"]
        }
    },
    ContentVersion: {
        typeLabel: "Content Version",
        datapackType: "ContentVersion",
        source: {
            sobjectType: "ContentVersion",
            fieldList: ["Id", "Title", "%vlocity_namespace%__GlobalKey__c"],
            whereCondition: "%vlocity_namespace%__GlobalKey__c != null"
        },
        displayName: (record: any) => record.Title
    },
    ContextAction: {
        typeLabel: "Context Action",
        datapackType: "ContextAction",
        source: {
            sobjectType: "%vlocity_namespace%__ContextAction__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    ContextDimension: {
        typeLabel: "Context Dimension",
        datapackType: "ContextDimension",
        source: {
            sobjectType: "%vlocity_namespace%__ContextDimension__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    ContextScope: {
        typeLabel: "Context Scope",
        datapackType: "ContextScope",
        source: {
            sobjectType: "%vlocity_namespace%__ContextScope__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    ContractType: {
        typeLabel: "Contract Type",
        datapackType: "ContractType",
        source: {
            sobjectType: "%vlocity_namespace%__ContractType__c",
            fieldList: ["Id", "Name"]
        }
    },
    CpqConfigurationSetup: {
        typeLabel: "CPQ Configuration Setup",
        datapackType: "CpqConfigurationSetup",
        source: {
            sobjectType: "%vlocity_namespace%__CpqConfigurationSetup__c",
            fieldList: ["Id", "Name"]
        }
    },
    CustomFieldMap: {
        typeLabel: "Custom Field Map",
        datapackType: "CustomFieldMap",
        source: {
            sobjectType: "%vlocity_namespace%__CustomFieldMap__c",
            fieldList: ["Id", "Name"]
        }
    },
    CustomObjectMap: {
        typeLabel: "Custom Object Map",
        datapackType: "CustomObjectMap",
        source: {
            sobjectType: "%vlocity_namespace%__CustomObjectMap__c",
            fieldList: ["Id", "Name"]
        }
    },
    DecisionMatrix: {
        typeLabel: "Decision Matrix",
        datapackType: "DecisionMatrix",
        source: {
            sobjectType: "CalculationMatrix",
            fieldList: ["Id", "Name"]
        }
    },
    DecisionMatrixVersion: {
        typeLabel: "Decision Matrix Version",
        datapackType: "DecisionMatrixVersion",
        source: {
            sobjectType: "CalculationMatrixVersion",
            fieldList: ["Id", "Name"]
        }
    },
    Document: {
        typeLabel: "Document",
        datapackType: "Document",
        source: {
            sobjectType: "Document",
            fieldList: ["Id", "DeveloperName"]
        }
    },
    DocumentClause: {
        typeLabel: "Document Clause",
        datapackType: "DocumentClause",
        source: {
            sobjectType: "%vlocity_namespace%__DocumentClause__c",
            fieldList: ["Id", "Name"]
        }
    },
    DocumentTemplate: {
        typeLabel: "Document Templates (Industries CLM)",
        datapackType: "DocumentTemplate",
        source: {
            sobjectType: "%vlocity_namespace%__DocumentTemplate__c",
            fieldList: ["Id", "Name"]
        }
    },
    DocumentTemplates: {
        typeLabel: "Document Templates (Salesforce Contracts)",
        datapackType: "DocumentTemplates",
        source: {
            sobjectType: "DocumentTemplate",
            fieldList: ["Id", "Name", "VersionNumber", "Status"]
        },
        matchingKey: {
            fields: [ 'GlobalKey' ],
            returnField: 'Id'
        },
        displayName: (record: any) => `${record.Name} v${record.VersionNumber} (${record.Status})`,
    },
    EntityFilter: {
        typeLabel: "Entity Filter",
        datapackType: "EntityFilter",
        source: {
            sobjectType: "%vlocity_namespace%__EntityFilter__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    ExpressionSet: {
        typeLabel: "Expression Set",
        datapackType: "ExpressionSet",
        source: {
            sobjectType: "CalculationProcedure",
            fieldList: ["Id", "Name"]
        }
    },
    ExpressionSetVersion: {
        typeLabel: "Expression Set Version",
        datapackType: "ExpressionSetVersion",
        source: {
            sobjectType: "CalculationProcedureVersion",
            fieldList: ["Id", "Name"]
        }
    },
    GeneralSettings: {
        typeLabel: "General Settings",
        datapackType: "GeneralSettings",
        source: {
            sobjectType: "%vlocity_namespace%__GeneralSettings__c",
            fieldList: ["Id", "Name"]
        }
    },
    IntegrationProcedureVersion: {
        typeLabel: "Integration Procedure Version",
        datapackType: "IntegrationProcedureVersion",
        source: {
            sobjectType: "%vlocity_namespace%__OmniScript__c",
            fieldList: ["Id", "%vlocity_namespace%__Type__c", "%vlocity_namespace%__SubType__c", "%vlocity_namespace%__Version__c"],
            whereCondition: "%vlocity_namespace%__IsProcedure__c = true"
        }
    },
    IntegrationRetryPolicy: {
        typeLabel: "Integration Retry Policy",
        datapackType: "IntegrationRetryPolicy",
        source: {
            sobjectType: "%vlocity_namespace%__IntegrationRetryPolicy__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    InterfaceImplementation: {
        typeLabel: "Interface Implementation",
        datapackType: "InterfaceImplementation",
        source: {
            sobjectType: "%vlocity_namespace%__InterfaceImplementation__c",
            fieldList: ["Id", "Name"]
        }
    },
    ItemImplementation: {
        typeLabel: "Item Implementation",
        datapackType: "ItemImplementation",
        source: {
            sobjectType: "%vlocity_namespace%__ItemImplementation__c",
            fieldList: ["Id", "Name"]
        }
    },
    ManualQueue: {
        typeLabel: "Manual Queue",
        datapackType: "ManualQueue",
        source: {
            sobjectType: "%vlocity_namespace%__ManualQueue__c",
            fieldList: ["Id", "Name"]
        }
    },
    ObjectClass: {
        typeLabel: "Object Class",
        datapackType: "ObjectClass",
        source: {
            sobjectType: "%vlocity_namespace%__ObjectClass__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    ObjectContextRule: {
        typeLabel: "Object Context Rule",
        datapackType: "ObjectContextRule",
        source: {
            sobjectType: "%vlocity_namespace%__ObjectRuleAssignment__c",
            fieldList: ["Id", "Name"]
        }
    },
    ObjectLayout: {
        typeLabel: "Object Layout",
        datapackType: "ObjectLayout",
        source: {
            sobjectType: "%vlocity_namespace%__ObjectLayout__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    OfferMigrationPlan: {
        typeLabel: "Offer Migration Plan",
        datapackType: "OfferMigrationPlan",
        source: {
            sobjectType: "%vlocity_namespace%__OfferMigrationPlan__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__Code__c"]
        }
    },
    OmniScriptVersion: {
        typeLabel: "OmniScript Version",
        datapackType: "OmniScriptVersion",
        source: {
            sobjectType: "%vlocity_namespace%__OmniScript__c",
            fieldList: ["Id", "%vlocity_namespace%__Type__c", "%vlocity_namespace%__SubType__c", "%vlocity_namespace%__Language__c", "%vlocity_namespace%__Version__c"],
            whereCondition: "%vlocity_namespace%__IsProcedure__c = false"
        }
    },
    OrchestrationDependencyDefinition: {
        typeLabel: "Orchestration Dependency Definition",
        datapackType: "OrchestrationDependencyDefinition",
        source: {
            sobjectType: "%vlocity_namespace%__OrchestrationDependencyDefinition__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    OrchestrationItemDefinition: {
        typeLabel: "Orchestration Item Definition",
        datapackType: "OrchestrationItemDefinition",
        source: {
            sobjectType: "%vlocity_namespace%__OrchestrationItemDefinition__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__OrchestrationPlanDefinitionId__r.Name"]
        }
    },
    OrchestrationPlanDefinition: {
        typeLabel: "Orchestration Plan Definition",
        datapackType: "OrchestrationPlanDefinition",
        source: {
            sobjectType: "%vlocity_namespace%__OrchestrationPlanDefinition__c",
            fieldList: ["Id", "Name"]
        }
    },
    OrchestrationQueueAssignmentRule: {
        typeLabel: "Orchestration Queue Assignment Rule",
        datapackType: "OrchestrationQueueAssignmentRule",
        source: {
            sobjectType: "%vlocity_namespace%__OrchestrationQueueAssignmentRule__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    PriceList: {
        typeLabel: "Price List",
        datapackType: "PriceList",
        source: {
            sobjectType: "%vlocity_namespace%__PriceList__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__Code__c"]
        }
    },
    Pricebook2: {
        typeLabel: "Pricebook2",
        datapackType: "Pricebook2",
        source: {
            sobjectType: "Pricebook2",
            fieldList: ["Id", "Name"]
        }
    },
    PricingPlan: {
        typeLabel: "Pricing Plan",
        datapackType: "PricingPlan",
        source: {
            sobjectType: "%vlocity_namespace%__PricingPlan__c",
            fieldList: ["Id", "Name"]
        }
    },
    PricingVariable: {
        typeLabel: "Pricing Variable",
        datapackType: "PricingVariable",
        source: {
            sobjectType: "%vlocity_namespace%__PricingVariable__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__Code__c"]
        }
    },
    Product2: {
        typeLabel: "Product2",
        datapackType: "Product2",
        source: {
            sobjectType: "Product2",
            fieldList: ["Id", "Name", "ProductCode", "%vlocity_namespace%__GlobalKey__c"]
        },
        displayName: (record: any) => `${record.Name} (${record.ProductCode})`
    },
    ProductAttributes: {
        typeLabel: "Product Attributes",
        datapackType: "ProductAttributes",
        source: {
            sobjectType: "Product2",
            fieldList: ["Id", "Name", "ProductCode", "%vlocity_namespace%__GlobalKey__c"]
        },
        displayName: (record: any) => `${record.Name} (${record.ProductCode})`
    },
    ProductConfiguration: {
        typeLabel: "Product Configuration",
        datapackType: "ProductConfiguration",
        source: {
            sobjectType: "Product2",
            fieldList: ["Id", "Name", "ProductCode", "%vlocity_namespace%__GlobalKey__c"]
        },
        displayName: (record: any) => `${record.Name} (${record.ProductCode})`
    },
    ProductDecomposition: {
        typeLabel: "Product Decomposition",
        datapackType: "ProductDecomposition",
        source: {
            sobjectType: "Product2",
            fieldList: ["Id", "Name", "ProductCode", "%vlocity_namespace%__GlobalKey__c"]
        },
        displayName: (record: any) => `${record.Name} (${record.ProductCode})`
    },
    ProductHierarchy: {
        typeLabel: "Product Hierarchy",
        datapackType: "ProductHierarchy",
        source: {
            sobjectType: "Product2",
            fieldList: ["Id", "Name", "ProductCode", "%vlocity_namespace%__GlobalKey__c"]
        },
        displayName: (record: any) => `${record.Name} (${record.ProductCode})`
    },
    ProductPricing: {
        typeLabel: "Product Pricing",
        datapackType: "ProductPricing",
        source: {
            sobjectType: "Product2",
            fieldList: ["Id", "Name", "ProductCode", "%vlocity_namespace%__GlobalKey__c"]
        },
        displayName: (record: any) => `${record.Name} (${record.ProductCode})`
    },
    Project: {
        typeLabel: "Project",
        datapackType: "Project",
        source: {
            sobjectType: "%vlocity_namespace%__Project__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    Promotion: {
        typeLabel: "Promotion",
        datapackType: "Promotion",
        source: {
            sobjectType: "%vlocity_namespace%__Promotion__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    QueryBuilder: {
        typeLabel: "Query Builder",
        datapackType: "QueryBuilder",
        source: {
            sobjectType: "%vlocity_namespace%__QueryBuilder__c",
            fieldList: ["Id"]
        }
    },
    RateBand: {
        typeLabel: "Rate Band",
        datapackType: "RateBand",
        source: {
            sobjectType: "%vlocity_namespace%__RateBand__c",
            fieldList: ["Id", "Name"]
        }
    },
    RelationshipGraph: {
        typeLabel: "Relationship Graph",
        datapackType: "RelationshipGraph",
        source: {
            sobjectType: "%vlocity_namespace%__RelationshipGraph__c",
            fieldList: ["Id", "Name"]
        }
    },
    Rule: {
        typeLabel: "Rule",
        datapackType: "Rule",
        source: {
            sobjectType: "%vlocity_namespace%__Rule__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    SpecTemplateMapping: {
        typeLabel: "Spec Template Mapping",
        datapackType: "SpecTemplateMapping",
        source: {
            sobjectType: "%vlocity_namespace%__SpecTemplateMapping__c",
            fieldList: ["Id", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    StoryObjectConfiguration: {
        typeLabel: "Story Object Configuration",
        datapackType: "StoryObjectConfiguration",
        source: {
            sobjectType: "%vlocity_namespace%__StoryObjectConfiguration__c",
            fieldList: ["Id", "Name"]
        }
    },
    String: {
        typeLabel: "String (Localization)",
        datapackType: "String",
        source: {
            sobjectType: "%vlocity_namespace%__String__c",
            fieldList: ["Id", "Name"]
        }
    },
    System: {
        typeLabel: "System",
        datapackType: "System",
        source: {
            sobjectType: "%vlocity_namespace%__System__c",
            fieldList: ["Id", "Name"]
        }
    },
    ThorOrchestrationQueue: {
        typeLabel: "Thor Orchestration Queue",
        datapackType: "ThorOrchestrationQueue",
        source: {
            sobjectType: "%vlocity_namespace%__ThorOrchestrationQueue__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    TimePlan: {
        typeLabel: "Time Plan",
        datapackType: "TimePlan",
        source: {
            sobjectType: "%vlocity_namespace%__TimePlan__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    TimePolicy: {
        typeLabel: "Time Policy",
        datapackType: "TimePolicy",
        source: {
            sobjectType: "%vlocity_namespace%__TimePolicy__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    UIFacet: {
        typeLabel: "UI Facet",
        datapackType: "UIFacet",
        source: {
            sobjectType: "%vlocity_namespace%__UIFacet__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    UISection: {
        typeLabel: "UI Section",
        datapackType: "UISection",
        source: {
            sobjectType: "%vlocity_namespace%__UISection__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VlocityAction: {
        typeLabel: "Vlocity Action",
        datapackType: "VlocityAction",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityAction__c",
            fieldList: ["Id", "Name"],
            whereCondition: "%vlocity_namespace%__IsActive__c = true"
        }
    },
    VlocityAttachment: {
        typeLabel: "Vlocity Attachment",
        datapackType: "VlocityAttachment",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityAttachment__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VlocityDataStore: {
        typeLabel: "Vlocity Data Store",
        datapackType: "VlocityDataStore",
        source: {
            sobjectType: "%vlocity_namespace%__Datastore__c",
            fieldList: ["Id", "Name"]
        }
    },
    VlocityFunction: {
        typeLabel: "Vlocity Function",
        datapackType: "VlocityFunction",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityFunction__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VlocityPicklist: {
        typeLabel: "Vlocity Picklist",
        datapackType: "VlocityPicklist",
        source: {
            sobjectType: "%vlocity_namespace%__Picklist__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VlocityScheduledJob: {
        typeLabel: "Vlocity Scheduled Job",
        datapackType: "VlocityScheduledJob",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityScheduledJob__c",
            fieldList: ["Id", "Name", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VlocitySearchWidgetSetup: {
        typeLabel: "Vlocity Search Widget Setup",
        datapackType: "VlocitySearchWidgetSetup",
        source: {
            sobjectType: "%vlocity_namespace%__VlocitySearchWidgetSetup__c",
            fieldList: ["Id", "Name"]
        }
    },
    VlocityStateModel: {
        typeLabel: "Vlocity State Model",
        datapackType: "VlocityStateModel",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityStateModel__c",
            fieldList: ["Id", "Name"]
        }
    },
    VlocityUITemplate: {
        typeLabel: "Vlocity UI Template",
        datapackType: "VlocityUITemplate",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityUITemplate__c",
            fieldList: ["Id", "Name"],
            whereCondition: "%vlocity_namespace%__Active__c = true"
        },
        salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__uitemplatedesigner?id=${record.Id}`
    },
    VlocityWebTrackingConfiguration: {
        typeLabel: "Vlocity Web Tracking Configuration",
        datapackType: "VlocityWebTrackingConfiguration",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityWebTrackingConfiguration__c",
            fieldList: ["Id", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VlocityTrackingGroup: {
        typeLabel: "Vlocity Tracking Group",
        datapackType: "VlocityTrackingGroup",
        source: {
            sobjectType: "%vlocity_namespace%__VlocityTrackingGroup__c",
            fieldList: ["Id", "%vlocity_namespace%__GlobalKey__c"]
        }
    },
    VqMachine: {
        typeLabel: "VQ Machine",
        datapackType: "VqMachine",
        source: {
            sobjectType: "%vlocity_namespace%__VqMachine__c",
            fieldList: ["Id", "Name"]
        },
        salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__VlocityIntelligenceMachineEdit?id=${record.Id}`
    },
    VqResource: {
        typeLabel: "VQ Resource",
        datapackType: "VqResource",
        source: {
            sobjectType: "%vlocity_namespace%__VqResource__c",
            fieldList: ["Id", "Name"]
        },
        salesforceUrl: (record: any) => `/apex/%vlocity_namespace%__VlocityIntelligenceResourceEdit?id=${record.Id}`
    }
};

type DatapackTypeRef = 
    { datapackType: string, sobjectType?: string } | 
    { [DatapackFields.dataPackType]: string, [DatapackFields.sobjectType]: string } |
    string;

function normalizeTypeRef(datapack: DatapackTypeRef) {
    const datapackType = typeof datapack === 'string' ? datapack : DatapackFields.dataPackType in datapack ? datapack[DatapackFields.dataPackType] : datapack.datapackType;
    const sobjectType = typeof datapack === 'string' ? undefined : DatapackFields.dataPackType in datapack ? datapack[DatapackFields.sobjectType] : datapack.sobjectType;
    return { datapackType, sobjectType };
}

/**
 * Retrieves the datapack type definition for a given datapack input.
 *
 * The input can be:
 * - An object with `sobjectType` and `datapackType` properties,
 * - An object with keys defined by `DatapackFields.dataPackType` and `DatapackFields.sobjectType`,
 * - Or a string representing the datapack type.
 *
 * If the definition for the datapack type is an array, and an object type is provided,
 * it returns the definition matching the object's sObject type. If no object type is provided,
 * it returns the first definition in the array.
 * If the definition is not an array, it returns the definition directly.
 *
 * @param datapack - The datapack input, which can be a string or an object with datapack type and sObject type information.
 * @returns The datapack type definition, or `undefined` if not found.
 */
export function getDatapackTypeDefinition(datapack: DatapackTypeRef) {
    const { datapackType, sobjectType } = normalizeTypeRef(datapack);
    const definition = DatapackTypeDefinitions[datapackType];
    if (Array.isArray(definition)) {
        if (!sobjectType) {
            return definition[0];
        }
        return definition.find(def => removeNamespacePrefix(def.source.sobjectType) === removeNamespacePrefix(sobjectType));
    }
    return definition;
}