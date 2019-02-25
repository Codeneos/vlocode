/**
 * Defines how to group datapack records in the explorer UI panel
 */
declare module 'datapackExplorer.yaml' {
  const datapackExplorer : { 
    [datapackType: string] : {
      groupKey?: string
      groupName?: string
      groupDescription?: string
      description?: string
      name: string
    }
  };
  export = datapackExplorer;
}

/**
 * Defines the queries for accessing Vlocity objects in Salesforce.
 */
declare module 'exportQueryDefinitions.yaml' {
  const exportQueryDefinitions : { 
    [datapackType: string] : {
      VlocityDataPackType: string
      query: string
      name?: string
    }
  };
  export = exportQueryDefinitions;
}