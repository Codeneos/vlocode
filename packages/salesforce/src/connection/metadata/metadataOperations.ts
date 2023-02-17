import type * as Metadata from '../../types/metadata'
import { RetrieveRequest } from './types';

export interface MetadataResponses {
    'cancelDeploy': Metadata.CancelDeployResponse;
    'checkDeployStatus': Metadata.CheckDeployStatusResponse;
    'checkRetrieveStatus': Metadata.CheckRetrieveStatusResponse;
    'createMetadata': Metadata.CreateMetadataResponse;
    'deleteMetadata': Metadata.DeleteMetadataResponse;
    'deploy': Metadata.DeployResponse;
    'deployRecentValidation': Metadata.DeployRecentValidationResponse;
    'describeMetadata': Metadata.DescribeMetadataResponse;
    'describeValueType': Metadata.DescribeValueTypeResponse;
    'listMetadata': Metadata.ListMetadataResponse;
    'readMetadata': Metadata.ReadMetadataResponse;
    'renameMetadata': Metadata.RenameMetadataResponse;
    'retrieve': Metadata.RetrieveResponse;
    'updateMetadata': Metadata.UpdateMetadataResponse;
    'upsertMetadata': Metadata.UpsertMetadataResponse;
}

export interface MetadataRequests {
    'cancelDeploy': Metadata.CancelDeployRequest;
    'checkDeployStatus': Metadata.CheckDeployStatusRequest;
    'checkRetrieveStatus': Metadata.CheckRetrieveStatusRequest;
    'createMetadata': Metadata.CreateMetadataRequest;
    'deleteMetadata': Metadata.DeleteMetadataRequest;
    'deploy': Metadata.DeployRequest;
    'deployRecentValidation': Metadata.DeployRecentValidationRequest;
    'describeMetadata': Metadata.DescribeMetadataRequest;
    'describeValueType': Metadata.DescribeValueTypeRequest;
    'listMetadata': Metadata.ListMetadataRequest;
    'readMetadata': Metadata.ReadMetadataRequest;
    'renameMetadata': Metadata.RenameMetadataRequest;
    'retrieve': RetrieveRequest;
    'updateMetadata': Metadata.UpdateMetadataRequest;
    'upsertMetadata': Metadata.UpsertMetadataRequest;
}
