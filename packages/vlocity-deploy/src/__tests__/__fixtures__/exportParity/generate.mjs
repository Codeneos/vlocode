// Manual oracle generation: uses Build Tools only, never the direct exporter.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';
import console from 'node:console';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const fixtureDir = path.dirname(fileURLToPath(import.meta.url));
const extensionRequire = createRequire(path.resolve(fixtureDir, '../../../../../vscode-extension/package.json'));
const yaml = extensionRequire('js-yaml');
extensionRequire.extensions['.yaml'] = (module, file) => { module.exports = yaml.load(fs.readFileSync(file, 'utf8')); };
const Vlocity = extensionRequire('vlocity/lib/vlocity');
const version = extensionRequire('vlocity/package.json').version;
if (version !== '1.14.18') throw new Error(`Review the oracle upgrade before regenerating: ${version}`);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vlocode-export-parity-'));

function fixture(runtime, datapackType) {
    const managed = runtime === 'managed';
    const field = (native, custom) => managed ? `%vlocity_namespace%__${custom}__c` : native;
    const dr = datapackType === 'DataRaptor';
    const rootType = field(dr ? 'OmniDataTransform' : 'OmniProcess', dr ? 'DRBundle' : 'OmniScript');
    const childType = field(dr ? 'OmniDataTransformItem' : 'OmniProcessElement', dr ? 'DRMapItem' : 'Element');
    const ownerField = field(dr ? 'OmniDataTransformationId' : 'OmniProcessId', dr ? 'DRBundleId' : 'OmniScriptId');
    const parentField = field('ParentElementId', 'ParentElementId');
    const rootId = 'a00000000000001AAA';
    const root = { Id: rootId, __type: rootType, Name: dr ? 'MappingParity' : 'ScriptParity' };
    const references = { [childType]: { [ownerField]: rootType, ...(!dr && { [parentField]: childType }) } };
    const matchingKeys = { [rootType]: dr ? ['Name'] : [field('Type', 'Type'), field('SubType', 'SubType'), field('Language', 'Language'), field('VersionNumber', 'Version')],
        [childType]: dr ? (managed ? [field('GlobalKey', 'MapId'), 'Name'] : []) : [ownerField, 'Name'] };
    let children;
    if (dr) {
        Object.assign(root, { [field('GlobalKey', 'GlobalKey')]: 'fixture-global-key',
            [field('ExpectedInputJson', 'InputJson')]: '{"z":[{"Name":"Z"},{"Name":"A"}],"a":1}',
            [field('ExpectedOutputXml', 'TargetOutXml')]: '<result>fixture</result>', Description: null });
        if (!managed) root.IsActive = true;
        const priorities = ['InputObjectQuerySequence', 'FilterGroup', 'OutputCreationSequence', 'OutputObjectName', 'OutputFieldName', 'InputFieldName']
            .map((name, index) => field(name, ['InterfaceObjectLookupOrder', 'FilterGroup', 'DomainObjectCreationOrder', 'DomainObjectAPIName', 'DomainObjectFieldAPIName', 'InterfaceFieldAPIName'][index]));
        children = [
            [1, 1, 1, 'Record', 'Z', 'inputZ'],
            [null, null, null, null, null, null],
            [1, 1, 1, 'Record', 'A', 'inputA'],
            [null, null, null, null, null, null],
            [0, 1, 1, 'Record', 'Zero', 'inputZero']
        ].map((values, index) => ({ Id: `a0100000000000${index+1}AAA`, __type: childType, Name: root.Name,
            [ownerField]: rootId, [field('GlobalKey', 'MapId')]: `mapping-${index+1}`,
            ...Object.fromEntries(priorities.map((name, i) => [name, values[i]])),
            [field('FormulaExpression', 'Formula')]: index === 1 ? 'Z_FORMULA' : index === 3 ? 'A_FORMULA' : null,
            [field('FormulaConverted', 'FormulaConverted')]: null, Empty: null }));
    } else {
        Object.assign(root, { [field('Type', 'Type')]: 'Fixture', [field('SubType', 'SubType')]: datapackType,
            [field('Language', 'Language')]: 'English', [field('VersionNumber', 'Version')]: 64,
            [field('IsIntegrationProcedure', 'IsProcedure')]: datapackType === 'IntegrationProcedure',
            [field('IsActive', 'IsActive')]: true,
            [field('PropertySetConfig', 'PropertySet')]: '{"z":[{"Name":"Z"},{"Name":"A"}],"a":1}',
            [field('CustomJavaScript', 'CustomJavaScript')]: datapackType === 'IntegrationProcedure' ? '{"z":2,"a":1}' : 'console.log("fixture");',
            [field('ElementTypeComponentMapping', 'OmniScriptDefinitions')]: '{"z":2,"a":1}', Description: null });
        const specs = [['First',1,0,null],['ChildB',1,1,5],['ChildA',1,1,4],['ParentA',2,0,null],['ParentB',3,0,null],['Last',4,0,null]];
        children = specs.map(([Name, order, level, parent], index) => ({ Id: `a0100000000000${index+1}AAA`, __type: childType, Name,
            [ownerField]: rootId, [parentField]: parent ? `a0100000000000${parent}AAA` : null,
            [field('SequenceNumber', 'Order')]: order, [field('Level', 'Level')]: level,
            [field('PropertySetConfig', 'PropertySet')]: '{"z":2,"a":1}', Empty: null }));
    }
    return { runtime, datapackType, rootId, rootType, childType, references, matchingKeys, records: [root, ...children] };
}

