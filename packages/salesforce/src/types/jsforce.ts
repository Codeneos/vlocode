// Re-export types from JSForce which are directly exposed by this module
// with this we can avoid other modules from depending on JSForce as well making
// a more clear dependency graph within Vlocode
export { Connection, DescribeSObjectResult, DescribeGlobalSObjectResult, DescribeGlobalResult,
    DescribeSObjectOptions, BatchDescribeSObjectOptions, Field, FieldType, ExtraTypeInfo, ScopeInfo, SOAPType } from 'jsforce';

// Other meta-types from JSForce
export { FilteredLookupInfo, PicklistEntry, RecordTypeInfo, ActionOverride, ChildRelationship, NamedLayoutInfo } from 'jsforce';
