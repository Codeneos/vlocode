import { VlocodeCommand } from "@constants";
import DeployMetadataCommand from "./deployMetadataCommand";
import DeleteMetadataCommand from "./deleteMetadataCommand";
import RefreshMetadataCommand from './refreshMetadataCommand';
import SelectApiVersion from './selectApiVersionCommand';
import CreateMetadataCommand from './createMetadataCommand';
import ExecAnonymousCommand from './execAnonymousCommand';

export default {
    [VlocodeCommand.deployMetadata]: DeployMetadataCommand,
    [VlocodeCommand.destroyMetadata]: DeleteMetadataCommand,
    [VlocodeCommand.refreshMetadata]: RefreshMetadataCommand,
    [VlocodeCommand.selectApiVersion]: SelectApiVersion,
    [VlocodeCommand.createMetadataCommand]: CreateMetadataCommand,
    [VlocodeCommand.execAnonymousCommand]: ExecAnonymousCommand
};
