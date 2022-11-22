import { Timer , Iterable, removeNamespacePrefix } from '@vlocode/util';
import { randomUUID } from 'crypto';
import { DatapackRecordDependency, DependencyResolver } from './datapackDeployer';

export enum DeploymentStatus {
    Pending,
    InProgress,
    Retry,
    Deployed,
    Failed,
    Skipped
}

export enum DeploymentAction {
    None,
    Update,
    Insert,
    Skip
}

export type DeployedDatapackDeploymentRecord = DatapackDeploymentRecord & { recordId: string };

export class DatapackDeploymentRecord {

    private readonly _warnings = new Array<string>();
    private readonly _dependencies = new Map<string, DatapackRecordDependency>();
    private readonly _unresolvedDependencies = new Set<string>();
    private readonly _deployTimer: Timer = new Timer();
    private _status: DeploymentStatus = DeploymentStatus.Pending;
    private _statusDetail?: string;
    private _existingId?: string;
    private _retryCount = 0;
    private _datapackAction: DeploymentAction = DeploymentAction.None;

    /**
     * True if looking up existing records to update is skipped causing the deployment
     * to always create a new object using insert
     */
    public skipLookup: boolean;

    /**
     * Namespace normalized SObjectName; contains the SObjectType without the namespace prefix.
     */
    public readonly normalizedSObjectType: string;

    public get status(): DeploymentStatus {
        return this._status;
    }

    public get isDeployed(): boolean {
        return this._status === DeploymentStatus.Deployed;
    }

    public get isPending(): boolean {
        return this._status === DeploymentStatus.Pending || this._status === DeploymentStatus.Retry;
    }

    public get isStarted(): boolean {
        return this._status === DeploymentStatus.InProgress || this._status === DeploymentStatus.Retry;
    }

    public get isFailed(): boolean {
        return this._status === DeploymentStatus.Failed;
    }

    public get isUpdate(): boolean {
        return this._datapackAction === DeploymentAction.Update;
    }

    public get isInsert(): boolean {
        return this._datapackAction === DeploymentAction.Insert;
    }

    public get isSkipped(): boolean {
        return this._datapackAction === DeploymentAction.Skip;
    }

    public get hasWarnings(): boolean {
        return this._warnings.length > 0;
    }

    public get recordId(): string | undefined {
        return this._status === DeploymentStatus.Deployed ? this._statusDetail : this._existingId;
    }

    public get statusMessage(): string | undefined {
        return this._status !== DeploymentStatus.Deployed ? this._statusDetail : undefined;
    }

    public get warnings(): ReadonlyArray<string> {
        return this._warnings;
    }

    public get deployTime(): number {
        return this._deployTimer.elapsed;
    }

    public get hasUnresolvedDependencies(): boolean {
        return this._unresolvedDependencies.size > 0;
    }

    public get retryCount(): number {
        return this._retryCount;
    }
    
    public get action(): DeploymentAction {
        return this._datapackAction;
    }

    constructor(
        public readonly datapackType: string,
        public readonly sobjectType: string,
        public readonly sourceKey: string,
        public readonly datapackKey: string,
        public readonly upsertFields: string[] | undefined = undefined,
        public readonly values: object = {}) {
        this.normalizedSObjectType = removeNamespacePrefix(this.sobjectType);
    }

    static fromValues(
        sobjectType: string, 
        values: object, 
        options?: {
            upsertFields?: string[],
            recordKey?: string,
        }
    ) {
        return new this(
            sobjectType, 
            sobjectType, 
            options?.recordKey ?? `${sobjectType}/${randomUUID()}`, 
            options?.recordKey ?? `${sobjectType}/${randomUUID()}`,  
            options?.upsertFields, 
            values
        );
    }

    /**
     * Namespace and case normalized check to determine if the current datapack is of the specified type.
     * @param sobjectType SObject type with or without namespace prefix
     * @returns 
     */
    public isSObjectOfType(sobjectType: string) {
        return sobjectType === this.sobjectType || 
            sobjectType.toLowerCase() === this.sobjectType.toLowerCase() ||
            removeNamespacePrefix(sobjectType).toLowerCase() === this.normalizedSObjectType.toLowerCase();
    }

