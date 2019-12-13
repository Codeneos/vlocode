import { VlocodeCommand } from "@constants";
import DeployMetadataCommand from "./deployMetadataCommand";
import DeleteMetadataCommand from "./deleteMetadataCommand";
import RefreshMetadataCommand from './refreshMetadataCommand';

export default {
    [VlocodeCommand.deployMetadata]: DeployMetadataCommand,
    [VlocodeCommand.destroyMetadata]: DeleteMetadataCommand,
    [VlocodeCommand.refreshMetadata]: RefreshMetadataCommand
};
