import { VlocodeCommand } from '@constants';
import DeployMetadataCommand from './deployMetadataCommand';
import DeleteMetadataCommand from './deleteMetadataCommand';
import RefreshMetadataCommand from './refreshMetadataCommand';
import SelectApiVersionCommand from './selectApiVersionCommand';
import CreateMetadataCommand from './createMetadataCommand';
import ExecAnonymousCommand from './execAnonymousCommand';
import ViewInSalesforceCommand from './viewInSalesforce';
import ClearDeveloperLogsCommands from './clearDeveloperLogsCommands';
import SetTraceFlagsCommand from './setTraceFlagsCommand';

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
    [VlocodeCommand.clearDeveloperLogs] : ClearDeveloperLogsCommands,
    [VlocodeCommand.setTraceFlags] : SetTraceFlagsCommand
};
