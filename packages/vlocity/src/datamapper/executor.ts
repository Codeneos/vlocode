import { deepClone, getErrorMessage } from '@vlocode/util';
import { OmniStudioFormulaEvaluator } from '../omnistudio/formula';
import {
    getDataMapperPathValue,
    getRecordFieldValue,
    joinDataMapperPath,
    pathStartsWith,
    setDataMapperPathValue,
    setRecordFieldValue,
    splitDataMapperPath
} from './path';
import type {
    DataMapperDefinition,
    DataMapperExecutionOptions,
    DataMapperExecutionPlan,
    DataMapperExecutionWarning,
    DataMapperExtractGroup,
    DataMapperFormulaStep,
    DataMapperItem,
    DataMapperMappingStep,
    NormalizedDataMapperItem
} from './types';

interface SourceNode {
    readonly path: string[];
    readonly segment: string;
    readonly record: Record<string, unknown>;
    readonly parent?: SourceNode;
    readonly children: Map<string, SourceNode[]>;
    readonly index: number;
}

interface SourceTree {
    readonly input: unknown;
    readonly roots: SourceNode[];
}

interface OutputContainer {
    readonly value: Record<string, unknown>;
    readonly children: Map<string, OutputContainer>;
}

interface BuiltExtractQuery {
    readonly soql: string;
    readonly invalidFields: readonly string[];
}

interface FilterValueResolution {
    readonly values: unknown[];
    readonly reference?: string;
    readonly unresolved?: boolean;
}

interface WhereResult {
    readonly where: string;
    readonly skip: boolean;
}

const formulaEvaluationFailed = Symbol('formulaEvaluationFailed');

export class DataMapperExecutor {
    private readonly formulas = new OmniStudioFormulaEvaluator();

    public buildExecutionPlan(definition: DataMapperDefinition, options: Pick<DataMapperExecutionOptions, 'onWarning'> = {}): DataMapperExecutionPlan {
        const data = this.getDefinitionData(definition);
        const type = String(data.Type ?? data.type ?? 'Extract').toLowerCase();
        const normalizedType = type.includes('load') ? 'load' : type.includes('transform') ? 'transform' : 'extract';
        const items = toArray(data.OmniDataTransformItem ?? data.omniDataTransformItem)
            .map(item => this.normalizeItem(item))
            .filter(item => item.source && !this.isDisabled(item.source));
        const formulas = items
            .filter(item => item.formulaExpression && item.formulaResultPath)
            .map(item => {
                try {
                    return {
                        item,
                        expression: item.formulaExpression!,
                        resultPath: item.formulaResultPath!,
                        sequence: item.formulaSequence ?? 0,
                        dependencies: this.formulas.dependencies(item.formulaExpression!)
                    };
                } catch (error) {
                    if (options.onWarning) {
                        this.warn(options, {
                            code: 'invalidFormula',
                            expression: item.formulaExpression,
                            outputPath: item.formulaResultPath,
                            sequence: item.formulaSequence,
                            message: `Skipping invalid DataMapper formula "${item.formulaExpression}" for result path "${item.formulaResultPath}": ${getErrorMessage(error)}`
                        });
                        return;
                    }
                    throw new Error(`Invalid DataMapper formula "${item.formulaExpression}" for result path "${item.formulaResultPath}": ${getErrorMessage(error)}`);
                }
            })
            .filter((formula): formula is DataMapperFormulaStep => !!formula)
            .sort((a, b) => a.sequence - b.sequence);
        const extractGroups = normalizedType === 'extract' ? this.createExtractGroups(items, formulas) : [];
        const mappings = items
            .filter(item => item.outputFieldName && item.outputObjectName !== 'Formula' && !item.formulaExpression && !this.isExtractionItem(item))
            .map(item => ({
                item,
                inputPath: item.inputFieldName,
                outputPath: item.outputFieldName!,
                outputFieldFormat: item.outputFieldFormat
            }));
        const requiredFieldsByObject = new Map(extractGroups.map(group => [group.objectName, group.fields]));
        return {
            type: normalizedType,
            inputType: String(data.InputType ?? data.inputType ?? 'JSON'),
            outputType: String(data.OutputType ?? data.outputType ?? 'JSON'),
            nullInputsIncludedInOutput: Boolean(data.IsNullInputsIncludedInOutput ?? data.nullInputsIncludedInOutput ?? false),
            items,
            extractGroups,
            formulas,
            mappings,
            requiredFieldsByObject
        };
    }

    public async execute(definition: DataMapperDefinition, inputJson: unknown, options: DataMapperExecutionOptions = {}): Promise<unknown> {
        const plan = this.buildExecutionPlan(definition, options);
        if (plan.type === 'load') {
            throw new Error('DataMapper Load execution is not supported because it requires Salesforce DML side effects');
        }
        if (!String(plan.inputType).toLowerCase().includes('json') || !String(plan.outputType).toLowerCase().includes('json')) {
            throw new Error(`Only JSON DataMapper execution is supported; input=${plan.inputType}, output=${plan.outputType}`);
        }
        const sourceTree = plan.type === 'extract'
            ? await this.executeExtractPlan(plan, inputJson, options)
            : this.createTransformSourceTree(inputJson);
        await this.executeFormulas(sourceTree, plan, options);
        return this.executeMappings(sourceTree, plan);
    }