    /**
     * Get a value in the underlying record data
     * @param field field name
     * @returns value of the field
     */
    public value(field: string): any
    /**
     * Set the value in the underlying record data. To remove a field from the record pass the value as `undefined`
     * @param field field name
     * @param value value to set or `undefined` to remove the field
     * @returns true if set or false if not set
     */
    public value(field: string, value: unknown | undefined): boolean
    public value(field: string, value?: any): any {
        const fieldNames = Object.keys(this.values);
        const matchingField = 
            fieldNames.find(name => name.toLowerCase() === field.toLowerCase()) ?? 
            fieldNames.find(name => removeNamespacePrefix(name) === removeNamespacePrefix(field));

        if (arguments.length == 1) {
            return matchingField ? this.values[matchingField] : undefined;
        } else if (value !== undefined) {
            this.values[matchingField ?? field] = value;
            return true;
        } else if (matchingField !== undefined) {
            return delete this.values[matchingField];
        }
        return false;
    }

    public updateStatus(status: DeploymentStatus, detail?: string) {
        if (status === DeploymentStatus.InProgress) {
            this._deployTimer.reset();
        } else if (status === DeploymentStatus.Failed || status === DeploymentStatus.Deployed) {
            this._deployTimer.stop();
        } else if (status === DeploymentStatus.Retry) {
            this._deployTimer.stop();
            this._retryCount++;
        }
        this._status = status;
        this._statusDetail = detail;
    }

    public addWarning(message: string) {
        this._warnings.push(message);
    }

    public setAction(action: DeploymentAction): void;
    public setAction(action: DeploymentAction.Update, updateId: string): void;
    public setAction(action: DeploymentAction.Skip, updateId?: string): void;
    public setAction(action: DeploymentAction, updateId?: string) {
        if (action == DeploymentAction.Update && !updateId) {
            throw new Error(`Cannot set action to update without specifying an existing ID`);
        } else if (action == DeploymentAction.Insert) {
            this._existingId = undefined;
        } else if (action == DeploymentAction.Skip) {            
            this._status = DeploymentStatus.Skipped;
        }
        if (arguments.length == 2) {
            this._existingId = updateId;
        }
        this._datapackAction = action;        
    }

    public hasGlobalKey() {
        return this.getGlobalKeyField() !== undefined;
    }

    public getGlobalKey() {
        const globalKeyField = this.getGlobalKeyField();
        return globalKeyField ? this.values[globalKeyField] : undefined;
    }

    private getGlobalKeyField() {
        const fieldNames = Object.keys(this.values);
        const caseNormalizedFields = fieldNames.map(field => field.toLowerCase());
        const globalKeyFieldIndex = caseNormalizedFields.indexOf('globalkey__c') || caseNormalizedFields.findIndex(f => f.endsWith('globalkey__c'));
        return globalKeyFieldIndex >= 0 ? fieldNames[globalKeyFieldIndex] : undefined;
    }

    public addLookup(field: string, dependency: DatapackRecordDependency) {
        this._dependencies.set(field, this.validateRecordDependency(dependency));
        if (!this.values[field]) {
            this._unresolvedDependencies.add(field);
        }
    }

    public getLookup(field: string) {
        return this._dependencies.get(field);
    }

    public addDependency(dependency: DatapackRecordDependency | DatapackDeploymentRecord) {
        if (dependency instanceof DatapackDeploymentRecord) {
            return this.addDependency({
                VlocityRecordSObjectType: dependency.sobjectType,
                VlocityDataPackType: 'VlocityLookupMatchingKeyObject',
                VlocityMatchingRecordSourceKey: undefined,
                VlocityLookupRecordSourceKey: dependency.sourceKey
            });
        }

        this.validateRecordDependency(dependency);
        const dependencyGuid = `$${dependency.VlocityMatchingRecordSourceKey ?? dependency.VlocityLookupRecordSourceKey}`;
        this._dependencies.set(dependencyGuid, dependency);
        this._unresolvedDependencies.add(dependencyGuid);
    }
    
