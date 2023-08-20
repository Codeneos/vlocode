declare module 'datapacksexpanddefinition.yaml' {
    interface SObjectFieldDefinition {
        [field: string]: {
            FileExt: string;
            FilePrefix: string;
            FileType: string;
            NonUnique: boolean;
            ReplacementFields: {
                [field: string]: string;
            };
            DeltaQueryChildren: any;
        };
    }

  type SObjectDefinition = {
      DisplayName: Array<string>;
      FileType: string;
      UnhashableFields: Array<string>;
      SourceKeyDefinition: Array<string>;
      FolderName: Array<string>;
      TitleFields: Array<string>;
      FilterFields: Array<string>;
      JsonFields: Array<string>;
      DiffKeys: any;
      FileName: Array<string>;
      ListFileName: Array<string>;
      RecordLabel: Array<string>;
      SummaryFields: Array<string>;
      DeletedDuringDeploy: boolean;
      ReplacementFields: {
          [field: string]: string;
      };
  } & {
      [field: string]: SObjectFieldDefinition;
  };

  type DataPacksDefinition = {
      ChildrenLimit: number;
      IsDiffable: boolean;
      UniqueByName: boolean;
      HeadersOnly: boolean | 'All' | 'Identical';
      DisplayName: {
          [field: string]: Array<string>;
      };
      SupportParallel: boolean | {
          [field: string]: boolean;
      };
      PaginationActions: {
          [field: string]: Array<string>;
      };
      PaginationSize: number;
      IgnoreExpand: Array<string>;
      ApexSObjectTypeList: Array<string>;
  } & {
      [field: string]: SObjectDefinition;
  };

  const exportExpandDefinitions : {
      DataPacks: {
          [datapackType: string] : DataPacksDefinition;
      };
      DataPacksDefault : DataPacksDefinition;
      SObjects: {
          [sobjectType: string] : SObjectDefinition;
      };
      SObjectsDefault: SObjectDefinition;
  };

  export = exportExpandDefinitions;
}