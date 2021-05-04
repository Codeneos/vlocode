import { singleton } from 'lib/util/singleton';
import { ConfigurationManagerWatchOptions, ConfigurationManager as ManagerImplClass } from 'lib/config/configManager';

export const ConfigurationManager = singleton(ManagerImplClass);
export { ConfigurationManagerWatchOptions };
export * from './configBase';