    private async executeExtractPlan(plan: DataMapperExecutionPlan, inputJson: unknown, options: DataMapperExecutionOptions): Promise<SourceTree> {
        if (!options.queryRunner) {
            throw new Error('A queryRunner is required to execute Extract DataMappers');
        }
        const tree: SourceTree = { input: inputJson, roots: [] };
        for (const group of plan.extractGroups) {
            const query = await this.buildQuery(group, tree, options);
            if (!query) {
                continue;
            }
            const records = await options.queryRunner.query(query.soql);
            this.applyInvalidFieldNulls(records, query.invalidFields);
            this.attachExtractRecords(tree, group, records);
        }
        return tree;
    }

    private createTransformSourceTree(inputJson: unknown): SourceTree {
        if (Array.isArray(inputJson)) {
            return {
                input: inputJson,
                roots: inputJson.map((record, index) => this.createSourceNode([], String(index), toRecord(record), undefined, index))
            };
        }
        return {
            input: inputJson,
            roots: [this.createSourceNode([], '', toRecord(inputJson), undefined, 0)]
        };
    }

    private async executeFormulas(sourceTree: SourceTree, plan: DataMapperExecutionPlan, options: DataMapperExecutionOptions): Promise<void> {
        for (const formula of plan.formulas) {
            const { nodePath, fieldPath } = this.splitSourceFieldPath(formula.resultPath, plan);
            const nodes = this.findNodes(sourceTree, nodePath);
            for (const node of nodes) {
                const value = await this.evaluateFormula(formula, sourceTree, node, plan, options);
                if (value === formulaEvaluationFailed) {
                    continue;
                }
                if (fieldPath) {
                    if (plan.type === 'transform' && !nodePath.length) {
                        setDataMapperPathValue(node.record, fieldPath, value);
                    } else {
                        setRecordFieldValue(node.record, fieldPath, value);
                    }
                    this.attachFormulaResultNodes(node, nodePath, fieldPath, value);
                }
            }
        }
    }

    private async evaluateFormula(
        formula: DataMapperFormulaStep,
        sourceTree: SourceTree,
        node: SourceNode,
        plan: DataMapperExecutionPlan,
        options: DataMapperExecutionOptions
    ): Promise<unknown | typeof formulaEvaluationFailed> {
        try {
            return await this.formulas.evaluate(formula.expression, {
                source: node.record,
                queryRunner: options.queryRunner,
                functionRegistry: options.functionRegistry,
                timezone: options.timezone,
                now: options.now,
                resolvePath: path => this.resolveFormulaPath(sourceTree, node, path, plan)
            });
        } catch (error) {
            if (options.onWarning) {
                this.warn(options, {
                    code: 'formulaEvaluationFailed',
                    expression: formula.expression,
                    outputPath: formula.resultPath,
                    sequence: formula.sequence,
                    message: `DataMapper formula "${formula.expression}" failed for result path "${formula.resultPath}": ${getErrorMessage(error)}`
                });
                return formulaEvaluationFailed;
            }
            throw new Error(`DataMapper formula "${formula.expression}" failed for result path "${formula.resultPath}": ${getErrorMessage(error)}`);
        }
    }

    private attachFormulaResultNodes(parent: SourceNode, nodePath: string[], fieldPath: string, value: unknown): void {
        if (!Array.isArray(value) || fieldPath.includes(':') || fieldPath.includes('.')) {
            return;
        }
        const childPath = [...nodePath, fieldPath];
        const children = value
            .filter(item => item && typeof item === 'object')
            .map((item, index) => this.createSourceNode(childPath, fieldPath, item as Record<string, unknown>, parent, index));
        parent.children.set(fieldPath, children);
        parent.record[fieldPath] = children.map(child => child.record);
    }

    private executeMappings(sourceTree: SourceTree, plan: DataMapperExecutionPlan): unknown {
        if (plan.type === 'transform') {
            return this.executeTransformMappings(plan, sourceTree);
        }
        const outputRoot: Record<string, unknown> = {};
        const containers = new Map<SourceNode, OutputContainer>();
        for (const mapping of plan.mappings) {
            if (!mapping.outputPath) {
                continue;
            }
            if (isListFormat(mapping.outputFieldFormat) && !mapping.inputPath) {
                this.createListContainersForHint(sourceTree, outputRoot, containers, mapping, plan);
                continue;
            }
            const sourcePath = mapping.inputPath ?? '';
            const { nodePath, fieldPath } = this.splitSourceFieldPath(sourcePath, plan);
            const nodes = nodePath.length ? this.findNodes(sourceTree, nodePath) : sourceTree.roots;
            for (const node of nodes) {
                const value = this.mapValue(getRecordFieldValue(node.record, fieldPath), mapping.item);
                if (!plan.nullInputsIncludedInOutput && (value === null || value === undefined)) {
                    continue;
                }
                this.setOutputValue(outputRoot, containers, node, mapping.outputPath, value);
            }
        }
        return outputRoot;
    }

