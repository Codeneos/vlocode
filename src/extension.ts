import { window, ExtensionContext } from 'vscode';
import VlocodeConfiguration from './models/VlocodeConfiguration';
import VlocodeService from './services/vlocodeService';
import * as constants from './constants';
import * as s from './singleton';
import * as l from './loggers';
import CommandRouter from './services/commandRouter';

export function activate(context: ExtensionContext) : void {

    // Init logging and regsiter services
    let vloService = s.register(VlocodeService, new VlocodeService(context, VlocodeConfiguration.load(constants.CONFIG_SECTION)));
    let logger = s.register(l.Logger, new l.ChainLogger( 
        new l.OutputLogger(vloService.outputChannel),  
        new l.ConsoleLogger()        
    ));

    // Report some thing so that the users knows we are active
    logger.info(`Vlocode version ${constants.VERSION} started`);
    const vlocityLogFilterRegex = [
        /^(Current Status|Elapsed Time|Version Info|Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy).*/,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ];    

    // do async setup
    import('./services/vlocityDatapackService').then(vds =>
        vds.setLogger(new l.ChainLogger( 
            new l.LogFilterDecorator(new l.OutputLogger(s.get(VlocodeService).outputChannel), (args: any[]) => 
                !vlocityLogFilterRegex.some(r => r.test(args.join(' ')))
            ),  
            new l.ConsoleLogger()
        ))
    );
    import('./commands').then(i => {
        s.get(CommandRouter).registerAll(i.Commands);
    });
    import('./datapackExplorer').then(dpe => {
        vloService.registerDisposable(window.registerTreeDataProvider('datapackExplorer', new dpe.DatapackExplorer()))
    });
}

export function deactivate() { }