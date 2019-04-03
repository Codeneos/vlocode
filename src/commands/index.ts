
import RefreshDatapackCommand from "./refreshDatapackCommand";
import DeployDatapackCommand from "./deployDatapackCommand";
import ViewDatapackCommand from "./viewDatapackCommand";
import ExportDatapackCommand from "./exportDatapackCommand";
import SelectOrgCommand from "./selectOrgCommand";
import AdminCommands from "./vlocityAdminCommand";
import { VlocodeCommand } from "../constants";
import BuildParentKeyFilesCommand from "./buildParentKeyFiles";

export default {
    [VlocodeCommand.refreshDatapack]: RefreshDatapackCommand,
    [VlocodeCommand.deployDatapack]: DeployDatapackCommand,
    [VlocodeCommand.viewDatapackGeneric]: ViewDatapackCommand,
    [VlocodeCommand.exportDatapack]: ExportDatapackCommand,
    [VlocodeCommand.selectOrg]: SelectOrgCommand,
    [VlocodeCommand.buildParentKeyFiles]: BuildParentKeyFilesCommand,
    ...AdminCommands
};