    private executeTransformMappings(plan: DataMapperExecutionPlan, sourceTree: SourceTree): unknown {
        const output: Record<string, unknown> = {};
        if (sourceTree.roots.length > 1) {
            const containers = new Map<SourceNode, OutputContainer>();
            for (const mapping of plan.mappings) {
                if (!mapping.inputPath) {
                    continue;
                }
                for (const node of sourceTree.roots) {
                    const value = this.mapValue(getDataMapperPathValue(node.record, mapping.inputPath), mapping.item);
                    if (!plan.nullInputsIncludedInOutput && (value === null || value === undefined)) {
                        continue;
                    }
                    this.setOutputValue(output, containers, node, mapping.outputPath, value);
                }
            }
            return output;
        }
        const input = sourceTree.roots[0]?.record ?? {};
        for (const mapping of plan.mappings) {
            if (!mapping.inputPath) {
                continue;
            }
            const value = this.mapValue(getDataMapperPathValue(input, mapping.inputPath), mapping.item);
            if (!plan.nullInputsIncludedInOutput && (value === null || value === undefined)) {
                continue;
            }
            setPath(output, mapping.outputPath, value, isListFormat(mapping.outputFieldFormat));
        }
        return output;
    }

    private setOutputValue(
        outputRoot: Record<string, unknown>,
        containers: Map<SourceNode, OutputContainer>,
        sourceNode: SourceNode,
        outputPath: string,
        value: unknown
    ): void {
        const outputParts = splitDataMapperPath(outputPath);
        const fieldName = outputParts.pop();
        if (!fieldName) {
            return;
        }
        const containerParts = outputParts;
        const sourceChain = this.outputSourceChain(sourceNode, containerParts.length);
        if (!sourceChain.length) {
            setPath(outputRoot, outputPath, value, false);
            return;
        }
        let owner: Record<string, unknown> = outputRoot;
        for (let index = 0; index < containerParts.length; index++) {
            const segment = containerParts[index];
            const source = sourceChain[index];
            let container = containers.get(source);
            if (!container) {
                container = { value: {}, children: new Map() };
                containers.set(source, container);
            }
            if (!Array.isArray(owner[segment])) {
                owner[segment] = [];
            }
            const array = owner[segment] as Record<string, unknown>[];
            if (!array.includes(container.value)) {
                array.push(container.value);
            }
            owner = container.value;
        }
        owner[fieldName] = value;
    }

    private createListContainersForHint(
        sourceTree: SourceTree,
        outputRoot: Record<string, unknown>,
        containers: Map<SourceNode, OutputContainer>,
        mapping: DataMapperMappingStep,
        plan: DataMapperExecutionPlan
    ): void {
        const hint = splitDataMapperPath(mapping.outputPath);
        const descendant = plan.mappings.find(candidate =>
            candidate.inputPath &&
            candidate.outputPath !== mapping.outputPath &&
            pathStartsWith(splitDataMapperPath(candidate.outputPath), hint)
        );
        if (!descendant?.inputPath) {
            return;
        }
        const { nodePath } = this.splitSourceFieldPath(descendant.inputPath, plan);
        const parentNodePath = nodePath.slice(0, Math.max(0, nodePath.length - 1));
        for (const node of this.findNodes(sourceTree, parentNodePath)) {
            const chain = this.outputSourceChain(node, Math.max(0, hint.length - 1));
            if (!chain.length) {
                continue;
            }
            let owner = outputRoot;
            for (let index = 0; index < hint.length; index++) {
                const segment = hint[index];
                if (index === hint.length - 1) {
                    owner[segment] ??= [];
                    continue;
                }
                const source = chain[index];
                let container = containers.get(source);
                if (!container) {
                    container = { value: {}, children: new Map() };
                    containers.set(source, container);
                }
                if (!Array.isArray(owner[segment])) {
                    owner[segment] = [];
                }
                const array = owner[segment] as Record<string, unknown>[];
                if (!array.includes(container.value)) {
                    array.push(container.value);
                }
                owner = container.value;
            }
        }
    }

    private outputSourceChain(node: SourceNode, containerCount: number): SourceNode[] {
        const ancestors = this.ancestors(node);
        if (!containerCount) {
            return [];
        }
        if (containerCount >= ancestors.length) {
            return ancestors;
        }
        return ancestors.slice(ancestors.length - containerCount);
    }

