import { VlocodeCommand } from "@constants";
import DeployMetadataCommand from "./deployMetadataCommand";
import DeleteMetadataCommand from "./deleteMetadataCommand";
import RefreshMetadataCommand from './refreshMetadataCommand';
import SelectApiVersion from './selectApiVersionCommand';

export default {
    [VlocodeCommand.deployMetadata]: DeployMetadataCommand,
    [VlocodeCommand.destroyMetadata]: DeleteMetadataCommand,
    [VlocodeCommand.refreshMetadata]: RefreshMetadataCommand,
    [VlocodeCommand.selectApiVersion]: SelectApiVersion
};
