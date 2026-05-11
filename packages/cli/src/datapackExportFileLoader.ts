import { dirname, isAbsolute, resolve } from 'path';
import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

import type { DatapackExportDefinition } from '@vlocode/vlocity-deploy';
import { getErrorMessage } from '@vlocode/util';

export type DatapackExportDefinitions = Record<string, DatapackExportDefinition>;
export type DatapackExportQueryGroup = Record<string, string[]>;

export type DatapackExportFile = {
    exportDefinitions?: string;
    expand?: boolean;
    folder?: string;
    maxDepth?: number;
    export: DatapackExportQueryGroup;
};

export class DatapackExportFileLoader {

    public async load(filePath: string): Promise<DatapackExportFile> {
        const loaded = await this.loadYamlOrJson(filePath);
        if (!this.isObject(loaded)) {
            throw new Error(`Invalid export file ${filePath}; expected a YAML object`);
        }
        if (!this.isQueryGroup(loaded.export)) {
            throw new Error(`Invalid export file ${filePath}; expected an "export" object with query strings`);
        }
        return {
            exportDefinitions: this.optionalFileReference(loaded.exportDefinitions, 'exportDefinitions', filePath),
            expand: this.optionalBoolean(loaded.expand, 'expand'),
            folder: this.optionalString(loaded.folder, 'folder'),
            maxDepth: this.normalizeDepth(loaded.depth),
            export: this.normalizeQueryGroup(loaded.export)
        };
    }

    public async loadDefinitions(filePath: string): Promise<DatapackExportDefinitions> {
        const definitions = this.getDefinitionMap(await this.loadYamlOrJson(filePath));
        if (!definitions) {
            throw new Error(`Invalid export definitions in ${filePath}; expected a YAML or JSON object`);
        }
        return definitions;
    }

    private async loadYamlOrJson(filePath: string) {
        try {
            if (/\.json$/i.test(filePath)) {
                return fs.readJson(filePath, { encoding: 'utf-8' });
            } else if (/\.ya?ml$/i.test(filePath)) {
                return yaml.load(await fs.readFile(filePath, { encoding: 'utf-8' }), { filename: filePath });
            } else {
                throw new Error('Unsupported file format, expected a YAML or JSON file');
            }
        } catch (err) {
            throw new Error(`Failed to load ${filePath}: ${getErrorMessage(err)}`);
        }
    }

    private getDefinitionMap(value: unknown): DatapackExportDefinitions | undefined {
        const definitions = this.isObject(value) && this.isObject(value.definitions)
            ? value.definitions
            : value;

        return this.isDefinitionMap(definitions) ? definitions : undefined;
    }

    private isDefinitionMap(value: unknown): value is DatapackExportDefinitions {
        return this.isObject(value) && Object.values(value).every(definition => this.isObject(definition));
    }

    private isQueryGroup(value: unknown): value is Record<string, string | string[]> {
        return this.isObject(value) && Object.values(value).every(
            queries => typeof queries === 'string' || (Array.isArray(queries) && queries.every(query => typeof query === 'string'))
        );
    }

    private normalizeQueryGroup(value: Record<string, string | string[]>): DatapackExportQueryGroup {
        return Object.fromEntries(
            Object.entries(value).map(([datapackType, queries]) => [
                datapackType,
                typeof queries === 'string' ? [queries] : queries
            ])
        );
    }

    private optionalBoolean(value: unknown, fieldName: string): boolean | undefined {
        if (value === undefined || typeof value === 'boolean') {
            return value;
        }
        throw new Error(`Invalid export file; "${fieldName}" must be a boolean`);
    }

    private optionalString(value: unknown, fieldName: string): string | undefined {
        if (value === undefined || typeof value === 'string') {
            return value;
        }
        throw new Error(`Invalid export file; "${fieldName}" must be a string`);
    }

    private optionalFileReference(value: unknown, fieldName: string, fromFile: string): string | undefined {
        const filePath = this.optionalString(value, fieldName);
        if (!filePath) {
            return;
        }

        const resolvedFilePath = isAbsolute(filePath) ? filePath : resolve(dirname(fromFile), filePath);
        if (!fs.existsSync(resolvedFilePath)) {
            throw new Error(`Invalid export file; "${fieldName}" references a file that does not exist: ${filePath}`);
        }
        return resolvedFilePath;
    }

    private normalizeDepth(value?: unknown): number | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value !== 'number' && typeof value !== 'string') {
            throw new Error('Depth must be an integer');
        }

        const depth = Number(value);
        if (!Number.isInteger(depth)) {
            throw new Error('Depth must be an integer');
        }
        return depth < 0 ? Number.MAX_SAFE_INTEGER : depth;
    }

    private isObject(value: unknown): value is Record<string, unknown> {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
}
