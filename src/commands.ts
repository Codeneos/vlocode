import { ICommand } from "./commands/command";
import RefreshDatapackCommand from "./commands/refreshDatapackCommand";
import DeployDatapackCommand from "./commands/deployDatapackCommand";
import ViewDatapackCommand from "./commands/viewDatapackCommand";
import ExportDatapackCommand from "./commands/exportDatapackCommand";

export const DatapackCommands : ICommand[] = [
    new RefreshDatapackCommand('vlocity.refreshDatapack'),
    new DeployDatapackCommand('vlocity.deployDatapack'),
    new ViewDatapackCommand('vlocity.viewDatapack.generic'),
    new ExportDatapackCommand('vlocity.exportDatapack')
];


//DatapackExplorer