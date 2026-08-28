import {
    DataRaptorItemRecord,
    DataRaptorRecord,
    OmniDataTransformItemRecord,
    OmniDataTransformRecord
} from '@vlocode/vlocity';

import { DataRaptorItemMapping, DataRaptorMapping } from '../convert/omniStudioMappings';

describe('Data Mapper OmniStudio mappings', () => {
    it('maps fields declared by both Data Mapper runtime record types', () => {
        expect(DataRaptorRecord.Fields).toEqual(expect.arrayContaining(mappingFields(DataRaptorMapping.fields)));
        expect(OmniDataTransformRecord.Fields).toEqual(expect.arrayContaining(Object.keys(DataRaptorMapping.fields)));
        expect(DataRaptorItemRecord.Fields).toEqual(expect.arrayContaining(mappingFields(DataRaptorItemMapping.fields)));
        expect(OmniDataTransformItemRecord.Fields).toEqual(expect.arrayContaining(Object.keys(DataRaptorItemMapping.fields)));
    });
});

function mappingFields(fields: Record<string, string | string[]>): string[] {
    return Object.values(fields).flat();
}
