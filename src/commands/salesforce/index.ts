import { VlocodeCommand } from "@constants";
import DeployMetadataCommand from "./deployMetadataCommand";
import DeleteMetadataCommand from "./deleteMetadataCommand";

export default {
    [VlocodeCommand.deployMetadata]: DeployMetadataCommand,
    [VlocodeCommand.deployMetadataExplorer]: DeployMetadataCommand,
    [VlocodeCommand.destroyMetadata]: DeleteMetadataCommand
};
