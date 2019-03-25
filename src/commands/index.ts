
import RefreshDatapackCommand from "./refreshDatapackCommand";
import DeployDatapackCommand from "./deployDatapackCommand";
import ViewDatapackCommand from "./viewDatapackCommand";
import ExportDatapackCommand from "./exportDatapackCommand";
import SelectOrgCommand from "./selectOrgCommand";
import BuildDatapackCommand from "./buildDatapackCommand";
import AdminCommands from "./vlocityAdminCommand";
import { VlocodeCommand } from "../constants";

export default {
    [VlocodeCommand.refreshDatapack]: RefreshDatapackCommand,
    [VlocodeCommand.deployDatapack]: DeployDatapackCommand,
    [VlocodeCommand.viewDatapackGeneric]: ViewDatapackCommand,
    [VlocodeCommand.exportDatapack]: ExportDatapackCommand,
    [VlocodeCommand.selectOrg]: SelectOrgCommand,
    [VlocodeCommand.buildDatapack]: BuildDatapackCommand,
    ...AdminCommands
};
