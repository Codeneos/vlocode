import { Timer , Iterable } from '@vlocode/util';
import { DatapackRecordDependency, DependencyResolver, VlocityDataPackDependencyType } from './datapackDeployer';

export enum DeploymentStatus {
    Pending,
    InProgress,
    Deployed,
    Failed
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

    public skipLookup: boolean;

    public get status(): DeploymentStatus {
        return this._status;
    }

    public get isDeployed(): boolean {
        return this._status === DeploymentStatus.Deployed;
    }

    public get isPending(): boolean {
        return this._status === DeploymentStatus.Pending;
    }

    public get isStarted(): boolean {
        return this._status === DeploymentStatus.InProgress;
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
        public readonly values: Object = {}) {
    }

    public updateStatus(status: DeploymentStatus, detail?: string) {
        if (status === DeploymentStatus.InProgress) {
            this._deployTimer.reset();
        } else if (status === DeploymentStatus.Failed || status === DeploymentStatus.Deployed) {
            this._deployTimer.stop();
        }
        this._status = status;
        this._statusDetail = detail;
    }

    public retry() {
        this._retryCount++;
        this._status = DeploymentStatus.Pending;
    }

    public addWarning(message: string) {
        this._warnings.push(message);
    }

    public setAction(action: DeploymentAction): void;
    public setAction(action: DeploymentAction.Update, updateId: string): void;
    public setAction(action: DeploymentAction, updateId?: string) {
        if (action == DeploymentAction.Update && !updateId) {
            throw new Error(`Cannot set action to update without specifying an existing ID`);
        } else if (action == DeploymentAction.Insert) {
            this._existingId = undefined;
        }
        this._datapackAction = action;
        this._existingId = updateId;
    }

    public setField(field: string, value: any) {
        this.values[field] = value;
        if (value) {
            this._unresolvedDependencies.delete(field);
        }
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

    public getDependency(record: DatapackDeploymentRecord): { field: string, dependency: DatapackRecordDependency } | undefined {
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
     * Get dependencies dependencies that are **not** resolved through a lookup, these dependencies are
     * embedded in the datapack; dependency type: `VlocityMatchingKeyObject` 
     * @returns Array with dependencies
     */
    public getMatchingDependencies() {
        return [...Iterable.filter(this._dependencies.values(), d => d.VlocityDataPackType === 'VlocityMatchingKeyObject')];
    }

    /**
     * Get dependencies dependencies that are resolved through a lookup-query and **not**
     * embedded in this datapack; dependency type: `VlocityLookupMatchingKey`
     * @returns Array with dependencies
     */
    public getLookupDependencies() {
        return [...Iterable.filter(this._dependencies.values(), d => d.VlocityDataPackType === 'VlocityLookupMatchingKeyObject')];
    }

    public getUnresolvedDependencies() {
        return [...Iterable.map(this._unresolvedDependencies, dep => this._dependencies.get(dep)!)];
    }

    public async resolveDependencies(resolver: DependencyResolver) {
        for(const [field, dependency] of this._dependencies.entries()) {
            const resolution = await resolver.resolveDependency(dependency);
            if (resolution !== undefined) {
                if (!field.startsWith('$')) {
                    this.values[field] = resolution;
                }
                this._unresolvedDependencies.delete(field);
            }
        }
    }
}
