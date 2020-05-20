import { DatapackRecordDependency, DependencyResolver } from './datapackDeployService';
import Timer from 'lib/util/timer';

export enum DeploymentStatus {
    Pending,
    InProgress,
    Deployed,
    Failed
}

export default class DatapackDeploymentRecord {

    _dependencies : { [key: string]:DatapackRecordDependency } = {};
    _status: DeploymentStatus = DeploymentStatus.Pending;
    _statusDetail: string;
    _deployTimer: Timer = new Timer();

    public get status(): DeploymentStatus {
        return this._status;
    }

    public get isDeployed(): boolean {
        return this._status === DeploymentStatus.Deployed;
    }

    public get isPending(): boolean {
        return this._status === DeploymentStatus.Pending;
    }

    public get recordId(): string {
        return this._status === DeploymentStatus.Deployed && this._statusDetail;
    }

    public get statusMessage(): string {
        return this._status !== DeploymentStatus.Deployed && this._statusDetail;
    }    

    public get deployTime(): number {
        return this._deployTimer.elapsed;
    } 

    public get hasUnresolvedDependencies(): boolean {
        return Object.keys(this._dependencies).length > 0;
    } 

    constructor(
        public readonly sobjectType: string,
        public readonly sourceKey: string,
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

    public setField(field: string, value: any) {
        this.values[field] = value;
    }

    public addLookup(field: string, dependency: DatapackRecordDependency) {
        this._dependencies[field] = dependency;
    }

    public getDependencySourceKeys() {
        return this.getDependencies().map(d => d.VlocityMatchingRecordSourceKey || d.VlocityLookupRecordSourceKey);
    }

    public getDependencies() {
        return Object.values(this._dependencies);
    }

    public async resolveDependencies(resolver: DependencyResolver) {
        const depArray = Object.entries(this._dependencies);
        for(const [field, dependency] of depArray) {
            const resolution = await resolver.resolveDependency(dependency);
            if (resolution) {
                this.values[field] = resolution;
                delete this._dependencies[field];
            }
        }
    }
}

