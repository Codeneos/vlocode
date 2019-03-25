import AnonApexCommand  from './anonApexCommand';
import { VlocodeCommand } from '../constants';

class TelcoAdminConsoleCommand extends AnonApexCommand {
    constructor(name : string, ...methodNames : string[]) {
        super(name, 
            '%vlocity_namespace%.TelcoAdminConsoleController ctrl = new %vlocity_namespace%.TelcoAdminConsoleController();\n' +
             methodNames.map(method => `ctrl.setParameters('{"methodName":"${method}"}'); ctrl.invokeMethod();`).join(`\n`));
    }
}



export default [
    new TelcoAdminConsoleCommand(VlocodeCommand.refreshPriceBook, 'refreshPriceBook'),
    new TelcoAdminConsoleCommand(VlocodeCommand.refreshProductHierarchy, 'startProductHierarchyJob'),
    new TelcoAdminConsoleCommand(VlocodeCommand.refreshPriceBookAndProductHierarchy, 'refreshPriceBook', 'startProductHierarchyJob'),
    new AnonApexCommand(VlocodeCommand.updateAllProdAttribCommand, 'Database.executeBatch(new vlocity_cmt.UpdateAllProdAttribJSONBatchJob());)'),
    new TelcoAdminConsoleCommand(VlocodeCommand.clearPlatformCache, 'clearPlatformCache')
].reduce((map, command) => Object.assign(map, { [command.name]: command }), {});