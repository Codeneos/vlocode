/**
 * Defines the queries for accessing Vlocity objects in Salesforce.
 */
declare module 'exportQueryDefinitions.yaml' {
  interface DatapackQueryDefinition {
    VlocityDataPackType: string
    query: string
    name: string
    groupKey?: string
    groupName?: string
    groupDescription?: string
    description?: string
    matchingKey?: {
      fields: string[],
      returnField?: string
    }
    salesforceUrl?: {
      namespace?: string,
      path: string
    } | string
  }
  const exportQueryDefinitions : { 
    [datapackType: string] : DatapackQueryDefinition
  };
  export = exportQueryDefinitions;
}

declare module 'metadataTypes.yaml' {
  interface MetadataType {
    packageFolder?: string;
    fileExtensions?: string[];
  }
  const exportQueryDefinitions : { 
    [metadataType: string] : MetadataType
  };
  export = exportQueryDefinitions;
}