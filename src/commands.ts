
import RefreshDatapackCommand from "./commands/refreshDatapackCommand";
import DeployDatapackCommand from "./commands/deployDatapackCommand";
import ViewDatapackCommand from "./commands/viewDatapackCommand";
import ExportDatapackCommand from "./commands/exportDatapackCommand";
import SelectOrgCommand from "./commands/selectOrgCommand";
import BuildDatapackCommand from "./commands/buildDatapackCommand";

export enum VlocodeCommand {
    refreshDatapack = 'vlocity.refreshDatapack',
    deployDatapack = 'vlocity.deployDatapack',
    viewDatapackGeneric = 'vlocity.viewDatapack.generic',
    exportDatapack = 'vlocity.exportDatapack',
    selectOrg = 'vlocity.selectOrg',
    buildDatapack  = 'vlocity.buildDatapack'
}

export const Commands = {    
    [VlocodeCommand.refreshDatapack]: RefreshDatapackCommand,
    [VlocodeCommand.deployDatapack]: DeployDatapackCommand,
    [VlocodeCommand.viewDatapackGeneric]: ViewDatapackCommand,
    [VlocodeCommand.exportDatapack]: ExportDatapackCommand,
    [VlocodeCommand.selectOrg]: SelectOrgCommand,
    [VlocodeCommand.buildDatapack]: BuildDatapackCommand
};

//DatapackExplorer