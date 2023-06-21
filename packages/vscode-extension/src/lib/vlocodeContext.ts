import * as path from 'path';
import type { ExtensionContext, Memento, ExtensionMode } from 'vscode';
import { singleton, getInstance } from '@vlocode/util';
import type VlocodeService from './vlocodeService';

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
         * A memento object that stores state in the context
         * of the currently opened {@link workspace.workspaceFolders workspace}.
         */
        readonly workspaceState: Memento,
        /**
         * A memento object that stores state independent
         * of the current opened {@link workspace.workspaceFolders workspace}.
         */
        readonly globalState: Memento,
        /**
         * Primary service class
         */
        readonly service: VlocodeService,
        /**
         * The mode the extension is running in.
         */
        readonly mode: ExtensionMode) {
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
    return singleton(VlocodeContext,
        context.extensionPath,
        context.workspaceState,
        context.globalState,
        service,
        context.extensionMode
    );
}