import { Connection } from 'jsforce';

/**
 * This interface describes objects that can provide JSForce connections, it provides 
 * some abstraction from whom the class that providing the connection which is usefull
 */
export abstract class SalesforceConnectionProvider {    
    public abstract getJsForceConnection(): Promise<Connection>;
    public abstract isProductionOrg(): Promise<boolean>;
    public abstract getApiVersion(): string;
}