    private resolveFormulaPath(sourceTree: SourceTree, currentNode: SourceNode, path: string, plan: DataMapperExecutionPlan): unknown {
        const { nodePath, fieldPath } = this.splitSourceFieldPath(path, plan);
        if (!nodePath.length) {
            const currentValue = getDataMapperPathValue(currentNode.record, path);
            return currentValue === undefined ? getDataMapperPathValue(sourceTree.input, path) : currentValue;
        }
        if (arraysEqual(currentNode.path, nodePath)) {
            return getRecordFieldValue(currentNode.record, fieldPath);
        }
        const matchingAncestor = this.ancestors(currentNode).find(node => arraysEqual(node.path, nodePath));
        if (matchingAncestor) {
            return getRecordFieldValue(matchingAncestor.record, fieldPath);
        }
        const descendantNodes = this.findDescendantNodes(currentNode, nodePath);
        if (descendantNodes.length) {
            return fieldPath
                ? descendantNodes.map(node => getRecordFieldValue(node.record, fieldPath)).filter(value => value !== undefined)
                : descendantNodes.map(node => node.record);
        }
        if (pathStartsWith(nodePath, currentNode.path)) {
            return fieldPath ? [] : [];
        }
        const nodes = this.findNodes(sourceTree, nodePath);
        if (nodes.length) {
            return fieldPath
                ? nodes.map(node => getRecordFieldValue(node.record, fieldPath)).filter(value => value !== undefined)
                : nodes.map(node => node.record);
        }
        return getDataMapperPathValue(sourceTree.input, path);
    }

    private async buildQuery(group: DataMapperExtractGroup, sourceTree: SourceTree, options: DataMapperExecutionOptions): Promise<BuiltExtractQuery | undefined> {
        const { fields, invalidFields } = await this.resolveQueryFields(group, options);
        const where = this.buildWhere(group, sourceTree, options);
        if (where.skip) {
            return;
        }
        const orderBy = group.conditions.find(condition => condition.operator === 'ORDER BY')?.value;
        const limit = group.conditions.find(condition => condition.operator === 'LIMIT')?.value;
        const offset = group.conditions.find(condition => condition.operator === 'OFFSET')?.value;
        return {
            soql: [
                `SELECT ${fields.join(', ')}`,
                `FROM ${group.objectName}`,
                where.where ? `WHERE ${where.where}` : '',
                orderBy ? `ORDER BY ${orderBy}` : '',
                limit ? `LIMIT ${Number(limit)}` : '',
                offset ? `OFFSET ${Number(offset)}` : ''
            ].filter(Boolean).join(' '),
            invalidFields
        };
    }

    private buildWhere(group: DataMapperExtractGroup, sourceTree: SourceTree, options: DataMapperExecutionOptions): WhereResult {
        const conditions = group.conditions.filter(condition => !isSpecialFilter(condition.operator) && condition.fieldName);
        const groups = new Map<number, string[]>();
        for (const condition of conditions) {
            const resolution = this.resolveFilterValues(condition.value, sourceTree);
            const values = uniqueValues(resolution.values);
            if (resolution.unresolved || (resolution.reference && !values.length && !isNullOperator(condition.operator))) {
                const message = `Filter ${condition.fieldName} references unresolved DataMapper path "${resolution.reference}".`;
                if (!options.onWarning) {
                    throw new Error(message);
                }
                this.warn(options, {
                    code: 'unresolvedFilter',
                    objectName: group.objectName,
                    fieldName: condition.fieldName,
                    outputPath: group.outputPath,
                    sequence: group.sequence,
                    message: `Skipping ${group.objectName} extract step ${group.sequence} because ${message}`
                });
                return { where: '', skip: true };
            }
            const expression = formatCondition(condition.fieldName!, condition.operator, values);
            const current = groups.get(condition.filterGroup) ?? [];
            current.push(expression);
            groups.set(condition.filterGroup, current);
        }
        return {
            where: [...groups.values()].map(groupConditions =>
                groupConditions.length > 1 ? `(${groupConditions.join(' AND ')})` : groupConditions[0]
            ).join(' OR '),
            skip: false
        };
    }

    private resolveFilterValues(value: string | undefined, sourceTree: SourceTree): FilterValueResolution {
        if (!value) {
            return { values: [undefined] };
        }
        const normalizedValue = value.trim();
        if (isQuoted(normalizedValue)) {
            return { values: [normalizedValue.slice(1, -1)] };
        }
        const constant = resolveDataMapperConstant(normalizedValue);
        if (constant.resolved) {
            return { values: [constant.value] };
        }
        const path = splitDataMapperPath(normalizedValue);
        const matchingGroupPath = this.findKnownSourcePath(sourceTree, path);
        if (matchingGroupPath.length) {
            const fieldPath = joinDataMapperPath(path.slice(matchingGroupPath.length));
            return {
                values: this.findNodes(sourceTree, matchingGroupPath).map(node => getRecordFieldValue(node.record, fieldPath)),
                reference: normalizedValue
            };
        }
        const inputValue = getDataMapperPathValue(sourceTree.input, normalizedValue);
        if (inputValue !== undefined) {
            return { values: [inputValue], reference: normalizedValue };
        }
        if (looksLikeDataMapperReference(normalizedValue)) {
            return { values: [], reference: normalizedValue, unresolved: true };
        }
        return { values: [normalizedValue] };
    }

