import type { ExtensionContext } from "vscode";
import type VlocodeService from './vlocodeService';
import { singleton, getInstance } from "lib/util/singleton";
import * as path from 'path';

/**
 * Minimal version of VScodes extension context.
 */
class VlocodeContext {

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
        readonly storagePath: string | undefined,
        /**
         * Primary service class
         */
        readonly service: VlocodeService) {
    }

    
    /**
     * Get the absolute path of a resource contained in the extension.
     *
     * @param relativePath A relative path to a resource contained in the extension.
     * @return The absolute path of the resource.
     */
	public asAbsolutePath(relativePath: string): string {
        return path.join(this.extensionPath, relativePath);
    }

}

/**
 * Get the currently initialized Vlocode context object
 */
export function getContext() {
    return getInstance(VlocodeContext);
}

/**
 * Create a VlocodeContext from an existing ExtensionContext object.
 * @param context VS Codes extension context
 */
export function initializeContext(context: ExtensionContext, service: VlocodeService) {
    return singleton(VlocodeContext, context.extensionPath, context.storagePath, service);
}