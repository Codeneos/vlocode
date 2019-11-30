import { ExtensionContext } from "vscode";
import * as path from "path";

/**
 * Minimal version of VScodes extension context.
 */
export default class VlocodeContext {

    constructor(      
        /**
		 * The absolute file path of the directory containing the extension.
		 */  
        readonly extensionPath: string, 
        /**
		 * An absolute file path of a workspace specific directory in which the extension
		 * can store private state. The directory might not exist on disk and creation is
		 * up to the extension. However, the parent directory is guaranteed to be existent.
		 *
		 * Use [`workspaceState`](#ExtensionContext.workspaceState) or
		 * [`globalState`](#ExtensionContext.globalState) to store key value data.
		 */
        readonly storagePath: string | undefined) {
    }

    /**
     * Create a VlocodeContext from an existing ExtensionContext object.
     * @param context VS Codes extension context
     */
    static createFrom(context: ExtensionContext) : VlocodeContext {
        return new this(context.extensionPath, context.storagePath);
    }
}