    private async resolveQueryFields(group: DataMapperExtractGroup, options: DataMapperExecutionOptions): Promise<{ fields: string[]; invalidFields: string[] }> {
        const requestedFields = group.fields.length ? group.fields : ['Id'];
        if (!options.validateField) {
            return { fields: requestedFields, invalidFields: [] };
        }

        const fields = new Array<string>();
        const invalidFields = new Array<string>();
        for (const fieldName of requestedFields) {
            try {
                if (await options.validateField(group.objectName, fieldName, {
                    objectName: group.objectName,
                    fieldName,
                    outputPath: group.outputPath,
                    sequence: group.sequence
                })) {
                    fields.push(fieldName);
                    continue;
                }
                invalidFields.push(fieldName);
                this.warn(options, {
                    code: 'invalidField',
                    objectName: group.objectName,
                    fieldName,
                    outputPath: group.outputPath,
                    sequence: group.sequence,
                    message: `Skipping invalid field "${fieldName}" on ${group.objectName}; preview will resolve it as null.`
                });
            } catch (error) {
                fields.push(fieldName);
                this.warn(options, {
                    code: 'fieldValidationFailed',
                    objectName: group.objectName,
                    fieldName,
                    outputPath: group.outputPath,
                    sequence: group.sequence,
                    message: `Could not validate field "${fieldName}" on ${group.objectName}: ${getErrorMessage(error)}`
                });
            }
        }

        return { fields: fields.length ? fields : ['Id'], invalidFields };
    }

    private applyInvalidFieldNulls(records: Record<string, unknown>[], invalidFields: readonly string[]): void {
        for (const record of records) {
            for (const field of invalidFields) {
                setRecordFieldValue(record, field, null);
            }
        }
    }

    private attachExtractRecords(tree: SourceTree, group: DataMapperExtractGroup, records: Record<string, unknown>[]): void {
        const groupPath = splitDataMapperPath(group.outputPath);
        const parentPath = groupPath.slice(0, -1);
        const segment = groupPath[groupPath.length - 1] ?? group.objectName;
        const parentNodes = parentPath.length ? this.findNodes(tree, parentPath) : [];
        if (!parentNodes.length) {
            records.forEach((record, index) => tree.roots.push(this.createSourceNode(groupPath, segment, record, undefined, index)));
            return;
        }
        const link = group.conditions.find(condition =>
            condition.fieldName &&
            condition.value &&
            pathStartsWith(splitDataMapperPath(condition.value), parentPath)
        );
        for (const parent of parentNodes) {
            const childRecords = link
                ? records.filter(record => getRecordFieldValue(record, link.fieldName) === this.resolveParentLinkValue(parent, link.value!))
                : records;
            const children = childRecords.map((record, index) => this.createSourceNode(groupPath, segment, record, parent, index));
            parent.children.set(segment, children);
            parent.record[segment] = children.map(child => child.record);
        }
    }

    private resolveParentLinkValue(parent: SourceNode, valuePath: string): unknown {
        const path = splitDataMapperPath(valuePath);
        const fieldPath = joinDataMapperPath(path.slice(parent.path.length));
        if (pathStartsWith(path, parent.path)) {
            return getRecordFieldValue(parent.record, fieldPath);
        }
        return getRecordFieldValue(parent.record, valuePath);
    }

    private createExtractGroups(items: NormalizedDataMapperItem[], formulas: DataMapperFormulaStep[]): DataMapperExtractGroup[] {
        const groupMap = new Map<string, NormalizedDataMapperItem[]>();
        for (const item of items.filter(item => this.isExtractionItem(item))) {
            const key = [item.inputObjectName ?? '', item.outputFieldName ?? '', item.inputObjectQuerySequence ?? 0].join('\u001f');
            groupMap.set(key, [...groupMap.get(key) ?? [], item]);
        }
        const groups = [...groupMap.values()].map(groupItems => {
            const first = groupItems[0];
            const conditions = groupItems
                .filter(item => item.filterOperator || item.inputFieldName)
                .map(item => ({
                    item,
                    fieldName: item.inputFieldName,
                    operator: normalizeFilterOperator(item.filterOperator),
                    value: item.filterValue,
                    filterGroup: item.filterGroup ?? 0
                }));
            return {
                objectName: first.inputObjectName!,
                outputPath: first.outputFieldName ?? first.inputObjectName!,
                sequence: first.inputObjectQuerySequence ?? 0,
                items: groupItems,
                conditions,
                fields: []
            };
        }).sort((a, b) => a.sequence - b.sequence);

        return groups.map(group => ({
            ...group,
            fields: this.inferFields(group, groups, items, formulas)
        }));
    }

