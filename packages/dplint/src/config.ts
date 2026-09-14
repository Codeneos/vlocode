import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSON_SCHEMA, load } from 'js-yaml';
import { FormulaRuleConfig, JsonObject, LintConfig, Severity } from './types';

export const configNames = ['dplint.config.yaml', 'dplint.config.yml', 'dplint.config.json', '.dplintrc.yaml', '.dplintrc.yml', '.dplintrc.json'];

export async function loadConfig(file?: string, cwd = process.cwd()): Promise<LintConfig> {
    for (const name of file ? [file] : configNames) {
        const path = resolve(cwd, name);
        let text: string;
        try { text = await readFile(path, 'utf8'); }
        catch (error) {
            if (!file && (error as NodeJS.ErrnoException).code === 'ENOENT') { continue; }
            throw error;
        }
        try {
            const config = /\.json$/i.test(path) ? JSON.parse(text) : load(text, { schema: JSON_SCHEMA });
            validateConfig(config);
            return config;
        } catch (error) { throw new Error(`Invalid configuration ${path}: ${(error as Error).message}`); }
    }
    return {};
}

function object(value: unknown): value is JsonObject { return value !== null && typeof value === 'object' && !Array.isArray(value); }
export function isSeverity(value: unknown): value is Severity { return value === 'off' || value === 'warn' || value === 'error'; }
function stringArray(value: unknown): value is string[] { return Array.isArray(value) && value.every(item => typeof item === 'string' && item.length > 0); }

export function validateConfig(config: unknown): asserts config is LintConfig {
    if (!object(config)) { throw new Error('Configuration must be an object'); }
    for (const key of Object.keys(config)) { if (!['files', 'ignore', 'rules'].includes(key)) { throw new Error(`Unknown configuration key: ${key}`); } }
    for (const key of ['files', 'ignore']) { if (config[key] !== undefined && !stringArray(config[key])) { throw new Error(`${key} must be an array of non-empty strings`); } }
    if (config.rules === undefined) { return; }
    if (!object(config.rules)) { throw new Error('rules must be an object keyed by rule ID'); }
    for (const [id, setting] of Object.entries(config.rules)) {
        if (isSeverity(setting)) { continue; }
        if (Array.isArray(setting) && setting.length === 2 && isSeverity(setting[0]) && object(setting[1])) { continue; }
        if (!object(setting) || setting.type !== 'formula') { throw new Error(`Invalid setting for rule ${id}`); }
        for (const key of Object.keys(setting)) {
            if (!['type', 'severity', 'objectTypes', 'when', 'assert', 'message', 'field'].includes(key)) { throw new Error(`Unknown option ${key} for formula rule ${id}`); }
        }
        if (setting.severity !== undefined && !isSeverity(setting.severity)) { throw new Error(`Invalid severity for rule ${id}`); }
        if (setting.objectTypes !== undefined && !stringArray(setting.objectTypes)) { throw new Error(`objectTypes must be an array for rule ${id}`); }
        for (const key of ['assert', 'message', ...(setting.when !== undefined ? ['when'] : []), ...(setting.field !== undefined ? ['field'] : [])]) {
            if (typeof setting[key] !== 'string' || !setting[key].trim()) { throw new Error(`${key} must be a non-empty string for rule ${id}`); }
        }
    }
}

export function isFormulaSetting(value: unknown): value is FormulaRuleConfig { return object(value) && value.type === 'formula'; }
