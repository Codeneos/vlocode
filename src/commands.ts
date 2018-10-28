import RefreshDatapackCommand from "./commands/refreshDatapackCommand";
import DeployDatapackCommand from "./commands/deployDatapackCommand";
import ViewDatapackCommand from "./commands/viewDatapackCommand";
import { ICommand } from "./commands/command";

export const datapackCommands : ICommand[] = [
    new RefreshDatapackCommand('vlocity.refreshDatapack'),
    new DeployDatapackCommand('vlocity.deployDatapack'),
    new ViewDatapackCommand('vlocity.viewDatapack.generic')
];