    private inferFields(
        group: Omit<DataMapperExtractGroup, 'fields'>,
        groups: Array<Omit<DataMapperExtractGroup, 'fields'>>,
        items: NormalizedDataMapperItem[],
        formulas: DataMapperFormulaStep[]
    ): string[] {
        const fields = new Set<string>(['Id']);
        const formulaResultPaths = new Set(formulas.map(formula => formula.resultPath));
        const addPath = (path: string | undefined, options?: { allowFormulaResultPath?: boolean }) => {
            if (!path || (!options?.allowFormulaResultPath && formulaResultPaths.has(path))) {
                return;
            }
            const { nodePath, fieldPath } = this.splitSourceFieldPath(path, { extractGroups: groups as DataMapperExtractGroup[], formulas } as DataMapperExecutionPlan);
            if (fieldPath && joinDataMapperPath(nodePath) === group.outputPath) {
                fields.add(fieldPath);
            }
        };
        for (const condition of group.conditions) {
            if (condition.fieldName && !isSpecialFilter(condition.operator)) {
                fields.add(condition.fieldName);
            }
            addPath(condition.value);
        }
        for (const item of items) {
            addPath(item.inputFieldName);
        }
        const producedFormulaPaths = new Set<string>();
        for (const formula of formulas) {
            formula.dependencies
                .filter(dependency => !producedFormulaPaths.has(dependency))
                .forEach(dependency => addPath(dependency, { allowFormulaResultPath: true }));
            if (formula.dependencies.includes(group.outputPath)) {
                const resultPrefix = `${formula.resultPath}:`;
                for (const item of items) {
                    if (item.inputFieldName?.startsWith(resultPrefix)) {
                        fields.add(item.inputFieldName.slice(resultPrefix.length));
                    }
                }
            }
            producedFormulaPaths.add(formula.resultPath);
        }
        return [...fields].sort();
    }

    private splitSourceFieldPath(path: string, plan: Pick<DataMapperExecutionPlan, 'extractGroups'> & Partial<Pick<DataMapperExecutionPlan, 'formulas'>>): { nodePath: string[]; fieldPath: string } {
        const parts = splitDataMapperPath(path);
        const groupPaths = [
            ...plan.extractGroups.map(group => splitDataMapperPath(group.outputPath)),
            ...(plan.formulas ?? [])
                .map(formula => splitDataMapperPath(formula.resultPath))
                .filter(formulaPath => parts.length > formulaPath.length)
        ].sort((a, b) => b.length - a.length);
        const groupPath = groupPaths.find(candidate => pathStartsWith(parts, candidate));
        if (!groupPath) {
            return { nodePath: [], fieldPath: path };
        }
        return {
            nodePath: groupPath,
            fieldPath: joinDataMapperPath(parts.slice(groupPath.length))
        };
    }

    private mapValue(value: unknown, item: NormalizedDataMapperItem): unknown {
        if ((value === undefined || value === null || value === '') && item.defaultValue !== undefined && item.defaultValue !== '') {
            value = normalizeDefaultValue(item.defaultValue);
        }
        value = applyTransformValueMapping(value, item.transformValueMappings);
        return coerceOutputValue(value, item.outputFieldFormat);
    }

    private findKnownSourcePath(sourceTree: SourceTree, path: string[]): string[] {
        for (let length = path.length; length > 0; length--) {
            const candidate = path.slice(0, length);
            if (this.findNodes(sourceTree, candidate).length) {
                return candidate;
            }
        }
        return [];
    }

    private findNodes(sourceTree: SourceTree, path: readonly string[]): SourceNode[] {
        if (!path.length) {
            return sourceTree.roots;
        }
        const result = new Array<SourceNode>();
        const visit = (nodes: readonly SourceNode[]) => {
            for (const node of nodes) {
                if (arraysEqual(node.path, path)) {
                    result.push(node);
                }
                for (const children of node.children.values()) {
                    visit(children);
                }
            }
        };
        visit(sourceTree.roots);
        return result;
    }

    private findDescendantNodes(currentNode: SourceNode, path: readonly string[]): SourceNode[] {
        const result = new Array<SourceNode>();
        const visit = (node: SourceNode) => {
            for (const children of node.children.values()) {
                for (const child of children) {
                    if (arraysEqual(child.path, path)) {
                        result.push(child);
                    }
                    visit(child);
                }
            }
        };
        visit(currentNode);
        return result;
    }

    private ancestors(node: SourceNode): SourceNode[] {
        const ancestors = new Array<SourceNode>();
        for (let current: SourceNode | undefined = node; current; current = current.parent) {
            ancestors.unshift(current);
        }
        return ancestors;
    }

    private createSourceNode(path: string[], segment: string, record: Record<string, unknown>, parent: SourceNode | undefined, index: number): SourceNode {
        return { path, segment, record, parent, children: new Map(), index };
    }

    private getDefinitionData(definition: DataMapperDefinition): DataMapperDefinition {
        return (definition?.data && typeof definition.data === 'object' ? definition.data : definition) ?? {};
    }

