export enum DatapackDeploymentErrorCode {
    DEPLOYMENT_ALREADY_STARTED = 101,
    DEPLOYMENT_FAILED = 102,
    DEPLOYMENT_UNKNOWN_STATUS = 103,
    RECORD_SOURCEKEY_DUPLICATE = 201,
    RECORD_ALREADY_DEPLOYED = 202,
    RECORD_CASCADE_FAILURE = 203,
    RECORD_MISSING_DEPENDENCY = 204,
    RECORD_UNKNOWN_DATAPACK = 205,
    RECORD_NOT_PENDING = 206,
    RECORD_UNRESOLVED_DEPENDENCY = 207,
    INVALID_RECORD = 401,
    INVALID_RESOLVE_RESULTS = 402,
    UNKNOWN_ERROR = 999
}

export type DatapackDeploymentErrorCodes = keyof typeof DatapackDeploymentErrorCode;

export class DatapackDeploymentError extends Error {
    public readonly errorCode: DatapackDeploymentErrorCodes;
    public readonly fields?: string[];

    public constructor(code: DatapackDeploymentErrorCodes, message: string) {
        super(message);
        this.name = code;
        this.errorCode = code;
    }
}

