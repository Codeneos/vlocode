import { Logger, injectable } from "@vlocode/core";
import { Iterable, mapMerge, substringAfter } from "@vlocode/util";

import { SalesforceConnectionProvider } from "./connection";
import { QueryBuilder } from "./queryBuilder";
import { NamespaceService } from "./namespaceService";

export interface CustomLabel {
    id: string;
    namespace: string;
    /** Default value of the label */
    value: string;
    /** Default value of the label */
    language: string;
    /** Name of the label */
    name: string;
    /** Fully Qualified name of the label including namespace prefix */
    developerName: string;
    /** Localized version of the label value keyed by localization name, e.g: 'en-us', 'ja', etc */
    localizations: Record<string, string>;
}

interface ExternalString {
    Id: string;
    NamespacePrefix: string;
    Value: string;
    Language: string;
    Name: string;
}

interface LocalizedValue {
    Id: string;
    ParentId: string;
    Value: string;
    Language: string;
}

/**
 * Manages and retrieves Salesforce custom labels with support for localization.
 * 
 * This class provides functionality to:
 * - Retrieve custom labels by their developer names
 * - Cache labels for efficient repeated access
 * - Support language-specific localized versions of labels
 * - Resolve labels with proper namespace handling
 * 
 * The class maintains an in-memory cache of previously retrieved labels to minimize
 * API calls to Salesforce. When requested labels are not in the cache, it performs
 * a tooling API query to retrieve them along with their localizations.
 * 
 * @example
 * // Initialize the class
 * const labels = container.get(SalesforceLabels);
 * 
 * // Get custom labels
 * const myLabels = await labels.getCustomLabels(['Error_Message', 'Success_Message'], 'fr');
 * console.log(myLabels.Error_Message.value); // Shows French version if available
 */
@injectable.singleton()
export class SalesforceLabels {

    private labels = new Map<string, CustomLabel | null>();

    public constructor(
        private readonly connectionProvider: SalesforceConnectionProvider,
        private readonly nsService: NamespaceService,
        private readonly logger: Logger
    ) {
    }

    /**
     * Retrieves custom labels by their developer names.
     * 
     * This method first attempts to resolve the requested labels from the in-memory cache.
     * Any labels not found in the cache are looked up using the lookupLabels method.
     * 
     * @param labels - An array of label developer names/keys to retrieve
     * @param language - Optional language code to retrieve localized versions of the labels
     * @returns A promise that resolves to an object mapping label keys to their resolved values.
     * Each resolved value contains the developer name, the label text value, and the language code.
     * If a specific language is requested and available, the returned label will use that localization.
     */
    public async getCustomLabels(labels: string[], language?: string) {
        const unresolvedLabels: string[] = [];
        const resolvedLabels = this.resolveLabels(labels, unresolvedLabels);

        // Lookup the unresolved labels
        if (unresolvedLabels.length) {
            mapMerge(resolvedLabels, await this.lookupLabels(unresolvedLabels));
        }

        return Object.fromEntries(Iterable.map(resolvedLabels, ([key, label]) => {
            if (language) {
                const localizedLabel = label.localizations[language];
                if (localizedLabel) {
                    return [key, { name: label.developerName, value: localizedLabel, language: language }]
                }
            }
            return [key, 
                { 
                    name: label.developerName, 
                    value: label.localizations[label.language] ?? label.value, 
                    language: label.language 
                }
            ]
        }));
    }

    private async lookupLabels(labels: string[]) {
        this.logger.info(`Resolving custom labels: %s`, labels);
        const normalizedLabels = labels.map(label => substringAfter(label, '__'));
        const lookupQuery = new QueryBuilder('ExternalString', [ 'NamespacePrefix', 'Id', 'Name', 'Value', 'Language' ]).where.in('Name', normalizedLabels);
        const newLabels = new Map<string, CustomLabel>();
        const connection = await this.connectionProvider.getJsForceConnection();

        for await (const label of connection.query2<ExternalString>(lookupQuery.toString(), { type: 'tooling' })) {
            this.logger.debug(`LABEL %s=%s (%s)`, label.Name, label.Value, label.Language);
            const fqn = label.NamespacePrefix ? `${label.NamespacePrefix}__${label.Name}` : label.Name;
            const customLabel = {
                id: label.Id,
                namespace: label.NamespacePrefix,
                name: label.Name,
                developerName: fqn,
                value: label.Value,
                language: label.Language,
                localizations: {
                    [label.Language]: label.Value
                }
            };

            newLabels.set(customLabel.id, customLabel);
            this.labels.set(customLabel.developerName, customLabel);

            if (!this.labels.has(label.Name)) {
                // Add the label without namespace prefix
                this.labels.set(label.Name, customLabel);
            }
        }

        // Now lookup the localizations for the labels we found
        if (newLabels.size > 0) {
            const localizations = new QueryBuilder('LocalizedValue', [ 'Language', 'Value', 'ParentId' ]).where.in('ParentId', newLabels.keys());
            for await (const localization of connection.query2<LocalizedValue>(localizations.toString(), { type: 'tooling' })) {
                this.logger.debug(`LABEL %s=%s (%s)`, localization.ParentId, localization.Value, localization.Language);
                const label = newLabels.get(localization.ParentId);
                label!.localizations[localization.Language] = localization.Value;
            }
        }

        return this.resolveLabels(labels);
    }

    private resolveLabels(labels: string[], unresolvedLabels: string[] = []): Map<string, CustomLabel> {        
        const resolvedLabels = new Map<string, CustomLabel>();
        for (const key of labels) {
            const nsKey = this.nsService.updateNamespace(key);
            const label = this.labels.get(nsKey);
            if (label === undefined) {
                unresolvedLabels.push(key);
            } else if (label !== null) {
                resolvedLabels.set(key, label);
            }
        }
        return resolvedLabels;
    }
}