    private normalizeItem(item: DataMapperItem): NormalizedDataMapperItem {
        return {
            source: item,
            defaultValue: item.DefaultValue ?? item.defaultValue,
            filterGroup: numberOrUndefined(item.FilterGroup ?? item.filterGroup),
            filterOperator: item.FilterOperator ?? item.filterOperator,
            filterValue: item.FilterValue ?? item.filterValue,
            formulaExpression: item.FormulaExpression ?? item.formulaExpression,
            formulaResultPath: item.FormulaResultPath ?? item.formulaResultPath,
            formulaSequence: numberOrUndefined(item.FormulaSequence ?? item.formulaSequence),
            inputFieldName: item.InputFieldName ?? item.inputFieldName,
            inputObjectName: item.InputObjectName ?? item.inputObjectName,
            inputObjectQuerySequence: numberOrUndefined(item.InputObjectQuerySequence ?? item.inputObjectQuerySequence),
            outputCreationSequence: numberOrUndefined(item.OutputCreationSequence ?? item.outputCreationSequence),
            outputFieldFormat: item.OutputFieldFormat ?? item.outputFieldFormat,
            outputFieldName: item.OutputFieldName ?? item.outputFieldName,
            outputObjectName: item.OutputObjectName ?? item.outputObjectName,
            transformValueMappings: item.TransformValuesMappings ?? item.TransformValueMappings ?? item.transformValueMappings ?? item.transformValuesMappings
        };
    }

    private isDisabled(item: DataMapperItem) {
        return item.IsDisabled === true || item.disabled === true;
    }

    private isExtractionItem(item: NormalizedDataMapperItem) {
        return (!!item.inputObjectName || Number(item.inputObjectQuerySequence || 0) > 0) && !item.formulaExpression && item.outputObjectName !== 'Formula';
    }

    private warn(options: Pick<DataMapperExecutionOptions, 'onWarning'>, warning: DataMapperExecutionWarning): void {
        options.onWarning?.(warning);
    }
}

function numberOrUndefined(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const number = Number(value);
    return Number.isNaN(number) ? undefined : number;
}

function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function toRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? deepClone(value) as Record<string, unknown> : {};
}

function isSpecialFilter(operator: string) {
    return ['LIMIT', 'OFFSET', 'ORDER BY'].includes(operator.toUpperCase());
}

function isNullOperator(operator: string) {
    return ['IS NULL', 'IS NOT NULL'].includes(operator.toUpperCase());
}

function normalizeFilterOperator(operator: string | undefined) {
    const normalized = String(operator ?? '=').trim().toUpperCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
    switch (normalized) {
        case '':
        case '=':
        case '==':
        case 'EQUAL':
        case 'EQUALS':
        case 'EQUAL TO':
            return '=';
        case '!=':
        case '<>':
        case 'NOT EQUAL':
        case 'NOT EQUALS':
        case 'NOT EQUAL TO':
            return '!=';
        case 'GREATER THAN':
            return '>';
        case 'GREATER THAN OR EQUAL':
        case 'GREATER THAN OR EQUAL TO':
            return '>=';
        case 'LESS THAN':
            return '<';
        case 'LESS THAN OR EQUAL':
        case 'LESS THAN OR EQUAL TO':
            return '<=';
        case 'CONTAINS':
            return 'CONTAINS';
        case 'STARTS WITH':
            return 'STARTS WITH';
        case 'ENDS WITH':
            return 'ENDS WITH';
        case 'IS NULL':
            return 'IS NULL';
        case 'IS NOT NULL':
            return 'IS NOT NULL';
        default:
            return normalized;
    }
}

function isListFormat(format: string | undefined) {
    return String(format ?? '').toLowerCase().startsWith('list<');
}

function arraysEqual(left: readonly string[], right: readonly string[]) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function uniqueValues(values: unknown[]) {
    return [...new Set(flattenFilterValues(values).filter(value => value !== undefined))];
}

function formatCondition(fieldName: string, operator: string, values: unknown[]) {
    const normalizedOperator = operator.toUpperCase();
    if (normalizedOperator === 'IS NULL') {
        return `${fieldName} = null`;
    }
    if (normalizedOperator === 'IS NOT NULL') {
        return `${fieldName} != null`;
    }
    if (normalizedOperator === 'CONTAINS') {
        return `${fieldName} LIKE ${formatSoqlValue(`%${values[0] ?? ''}%`)}`;
    }
    if (normalizedOperator === 'STARTS WITH') {
        return `${fieldName} LIKE ${formatSoqlValue(`${values[0] ?? ''}%`)}`;
    }
    if (normalizedOperator === 'ENDS WITH') {
        return `${fieldName} LIKE ${formatSoqlValue(`%${values[0] ?? ''}`)}`;
    }
    if (normalizedOperator === 'IN' || ((normalizedOperator === '=' || normalizedOperator === '==') && values.length > 1)) {
        return `${fieldName} IN (${values.map(formatSoqlValue).join(', ')})`;
    }
    if (normalizedOperator === 'NOT IN' || ((normalizedOperator === '!=' || normalizedOperator === '<>') && values.length > 1)) {
        return `${fieldName} NOT IN (${values.map(formatSoqlValue).join(', ')})`;
    }
    return `${fieldName} ${operator} ${formatSoqlValue(values[0])}`;
}