    /**
     * Validate dependency integrity by checking if mandator fields are set
     * @param dependency Dependency to check
     */
    private validateRecordDependency(dependency: DatapackRecordDependency) {
        if (!dependency.VlocityRecordSObjectType) {
            throw new Error(`Reference missed "VlocityRecordSObjectType" property for: ${JSON.stringify(dependency)}`);
        }
        return dependency;
    }

    /**
     * Checks if the specified record is a dependency for this record and returns the dependency data and lookup field on this record
     * @param record Record to check
     * @returns The dependency info and lookup field as defined for this record
     */
    public isDependentOn(record: DatapackDeploymentRecord): { field: string, dependency: DatapackRecordDependency } | undefined {
        for (const [field, dependency] of this._dependencies) {
            const depSourceKey = dependency.VlocityMatchingRecordSourceKey ?? dependency.VlocityLookupRecordSourceKey;
            if (depSourceKey === record.sourceKey) {
                return { field, dependency };
            }
        }
        return undefined;
    }

    public getDependencySourceKeys() {
        return Iterable.map(this._dependencies.values(), d => d.VlocityMatchingRecordSourceKey ?? d.VlocityLookupRecordSourceKey);
    }

    /**
     * Get all dependencies on which this record depends; returns resolved and unresolved dependencies
     * @returns Array with all dependencies
     */
    public getDependencies() {
        return [...this._dependencies.values()];
    }

    /**
     * Get embedded dependencies that are **not** resolved through lookup but instead are provided as part of the datapack. 
     * These dependencies of datapack type **VlocityMatchingKeyObject** 
     * @returns Array with dependencies
     */
    public getMatchingDependencies(): { field: string, dependency: DatapackRecordDependency }[] {
        return [...Iterable.transform(this._dependencies, {
            filter: ([,d]) => d.VlocityDataPackType === 'VlocityMatchingKeyObject',
            map: ([field, dependency]) => ({ field, dependency }),
        })];
    }

    /**
     * Get dependencies that are resolved through a lookup and **not** provided as part of the datapack. 
     * These dependencies of datapack type **VlocityLookupMatchingKey**
     * @returns Array with dependencies
     */
    public getLookupDependencies() {
        return [...Iterable.transform(this._dependencies, {
            filter: ([,d]) => d.VlocityDataPackType === 'VlocityLookupMatchingKeyObject',
            map: ([field, dependency]) => ({ field, dependency }),
        })];
    }

    public getUnresolvedDependencies() {
        return [...Iterable.map(this._unresolvedDependencies, field => ({ field, dependency: this._dependencies.get(field)! }))];
    }

    /**
     * Check if a field that is dependent on another record is resolved.
     * @param field name of the field
     * @returns 
     */
    public isResolved(field: string): boolean {
        return !this._unresolvedDependencies.has(field);
    }

    public async resolveDependencies(resolver: DependencyResolver) {
        return Promise.all(Iterable.map(this._unresolvedDependencies, field => 
            resolver.resolveDependency(this._dependencies.get(field)!).then(resolution => {
                if (resolution !== undefined) {
                    if (!field.startsWith('$')) {
                        this.values[field] = resolution;
                    }
                    this._unresolvedDependencies.delete(field);
                }
            }))
        );
    }

    /**
     * Check if this record type matches the specified SObject type filter. Matches are always case 
     * insensitive and will be matched against the full and normalized SObject (without namespace prefix) type. 
     * Matching will first be done against the normal sobject type and only after that against the normalized sobject type.
     * @param filter SObjectType as string or RegEx 
     * @returns `true` if the record SObject type matches the filter otherwise `false`
     */
    public isMatch(filter: string | RegExp) {
        if (typeof filter === 'string') {
            return this.sobjectType.toLowerCase() === filter.toLowerCase() || 
                this.normalizedSObjectType.toLowerCase() === removeNamespacePrefix(filter).toLowerCase();
        }

        if (!filter.ignoreCase) {
            // convert to case insensitive regex
            filter = new RegExp(filter.source, filter.flags + 'i');
        }

        return filter.test(this.sobjectType) || filter.test(this.normalizedSObjectType);
    }
}
