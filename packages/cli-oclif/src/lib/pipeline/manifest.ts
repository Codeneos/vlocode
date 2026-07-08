import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';

/** Org-type condition gating whether a stage runs. */
export interface StageWhenCondition {
    orgType?: 'Sandbox' | 'Production';
    sandboxName?: string | string[];
}

/**
 * A single ordered step in a deploy pipeline. `type` selects the dispatcher: the deploy operations
 * (`metadata`, `datapack`, `destruct`) and the inline steps (`apex`, `batch`, `createRecords`,
 * `deleteRecords`) all execute directly against the native `@vlocode` services. Type-specific keys
 * are read by the runner via the index signature.
 */
export interface PipelineStage {
    name: string;
    type: string;
    when?: StageWhenCondition;
    continueOnError?: boolean;
    [key: string]: unknown;
}

export interface DeployPipeline {
    name?: string;
    description?: string;
    org?: { user?: string; instance?: string };
    variables?: Record<string, string>;
    /** Token replacements applied to the sources of every `metadata` stage. */
    tokens?: Record<string, string>;
    /** Pipeline-wide default for continue-on-error. `false` (default) = fail-fast. */
    continueOnError?: boolean;
    /** Values merged into every stage unless the stage overrides them. */
    defaults?: Record<string, unknown>;
    stages: PipelineStage[];
}

/** Valid stage types, all dispatched directly to native `@vlocode` services. */
export const PIPELINE_STAGE_TYPES = [
    'metadata', 'datapack', 'apex', 'batch', 'createRecords', 'deleteRecords', 'destruct',
] as const;

/**
 * Load, validate and interpolate a deploy pipeline manifest. `${var}` placeholders in string values
 * are substituted from `variables`, and top-level `defaults` are merged into every stage.
 */
export async function loadPipeline(filePath: string): Promise<DeployPipeline> {
    let raw: string;
    try {
        raw = await fs.readFile(filePath, 'utf8');
    } catch {
        throw new Error(`Cannot read pipeline manifest: ${filePath}`);
    }

    const parsed = yaml.load(raw) as DeployPipeline;
    validatePipeline(parsed, filePath);

    const variables = parsed.variables ?? {};
    const pipeline = interpolate(parsed, variables) as DeployPipeline;

    const defaults = pipeline.defaults ?? {};
    pipeline.stages = pipeline.stages.map(stage => ({ ...defaults, ...stage }));
    return pipeline;
}

function validatePipeline(pipeline: unknown, filePath: string): asserts pipeline is DeployPipeline {
    if (!pipeline || typeof pipeline !== 'object' || Array.isArray(pipeline)) {
        throw new Error(`Invalid pipeline manifest ${filePath}: expected a YAML object`);
    }
    const stages = (pipeline as DeployPipeline).stages;
    if (!Array.isArray(stages) || stages.length === 0) {
        throw new Error(`Invalid pipeline manifest ${filePath}: "stages" must be a non-empty array`);
    }
    stages.forEach((stage, index) => {
        if (!stage || typeof stage !== 'object') {
            throw new Error(`Invalid pipeline manifest ${filePath}: stage ${index + 1} must be an object`);
        }
        if (!stage.name) {
            throw new Error(`Invalid pipeline manifest ${filePath}: stage ${index + 1} is missing a "name"`);
        }
        if (!stage.type) {
            throw new Error(`Invalid pipeline manifest ${filePath}: stage "${stage.name}" is missing a "type"`);
        }
        if (!(PIPELINE_STAGE_TYPES as readonly string[]).includes(stage.type)) {
            throw new Error(
                `Invalid pipeline manifest ${filePath}: stage "${stage.name}" has invalid type "${stage.type}". ` +
                `Valid types: ${PIPELINE_STAGE_TYPES.join(', ')}`
            );
        }
    });
}

function interpolate(value: unknown, variables: Record<string, string>): unknown {
    if (typeof value === 'string') {
        return value.replace(/\$\{(\w+)\}/g, (_match, key: string) => (key in variables ? String(variables[key]) : `\${${key}}`));
    }
    if (Array.isArray(value)) {
        return value.map(item => interpolate(item, variables));
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, interpolate(item, variables)]));
    }
    return value;
}
