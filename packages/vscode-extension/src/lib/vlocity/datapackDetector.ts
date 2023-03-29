
import { FileFilterFunction, FileFilterInfo } from '../../lib/workspaceContextDetector';
import { container, injectable } from '@vlocode/core';

export class DatapackDetector {

    private static datapacksFoundSymbol = Symbol('@hasDatapacks');

    public static isDatapackFile(file: FileFilterInfo | string) {
        return (typeof file !== 'string' ? file.name : file).endsWith('_DataPack.json');
    }

    public static isDatapackFileFn(file: FileFilterInfo | string) {
        if (typeof file === 'string') {
            return DatapackDetector.isDatapackFile(file);
        }

        if (file.siblings[DatapackDetector.datapacksFoundSymbol]) {
            return true;
        }

        if (file.name.endsWith('_DataPack.json')) {
            file.siblings[DatapackDetector.datapacksFoundSymbol] = file.fullName;
            return true;
        }

        const datapackFile = file.siblings.find(DatapackDetector.isDatapackFile);
        if (datapackFile) { 
            file.siblings[DatapackDetector.datapacksFoundSymbol] = datapackFile.fullName;
            return true;
        }

        return false;
    }

    public static filter(): FileFilterFunction {
        return DatapackDetector.isDatapackFileFn;
    }
}