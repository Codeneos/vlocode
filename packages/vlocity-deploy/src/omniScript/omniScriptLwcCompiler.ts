
import { JSDOM } from 'jsdom';
import { Script } from 'vm';
import { SalesforceService, SalesforcePackage } from '@vlocode/salesforce';
import { injectable } from '@vlocode/core';
import { OmniScriptDefinition, OmniScriptDetail } from './omniScriptDefinition';
import { VlocityNamespaceService } from '../vlocityNamespaceService';
import { XML } from '@vlocode/util';

export interface CompiledResource {
    name: string,
    type: string,
    source: string
}

interface OmniCompiler {
    /**
     * Creates a list of LWC components from an OmniScripts
     * @param componentName Name of the LWC component to be generated
     * @param scriptDefinition Script definition created when activating an OmniScript stored as OmniScriptDefinition record
     * @param b 
     * @param c 
     * @param namespace Vlocity Namespace
     */
    compileActivated(componentName: string, scriptDefinition: OmniScriptDefinition, b: boolean, c: boolean, namespace: string): Promise<CompiledResource[]>
}

/**
 * Compiler that transforms activated OmniScripts into LWC components that can easily be deployed or written to the disk.
 */
@injectable()
export class OmniScriptLwcCompiler{

    private readonly lwcCompilerResource = 'OmniscriptLwcCompiler';
    private compiler: OmniCompiler;
    private compilerApiVersion: string;

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly namespaceService: VlocityNamespaceService) {
    }

    private async getCompiler() {
        if (this.compiler) {
            return this.compiler;
        }

        // fetch compiler script from server
        const [ compilerSource ] = await this.salesforceService.getStaticResource(this.lwcCompilerResource);
        
        if (!compilerSource) {
            throw new Error('Unable to find OmniScript LWC compiler; is the Vlocity managed package installed?');
        }


        // create JSDOM to init compiler
        const connection = await this.salesforceService.getJsForceConnection();
        if (!this.compilerApiVersion) {
            this.compilerApiVersion = connection.version;
        }

        const localDom = new JSDOM(`<!DOCTYPE html><script src="stub.js" type="text/javascript"></script>`, {
            url: connection.instanceUrl,
            contentType: "text/html",
            runScripts: "dangerously"
        });

        // Initialize the compiler and expose on the virtual DOM
        new Script(`
            ${(await compilerSource.getBody())
                .toString('utf-8')
                .replace(
                    /getApiVersion\s*=\s*function\s*\(\s*\)\s*{\s*return\s*['"`](.){4}['"`];?\s*}/gm,
                    `getApiVersion = function() { return '${this.compilerApiVersion}'; }`,
                )                
                .replace(
                    `module.exports = OmniscriptLwcCompiler;`, 
                    `module.exports = window.OmniscriptLwcCompiler = OmniscriptLwcCompiler;`
                )
            }
            this.lwcCompiler = new OmniscriptLwcCompiler('${compilerSource.namespace}');
        `).runInContext(localDom.getInternalVMContext());        
        this.compiler = localDom.window.lwcCompiler;

        // return the initialized compiler
        return this.compiler;
    }

    /**
     * Compiles an OmniScript into LWC components
     * @param scriptDefinition Definition of the OmniScript to compile
     * @param options Options to control the compilation
     * @returns 
     */
    public async compile(scriptDefinition: OmniScriptDefinition, options?: { lwcName?: string }) : Promise<{ name: string, resources: Array<CompiledResource> }> {
        // Get the name of the component or generate it and compile the OS
        const componentName = options?.lwcName ?? this.getLwcName({ type: scriptDefinition.bpType, subType: scriptDefinition.bpSubType, language: scriptDefinition.bpLang });
        const compiler = await this.getCompiler();
        const resources = await compiler.compileActivated(componentName, scriptDefinition, false, true, this.namespaceService.getNamespace());
        return { name: componentName, resources }
    }

    /**
     * Compile an OmniScript into a deployable Salesforce Tooling record
     * @param scriptDefinition Definition of the OmniScript to compile
     * @param options Options to control the compilation
     * @returns 
     */
    public async compileToToolingRecord(scriptDefinition: OmniScriptDefinition, options?: { lwcName?: string }) {
        // Get the name of the component or generate it and compile the OS
        const componentName = options?.lwcName ?? this.getLwcName({ type: scriptDefinition.bpType, subType: scriptDefinition.bpSubType, language: scriptDefinition.bpLang });
        const compiler = await this.getCompiler();
        const resources = await compiler.compileActivated(componentName, scriptDefinition, false, true, this.namespaceService.getNamespace());
        
        const componentMetaDefinition = resources.find(r => r.name.endsWith('.js-meta.xml'));
        if (!componentMetaDefinition) {
            throw new Error(`LWC compiler did not generate a .js-meta.xml file for ${componentName}`);
        }

        const { LightningComponentBundle: componentDef } = XML.parse(componentMetaDefinition.source);
        const targetConfigs = XML.stringify(componentDef.targetConfigs, undefined, { headless: true });

        const toolingMetadata = {
            apiVersion: componentDef.apiVersion,            
            lwcResources: {
                lwcResource: resources.filter(f => !f.name.endsWith('.js-meta.xml')).map(res =>({ 
                    filePath: res.name, 
                    source: Buffer.from(res.source, 'utf-8').toString('base64') 
                }))
            },
            capabilities: {
                capability: []
            },
            isExposed: componentDef.isExposed,
            description: componentDef.description,
            masterLabel: componentDef.masterLabel,
            runtimeNamespace: componentDef.runtimeNamespace,
            targets: componentDef.targets,
            targetConfigs: Buffer.from(targetConfigs, 'utf-8').toString('base64')
        }

        return {
            FullName: componentName,
            Metadata: toolingMetadata
        };
    }

    /**
     * Compile and package an OmniScript into a deployable Metadata package
     * @param scriptDefinition Definition of the OmniScript to compile
     * @param options Options to control the compilation and bundling
     * @returns 
     */
    public async compileToPackage(scriptDefinition: OmniScriptDefinition, options?: { lwcName?: string, apiVersion?: string }) {
        const compiledBundle = await this.compile(scriptDefinition, options);
        const sfPackage = new SalesforcePackage(options?.apiVersion ?? this.compilerApiVersion);

        for (const source of compiledBundle.resources) {
            sfPackage.add({
                xmlName: 'LightningComponentBundle',
                componentName: compiledBundle.name,
                packagePath: source.name,
                data: source.source
            });
        }

        return sfPackage;
    }

    /**
     * Generated the LWC component name from the OmniScript definition
     * @param scriptDefinition Definition of the OmniScript for which to generate the name
     */
    private getLwcName(script: OmniScriptDetail) {
        const cpType = String(script.type).charAt(0).toLowerCase() + String(script.type).slice(1);
        const cpSubType = String(script.subType).charAt(0).toUpperCase() + String(script.subType).slice(1);
        const cpLanguage = script.language ? (script.language.replace(/[\s()-]+/gi, '')) : script.language;
        return `${cpType}${cpSubType}${cpLanguage ?? ''}`;
    }
}
