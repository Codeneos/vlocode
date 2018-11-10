import { window, ExtensionContext } from 'vscode';
import VlocodeConfiguration from './models/VlocodeConfiguration';
import VlocodeService from './services/vlocodeService';
import * as constants from './constants';
import { Logger, ChainLogger, ConsoleLogger, LogFilterDecorator, OutputLogger }  from './loggers';
import CommandRouter from './services/commandRouter';
import { setLogger as setVlocityLogger } from './services/vlocityDatapackService';
import DatapackExplorer from 'datapackExplorer';
import { Commands } from 'commands';
import { container } from 'serviceContainer';

export function activate(context: ExtensionContext) : void {

    // Init logging and regsiter services
    let vloService = container.register(VlocodeService, new VlocodeService(container, context, VlocodeConfiguration.load(constants.CONFIG_SECTION)));
    let logger = container.register(Logger, new ChainLogger( 
        new OutputLogger(vloService.outputChannel),  
        new ConsoleLogger()        
    ));

    // Report some thing so that the users knows we are active
    logger.info(`Vlocode version ${constants.VERSION} started`);
    const vlocityLogFilterRegex = [
        /^(Initializing Project|Using SFDX|Salesforce Org|Continuing Export|Adding to File|Deploy [0-9]* Items).*/i,
        /^(Success|Remaining|Error).*?[0-9]+$/
    ];

    // do async setup
    setVlocityLogger(new ChainLogger(
        new ConsoleLogger(), 
        new LogFilterDecorator(new OutputLogger(vloService.outputChannel), (args: any[]) => 
            !vlocityLogFilterRegex.some(r => r.test(args.join(' ')))
        )
    ));

    container.get(CommandRouter).registerAll(Commands);
    vloService.registerDisposable(window.registerTreeDataProvider('datapackExplorer', new DatapackExplorer(container)));
}

export function deactivate() { }