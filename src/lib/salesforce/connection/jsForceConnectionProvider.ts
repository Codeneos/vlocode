import * as jsforce from 'jsforce';

/**
 * This interface describes objects that can provide JSForce connections, it provides 
 * some abstraction from whom the class that providing the connection which is usefull
 */
export default abstract class JsForceConnectionProvider {
    public abstract getJsForceConnection() : Promise<jsforce.Connection>;
}
