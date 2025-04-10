import { Logger } from '@vlocode/core';
import { mapGetOrCreate, substringAfter } from '@vlocode/util';
import { DatapackDeploymentRecord } from '../datapackDeploymentRecord';

export class PreprocessorMessages {

    private readonly preprocessorMessages = new Map<string, string[]>();

    public constructor(private readonly logger: Logger) {
    }

    /**
     * Add a warning message to a record from the preprocessing stage; stores the messages and adds them to the records in the afterRecordConversion stage.
     *
     * All pre-processor messages are warnings, if the pre-processor encounters an error it should throw an exception.
     *
     * @param sourceKey Source key of the future record to add the warning to
     * @param message Message to add
     */
    public warn(sourceKey: string | { VlocityRecordSourceKey?: string, sourceKey?: string }, message: string) {
        sourceKey = typeof sourceKey === 'string' ? sourceKey : sourceKey.VlocityRecordSourceKey ?? sourceKey.sourceKey!;
        this.logger.warn(`${substringAfter(sourceKey.replaceAll('%vlocity_namespace%__', ''), '/')} -- ${message}`);
        mapGetOrCreate(this.preprocessorMessages, sourceKey, () => new Array<string>()).push(message);
    }

    /**
     * Should be called in the afterRecordConversion stage to add the preprocessor messages to the records
     * @param records Records to add the preprocessor messages to
     */
    public addToRecords(records: ReadonlyArray<DatapackDeploymentRecord>) {
        for (const record of records) {
            for (const message of this.preprocessorMessages.get(record.sourceKey) ?? []) {
                record.addWarning(message);
            }
        }
        this.preprocessorMessages.clear();
    }
}