function flattenFilterValues(values: unknown[]): unknown[] {
    return values.flatMap(value => Array.isArray(value) ? flattenFilterValues(value) : [value]);
}

function formatSoqlValue(value: unknown): string {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function isQuoted(value: string) {
    return (value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'));
}

function looksLikeDataMapperReference(value: string) {
    const path = splitDataMapperPath(value);
    return path.some(isIndexedDataMapperPathSegment)
        || (path.length >= 2 && path.every(isDataMapperPathSegment) && path.some(isStructuredDataMapperPathSegment));
}

function isIndexedDataMapperPathSegment(segment: string) {
    return /\|(\d+|n)$/i.test(segment) && isDataMapperPathSegment(segment);
}

function isDataMapperPathSegment(segment: string) {
    const name = segment.replace(/\|(\d+|n)$/i, '');
    return /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(name);
}

function isStructuredDataMapperPathSegment(segment: string) {
    const name = segment.replace(/\|(\d+|n)$/i, '');
    return name.includes('.') || /__(c|r)(\.|$)/i.test(name);
}

function setPath(target: Record<string, unknown>, path: string, value: unknown, listFormat: boolean): void {
    const parts = splitDataMapperPath(path);
    let owner = target;
    for (const [index, part] of parts.entries()) {
        const isLast = index === parts.length - 1;
        if (isLast) {
            owner[part] = listFormat && !Array.isArray(value) ? toArray(value) : value;
            return;
        }
        if (!owner[part] || typeof owner[part] !== 'object' || Array.isArray(owner[part])) {
            owner[part] = {};
        }
        owner = owner[part] as Record<string, unknown>;
    }
}

function applyTransformValueMapping(value: unknown, mappings: unknown): unknown {
    const normalizedMappings = typeof mappings === 'string' && mappings.trim()
        ? tryParseJson(mappings) : mappings;
    if (Array.isArray(normalizedMappings)) {
        const mapping = normalizedMappings
            .map(normalizeValueMappingEntry)
            .find(entry => entry && String(value) === String(entry.source));
        return mapping ? mapping.target : value;
    }
    if (!normalizedMappings || typeof normalizedMappings !== 'object') {
        return value;
    }
    const map = normalizedMappings as Record<string, unknown>;
    return String(value) in map ? map[String(value)] : value;
}

function normalizeValueMappingEntry(entry: unknown): { source: unknown; target: unknown } | undefined {
    if (!entry || typeof entry !== 'object') {
        return undefined;
    }
    const record = entry as Record<string, unknown>;
    const source = record.source ?? record.Source ?? record.input ?? record.Input ?? record.from ?? record.From ?? record.value ?? record.Value;
    const target = record.target ?? record.Target ?? record.output ?? record.Output ?? record.to ?? record.To ?? record.label ?? record.Label;
    return source === undefined ? undefined : { source, target };
}

function normalizeDefaultValue(value: unknown): unknown {
    if (typeof value !== 'string') {
        return value;
    }
    const constant = resolveDataMapperConstant(value);
    if (constant.resolved) {
        return constant.value;
    }
    const trimmed = value.trim();
    if (trimmed === '""' || trimmed === "''") {
        return '';
    }
    return value;
}

function resolveDataMapperConstant(value: string): { resolved: boolean; value?: unknown } {
    const normalized = value.trim().toUpperCase();
    switch (normalized) {
        case '$VLOCITY.NULL':
        case 'NULL':
            return { resolved: true, value: null };
        case '$VLOCITY.TRUE':
        case 'TRUE':
            return { resolved: true, value: true };
        case '$VLOCITY.FALSE':
        case 'FALSE':
            return { resolved: true, value: false };
        case '$VLOCITY.EMPTYSTRING':
        case '$VLOCITY.EMPTY':
            return { resolved: true, value: '' };
        default:
            return { resolved: false };
    }
}

function coerceOutputValue(value: unknown, format: string | undefined): unknown {
    const normalized = String(format ?? '').toLowerCase();
    if (!normalized) {
        return value;
    }
    if (normalized.startsWith('list<')) {
        return Array.isArray(value) ? value : value === undefined || value === null ? [] : [value];
    }
    if (normalized.includes('integer') || normalized === 'long') {
        return value === undefined || value === null || value === '' ? value : Math.trunc(Number(value));
    }
    if (normalized.includes('double') || normalized.includes('decimal') || normalized.includes('currency')) {
        return value === undefined || value === null || value === '' ? value : Number(value);
    }
    if (normalized.includes('boolean')) {
        return typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);
    }
    if (normalized.includes('string')) {
        return value === undefined || value === null ? value : String(value);
    }
    if (normalized === 'json' && typeof value === 'string') {
        return tryParseJson(value);
    }
    return value;
}

function tryParseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}
