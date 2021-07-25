import { VlocodeCommand } from '@constants';
import DeployMetadataCommand from './deployMetadataCommand';
import DeleteMetadataCommand from './deleteMetadataCommand';
import RefreshMetadataCommand from './refreshMetadataCommand';
import SelectApiVersionCommand from './selectApiVersionCommand';
import CreateMetadataCommand from './createMetadataCommand';
import ExecAnonymousCommand from './execAnonymousCommand';
import ViewInSalesforceCommand from './viewInSalesforce';
import ClearDeveloperLogsCommand from './clearDeveloperLogsCommand';
import SetTraceFlagsCommand from './setTraceFlagsCommand';
import SetDeveloperLogVisibilityCommand from './setDeveloperLogVisibilityCommand';
import ExecuteRestApiCommand from './execRestApiCommand';
import RetrieveMetadataCommand from './retrieveMetadataCommand';
import PauseMetadataDeploymentsCommand from './pauseDeploymentsCommand';
import ResumeMetadataDeploymentsCommand from './resumeDeploymentsCommand';
import ClearMetadataDeploymentQueueCommand from './ClearMetadataDeploymentQueueCommand';

export default {
    [VlocodeCommand.deployMetadata]: DeployMetadataCommand,
    [VlocodeCommand.destroyMetadata]: DeleteMetadataCommand,
    [VlocodeCommand.refreshMetadata]: RefreshMetadataCommand,
    [VlocodeCommand.selectApiVersion]: SelectApiVersionCommand,
    [VlocodeCommand.createMetadataCommand]: CreateMetadataCommand,
    [VlocodeCommand.execAnonymousCommand]: ExecAnonymousCommand,
    [VlocodeCommand.viewInSalesforce]: ViewInSalesforceCommand,
    [VlocodeCommand.createApexClass]: new CreateMetadataCommand('apexClass'),
    [VlocodeCommand.createLwc]: new CreateMetadataCommand('lwc'),
    [VlocodeCommand.clearDeveloperLogs]: ClearDeveloperLogsCommand,
    [VlocodeCommand.setTraceFlags]: SetTraceFlagsCommand,
    [VlocodeCommand.setLogVisibility]: SetDeveloperLogVisibilityCommand,
    [VlocodeCommand.execRestApi]: ExecuteRestApiCommand,
    [VlocodeCommand.retrieveMetadata]: RetrieveMetadataCommand,
    [VlocodeCommand.pauseDeploymentQueue]: PauseMetadataDeploymentsCommand,
    [VlocodeCommand.resumeDeploymentQueue]: ResumeMetadataDeploymentsCommand,
    [VlocodeCommand.clearDeploymentQueue]: ClearMetadataDeploymentQueueCommand
};
