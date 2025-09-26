
import { SalesforceService, SalesforcePackage, LightningComponentBundle } from '@vlocode/salesforce';
import { injectable, Logger } from '@vlocode/core';
import { VlocityNamespaceService } from '@vlocode/vlocity';
import { cache, Timer, XML } from '@vlocode/util';
import { FlexCardDesigner, FlexCardDesignerOptions } from './flexCardDesignerUtil';
import { FlexCardDefinition, FlexCardDefinitionAccess } from './flexCardDefinition';
import { DateTime } from 'luxon';

interface CompiledResource {
    name: string,
    source: string
}

export interface FlexCardCompileOptions { 
    lwcName?: string, 
    apiVersion?: string,
    useStandardRuntime?: boolean
}

/**
 * Compiler that transforms activated OmniScripts into LWC components that can easily be deployed or written to the disk.
 */
@injectable.transient()
export class FlexCardLwcCompiler {

    constructor(
        private readonly salesforceService: SalesforceService,
        private readonly cardAccess: FlexCardDefinitionAccess,
        private readonly namespaceService: VlocityNamespaceService,
        private readonly logger: Logger
    ) {
    }

    /**
     * Compiles a FlexCard definition into LWC files and returns the component name and compiled resources.
     *
     * Initializes the LWC generator using namespace and runtime settings derived from internal services and the
     * provided options, determines the component name (either from options.lwcName or derived from the card), and
     * invokes the generator to produce LWC files for the card. Only generated files whose filepath contains a '/'
     * are returned as compiled resources.
     *
     * @param card - The FlexCardDefinition to compile.
     * @param options - Optional compilation settings:
     *   - lwcName: explicit LWC component name to use instead of deriving one from the card.
     *   - useStandardRuntime: when true, use the standard LWC runtime.
     *   - apiVersion: API version to use for generator initialization (coerced to a Number); if omitted the service default is used.
     *
     * @returns A promise that resolves to an object with:
     *   - name: the LWC component name used for generation.
     *   - resources: an array of CompiledResource objects ({ name: string; source: string }) produced from generated files
     *     whose filepaths include a '/'.
     *
     * @remarks
     * - The LWC generator is initialized with:
     *     - nsPrefix: current namespace from namespaceService.getNamespace()
     *     - isInsidePackge: true when a namespace is present
     *     - isStdRuntime: boolean derived from options.useStandardRuntime
     *     - apiVersion: Number(options?.apiVersion ?? salesforceService.getApiVersion())
     * - The method delegates actual file generation to the generator's generateLWCFiles method and maps its output to the
     *   returned resources.
     * - Filepaths are returned as provided by the generator; only those containing '/' are considered resources here.
     *
     * @throws Will reject the returned promise if generator initialization or file generation fails, or if required services are unavailable.
     */
    public async compile(card: FlexCardDefinition, options?: FlexCardCompileOptions): Promise<{ name: string, resources: Array<CompiledResource> }> {
        // Get the name of the component or generate it and compile the FC
        const compiler = await this.initializeLwcGenerator({
            nsPrefix: this.namespaceService.getNamespace(),
            isInsidePackge: this.namespaceService.getNamespace() !== '',
            isStdRuntime: !!options?.useStandardRuntime,
            apiVersion: Number(options?.apiVersion ?? this.salesforceService.getApiVersion()),
        });
        const name = options?.lwcName ?? this.getLwcName(card);
        const metaObject = this.getCardMeta(card);        
        const files: Array<{
                filepath: string, 
                source: string 
            }> = compiler.generateLWCFiles(name, card, 'card', null, metaObject);

        return { 
            name: name, 
            resources: files
                .filter(({ filepath }) => filepath.includes('/'))
                .map(file => ({
                    name: file.filepath,
                    source: file.source,
                })
            )
        };
    }

    private async initializeLwcGenerator(options: FlexCardDesignerOptions) {
        FlexCardDesigner.configure({
            ...options,
            ...(await this.loadBundlesAndCards())
        });
        return FlexCardDesigner;
    }

