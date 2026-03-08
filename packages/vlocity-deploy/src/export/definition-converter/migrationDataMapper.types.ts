
export interface MigrationDataMapperItemRecord {
    readonly id: string;
    readonly name: string;
    readonly mapId: string;
    readonly globalKey?: string;

    readonly configurationAttribute?: string;
    readonly configurationCategory?: 'PUT' | 'Ignore Field' | 'Parent' | 'Sibling' | 'Children'| 'Allow Missing Reference';
    readonly configurationValue?: string;
    readonly configurationProcess?: 'Import' | 'Export' | 'All';
    readonly configurationType?: 'Action';

    readonly domainObjectAPIName?: 'JSON' | 'Configuration';
    readonly domainObjectCreationOrder?: number;
    readonly domainObjectFieldAPIName?: string;
    readonly domainObjectFieldType?: string;

    readonly interfaceObjectName?: string;
    readonly interfaceFieldAPIName?: string;
    readonly interfaceObjectLookupOrder?: number;

    readonly filterGroup?: number;
    readonly filterOperator?: string;
    readonly filterValue?: string;
    readonly isDisabled?: boolean;
}

export const MigrationDataMapperFields = [
    'Id',
    'Name',
    'MapId__c',
    'GlobalKey__c',
    'ConfigurationAttribute__c',
    'ConfigurationCategory__c',
    'ConfigurationValue__c',
    'ConfigurationProcess__c',
    'ConfigurationType__c',
    'DomainObjectAPIName__c',
    'DomainObjectCreationOrder__c',
    'DomainObjectFieldAPIName__c',
    'DomainObjectFieldType__c',
    'InterfaceObjectName__c',
    'InterfaceFieldAPIName__c',
    'InterfaceObjectLookupOrder__c',
    'FilterGroup__c',
    'FilterOperator__c',
    'FilterValue__c',
    'IsDisabled__c'
] as const;