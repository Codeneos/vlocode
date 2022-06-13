import { Timer , Iterable, stringEquals, removeNamespacePrefix } from '@vlocode/util';
import { DatapackRecordDependency, DependencyResolver, VlocityDataPackDependencyType } from './datapackDeployer';

export enum DeploymentStatus {
    Pending,
    InProgress,
    Deployed,
    Retry,
    Failed,
    Skipped
}

export enum DeploymentAction {
    None,
    Update,
    Insert,
    Skip
}

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
        public readonly values: Object = {}) {
        this.normalizedSObjectType = removeNamespacePrefix(this.sobjectType);
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
     *  Get or set a value in the underlying record data
     * @param field field name
     * @param value value to set if 
     * @returns 
     */
    public value(field: string, value?: any): any {
        const fieldNames = Object.keys(this.values);
        const matchingField = 
            fieldNames.find(name => name.toLowerCase() === field.toLowerCase()) ?? 
            fieldNames.find(name => removeNamespacePrefix(name) === removeNamespacePrefix(field));

        if (arguments.length == 1) {
            return matchingField ? this.values[matchingField] : undefined;
        } else {
            this.values[matchingField ?? field] = value;
        }
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
            this._existingId = updateId;
            this._status = DeploymentStatus.Skipped;
        }
        this._datapackAction = action;
        this._existingId = updateId;
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
        this._dependencies.set(field, dependency);
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
        const dependencyGuid = `$${dependency.VlocityMatchingRecordSourceKey ?? dependency.VlocityLookupRecordSourceKey}`;
        this._dependencies.set(dependencyGuid, dependency);
        this._unresolvedDependencies.add(dependencyGuid);
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
}