    @cache({ ttl: 120, scope: 'instance' })
    private async loadBundlesAndCards() {
        this.logger.verbose('Initializing LWC Flex Card Compiler resources'); 
        const timer = new Timer();
        const [deployedLwcBundles, cards] = await Promise.all([
            this.getDeployedLwcBundles(),
            this.cardAccess.getFlexCardDefinitions()
        ]);
        this.logger.info(`Pre-loaded ${cards.size} Flex Cards and ${deployedLwcBundles.length} LWC bundles in ${timer.stop()}`); 

        return { 
            allLwcBundles: deployedLwcBundles, 
            childCards: [...cards.values()].filter(card => card.IsChildCard === true)
        };
    }

    private getCardMeta(card: FlexCardDefinition): any {
        const propertySet = typeof card.PropertySetConfig === 'string' 
            ? JSON.parse(card.PropertySetConfig) 
            : card.PropertySetConfig;

        const xmlTargets = XML.stringify(
            { targetConfig: propertySet.xmlJson ?? [] }, 
            { attributePrefix: '@attributes', headless: true }
        );

        return {
            isExposed: true,
            description: `Autogenerated LWC by Vlocode for Omni FlexCard ${card.Name} (${DateTime.now().toString()})`,
            targets: propertySet.xmlObject?.targets ?? ['lightning__RecordPage', 'lightning__AppPage', 'lightning__HomePage'],
            targetConfigs: Buffer.from(xmlTargets, 'utf-8').toString('base64'),
        };
    }

    /**
     * Compile an OmniScript into a deployable Salesforce Tooling record
     * @param scriptDefinition Definition of the OmniScript to compile
     * @param options Options to control the compilation
     * @returns 
     */
    public async compileToToolingRecord(card: FlexCardDefinition, options?: FlexCardCompileOptions) {
        // Get the name of the component or generate it and compile the OS
        const { name: componentName, resources } = await this.compile(card, options);

        const componentMetaDefinition = resources.find(r => r.name.endsWith('.js-meta.xml'));
        if (!componentMetaDefinition) {
            throw new Error(`LWC compiler did not generate a .js-meta.xml file for ${componentName}`);
        }

        const { LightningComponentBundle: componentDef } = XML.parse(componentMetaDefinition.source);
        const targetConfigs = XML.stringify(componentDef.targetConfigs, undefined, { headless: true });

        const toolingMetadata = {
            apiVersion: componentDef.apiVersion,
            lwcResources: {
                lwcResource: resources.filter(f => !f.name.endsWith('.js-meta.xml')).map(res => ({
                    filePath: res.name,
                    source: Buffer.from(res.source, 'utf-8').toString('base64')
                }))
            },
            capabilities: {
                capability: []
            },
            isExposed: componentDef.isExposed,
            description: componentDef.description,
            masterLabel: !card.IsActive ? `${card.Name} (disabled)` : `FlexCard: ${card.Name} (v${card.VersionNumber})`,
            runtimeNamespace: componentDef.runtimeNamespace ?? null,
            targets: componentDef.targets ?? null,
            targetConfigs: targetConfigs ? Buffer.from(targetConfigs, 'utf-8').toString('base64') : null
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
    public async compileToPackage(card: FlexCardDefinition, options?: FlexCardCompileOptions) {
        const compiledBundle = await this.compile(card, options);
        const sfPackage = new SalesforcePackage(options?.apiVersion ?? this.salesforceService.getApiVersion());

        for (const source of compiledBundle.resources) {
            sfPackage.add({
                componentType: 'LightningComponentBundle',
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
    public getLwcName(card: FlexCardDefinition) {
        const cardName = card.IsActive ? card.Name : [card.Name, (card.VersionNumber ?? 'legacy'), card.AuthorName].join('_');
        return FlexCardDesigner.convertNameToValidLWCCase(`${FlexCardDesigner.lwcPrefix}-${cardName}`);
    }

    private async getDeployedLwcBundles() {
        const connection = await this.salesforceService.getJsForceConnection();
        return connection.query2<LightningComponentBundle>(
            'SELECT Id, DeveloperName, NamespacePrefix, ApiVersion FROM LightningComponentBundle',
            { type: 'tooling' }
        );
    }
}
