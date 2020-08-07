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
import SetDeveloperLogVisibilityCommand from './SetDeveloperLogVisibilityCommand';

export default {
    [VlocodeCommand.deployMetadata]: DeployMetadataCommand,
    [VlocodeCommand.destroyMetadata]: DeleteMetadataCommand,
    [VlocodeCommand.refreshMetadata]: RefreshMetadataCommand,
    [VlocodeCommand.selectApiVersion]: SelectApiVersionCommand,
    [VlocodeCommand.createMetadataCommand]: CreateMetadataCommand,
    [VlocodeCommand.execAnonymousCommand]: ExecAnonymousCommand,
    [VlocodeCommand.viewInSalesforce] : ViewInSalesforceCommand,
    [VlocodeCommand.createApexClass] : new CreateMetadataCommand('apexClass'),
    [VlocodeCommand.createLwc] : new CreateMetadataCommand('lwc'),
    [VlocodeCommand.clearDeveloperLogs] : ClearDeveloperLogsCommand,
    [VlocodeCommand.setTraceFlags] : SetTraceFlagsCommand,
    [VlocodeCommand.setLogVisibility] : SetDeveloperLogVisibilityCommand
};