// Build Tools normally receives SObjects/references from the Salesforce DataPack service.
// This adapter supplies that transport from the synthetic records; no Salesforce connection is used.
function toolsTransport(f) {
    const byId = new Map(f.records.map(record => [record.Id, record]));
    const convert = (record, reference = false) => {
        const output = { VlocityDataPackType: reference ? 'VlocityMatchingKeyObject' : 'SObject', VlocityRecordSObjectType: record.__type,
            [reference ? 'VlocityMatchingRecordSourceKey' : 'VlocityRecordSourceKey']: `fixture/${record.Id}` };
        if (reference) { output.Name = record.Name; return output; }
        for (const [name, value] of Object.entries(record)) {
            if (name === '__type' || (f.datapackType === 'DataRaptor' && f.runtime === 'standard' && name === 'IsActive')) continue;
            output[name] = f.references[record.__type]?.[name] && value ? convert(byId.get(value), true) : value;
            // The DataPack service transport represents empty fields as strings.
            if (value === null) output[name] = '';
        }
        return output;
    };
    const root = convert(byId.get(f.rootId));
    root[f.childType] = f.records.filter(record => record.Id !== f.rootId).map(record => convert(record));
    return { dataPacks: [{ VlocityDataPackType: f.datapackType, VlocityDataPackKey: `${f.datapackType}/Fixture`,
        VlocityDataPackData: { [f.rootType]: [root] } }] };
}

(async () => {
    for (const runtime of ['standard', 'managed']) for (const type of ['DataRaptor', 'IntegrationProcedure', 'OmniScript']) {
        const input = fixture(runtime, type);
        const v = new Vlocity({ tempFolder: temp, quiet: true });
        v.namespace = 'vlocity_cmt';
        v.namespacePrefix = 'vlocity_cmt__';
        v.datapacksutils.dataPacksExpandedDefinition = v.datapacksutils.updateExpandedDefinitionNamespace(v.datapacksutils.dataPacksExpandedDefinition);
        v.datapacksutils.getAllReferenceFields = async () => [];
        // Fail any accidental network usage by fixture generation.
        v.jsForceConnection.request = () => { throw new Error('Parity fixture generation must remain offline'); };
        const job = { projectPath: temp, maxDepth: 0 };
        await v.datapacksjob.initializeJobInfo(job, 'ExpandFile');
        const folder = path.join(temp, runtime, type);
        await v.datapacksexpand.expand(folder, toolsTransport(input), job);
        if (job.errors.length) throw new Error(job.errors.join('\n'));
        const files = {};
        function read(dir) {
            for (const name of fs.readdirSync(dir)) {
                const file = path.join(dir, name);
                if (fs.statSync(file).isDirectory()) read(file);
                else files[path.relative(folder, file)] = fs.readFileSync(file, 'utf8');
            }
        }
        read(folder);
        fs.writeFileSync(path.join(fixtureDir, `${runtime}-${type}.json`), JSON.stringify({ toolsVersion: version, input, expectedFiles: files }, null, 2)+'\n');
        console.log(runtime, type, Object.keys(files).length);
    }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => fs.rmSync(temp, { recursive: true }));
