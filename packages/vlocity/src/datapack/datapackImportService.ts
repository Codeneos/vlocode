import { injectable, LifecyclePolicy } from '@vlocode/core';
import { VisualforceRemoting } from '@vlocode/salesforce';
import type { CancellationToken } from '@vlocode/util';

interface DatapackImportProgress {
    Finished: number;
    Total: number;
    Message: string;
    Status: 'Ready' | 'InProgress' | 'Complete';
    VlocityDataPackId: string;
    VlocityDataPackProcess: 'Import';
}

interface DatapackInfo {
    VlocityDataPackKey: string;
    VlocityDataPackName: string;
    VlocityDataPackType: string;
}

export interface MultipackResource {
    dataPacks: Array<DatapackInfo>;
    source: string;
    name: string;
    version: number;
}

interface DatapackData {
    dataPackId: string;
    warnings: Array<object>;
    errors: Array<object>;
    status: string;
    primaryDataPackType: string;
    primaryDataPackKey: number;
    dataPacks: Array<
        DatapackInfo & {
            VlocityDataPackLabel: string;
            VlocityDataPackStatus: string;
            DataPackAttachmentId: string;
            ActivationStatus: string;
        }
    >;
}

type ImportProgressDelegate = (status: {
    completed: number;
    total: number;
    message: string;
    status: DatapackImportProgress['Status'];
}) => void;

/** 
 * Defines the methods used to access the Vlocity DataRaptor API for importing datapacks.
 */
const DatapackControllerMethods = {
    runImport: 'DRDataPackRunnerController.runImport',
    runActivate: 'DRDataPackRunnerController.runActivate',
    getAllDataPackData: 'DRDataPackRunnerController.getAllDataPackData',
    updateDataPackInfo: 'DRDataPackRunnerController.updateDataPackInfo',
    getStoredPublicDataPackData: 'DRDataPackRunnerController.getStoredPublicDataPackData',
};

/**
 * Service to import multipacks stored on the org through the Vlocity DataRaptor API. 
 */
@injectable({ lifecycle: LifecyclePolicy.transient })
export class DatapackImportService {

    public constructor(private readonly remoting: VisualforceRemoting) {
    }

    public async initialize(vlocityNamespace = 'vlocity_cmt') {
        await this.remoting.initialize('apex/DataPacksHome', vlocityNamespace);
        return this;
    }

    /**
     * Installs a multipack by its name, optionally filtering the datapacks to import.
     * 
     * This method retrieves the specified multipack, applies an optional filter to its datapacks,
     * imports the filtered datapacks, activates them, and updates their status to 'Complete'.
     * 
    * @param multipackName - The name of the multipack to install.
    * @param options - Optional runtime options to control installation. Use `options.predicate` to provide a filter function to decide which datapacks to import.
     * @returns A promise that resolves to the import progress status of the datapacks.
     */
    public async installMultipack(
        multipackName: string,
        options?: {
            predicate?: (datapack: DatapackInfo) => boolean,
            progress?: ImportProgressDelegate,
            cancelationToken?: CancellationToken,
            skipActivation?: boolean,
        }
    ): Promise<DatapackImportProgress> {
        const datapackData = await this.getMultipackData(multipackName);
        if (options?.predicate) {
            datapackData.dataPacks = datapackData.dataPacks.filter.apply(datapackData.dataPacks, [ options?.predicate ]);
        }

        // run import
        const status = await this.importMultipack(datapackData, options?.progress, options?.cancelationToken);

        // activate datapacks
        const deployResult = await this.getAllDataPackData(status.VlocityDataPackId);
        if (options?.skipActivation !== true) {
            await this.activateDatapacks(deployResult);
        }

        // Clean-up
        await this.updateDatapackInfo(status.VlocityDataPackId, 'Complete');

        return status;
    }

    private async startImport(datapackData: MultipackResource): Promise<DatapackImportProgress> {
        const { result: importStatus } = await this.remoting.invoke(DatapackControllerMethods.runImport, [
            JSON.stringify({ VlocityDataPackData: datapackData }),
        ]);
        return importStatus;
    }

    private async runImport(id: string): Promise<DatapackImportProgress> {
        const { result: importStatus } = await this.remoting.invoke(DatapackControllerMethods.runImport, [
            JSON.stringify({ VlocityDataPackId: id }),
        ]);
        return importStatus;
    }

    private async updateDatapackInfo(id: string, status: string) {
        return this.remoting.invoke(DatapackControllerMethods.updateDataPackInfo, [id, { Status: status }]);
    }

    private cancelImport(id: string) {
        return this.updateDatapackInfo(id, 'Canceled');
    }

    private async importMultipack(
        datapackData: MultipackResource, 
        progress?: ImportProgressDelegate, 
        cancelationToken?: CancellationToken
    ): Promise<DatapackImportProgress> {
        let status = this.reportProgress(await this.startImport(datapackData), progress);
        do {
            status = this.reportProgress(
                await this.runImport(status.VlocityDataPackId),
                progress
            );
            if (cancelationToken?.isCancellationRequested) {
                await this.cancelImport(status.VlocityDataPackId);
                break;
            }
        } while (status.Status === 'InProgress');

        if (status.Message === 'Error') {
            throw new Error(status.Message);
        }

        return status;
    }

    private async activateDatapacks(
        deployResult: DatapackData, 
        progress?: ImportProgressDelegate, 
        cancelationToken?: CancellationToken
    ): Promise<DatapackImportProgress> {
        const datapackKeys = deployResult.dataPacks.map(info => info.VlocityDataPackKey);

        let status: DatapackImportProgress;
        do {
            status = this.reportProgress(
                await this.runActivate(deployResult.dataPackId, datapackKeys)
            );
            if (cancelationToken?.isCancellationRequested) {
                await this.cancelImport(status.VlocityDataPackId);
                break;
            }
        } while (status.Status === 'InProgress');

        if (status.Message === 'Error') {
            throw new Error(status.Message);
        }

        return status;
    }

    private reportProgress(status: DatapackImportProgress, progress?: ImportProgressDelegate) {
        progress?.({
            completed: status.Finished,
            total: status.Total,
            message: status.Message,
            status: status.Status,
        });
        return status;
    }

    private async runActivate(id: string, datapackKeys: string[]): Promise<DatapackImportProgress> {
        const { result } = await this.remoting.invoke(DatapackControllerMethods.runActivate, [
            JSON.stringify({
                VlocityDataPackId: id,
                VlocityDataPackKeysToActivate: datapackKeys,
            }),
        ]);
        return result;
    }

    private async getAllDataPackData(id: string): Promise<DatapackData> {
        const { result } = await this.remoting.invoke(DatapackControllerMethods.getAllDataPackData, [id]);
        return JSON.parse(result);
    }

    private async getMultipackData(datapackName: string): Promise<MultipackResource> {
        const response = await this.remoting.invoke(DatapackControllerMethods.getStoredPublicDataPackData, [
            datapackName,
            'Vlocity Resource',
        ]);
        return response.result;
    }
}
