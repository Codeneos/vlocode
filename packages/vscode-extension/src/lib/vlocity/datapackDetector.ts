
import { FileFilterFunction, FileFilterInfo } from '@lib/workspaceContextDetector';
import { container, injectable } from '@vlocode/core';

@injectable()
export class DatapackDetector {

    private static datapacksFoundSymbol = Symbol('[[hasDatapacks]]');
    private isDatapackFileFn =  this.isDatapackFile.bind(this);

    public static isDatapackFile(file: FileFilterInfo | string) {
        return (typeof file !== 'string' ? file.name : file).endsWith('_DataPack.json');
    }

    public isDatapackFile(file: FileFilterInfo | string) {
        if (typeof file === 'string') {
            return DatapackDetector.isDatapackFile(file);
        }

        if (file.siblings[DatapackDetector.datapacksFoundSymbol]) {
            return true;
        }

        if (file.name.endsWith('_DataPack.json')) {
            file.siblings[DatapackDetector.datapacksFoundSymbol] = file.name;
            return true;
        }

        const datapackFile = file.siblings.find(DatapackDetector.isDatapackFile);
        if (datapackFile) { 
            file.siblings[DatapackDetector.datapacksFoundSymbol] = datapackFile;
            return true;
        }

        return false;
    }

    public static filter(): FileFilterFunction {
        const detector = container.get(DatapackDetector);
        return detector.isDatapackFile.bind(detector);
    }
}