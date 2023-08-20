import { singleton } from '@vlocode/util';
import { ConfigurationManagerWatchOptions, ConfigurationManager as ManagerImplClass } from '../../lib/config/configManager';

export const ConfigurationManager = singleton(ManagerImplClass);
export type { ConfigurationManagerWatchOptions };
export * from './configBase';