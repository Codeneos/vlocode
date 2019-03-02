import { expect } from 'chai';
import { spy } from 'sinon';
import 'mocha';

import { createRecordProxy, removeNamespacePrefix } from 'salesforceUtil';

declare var VlocityUtils: any;
describe('salesforceUtil', () => {   

    describe('#createRecordProxy', () => { 
        it("fields should be accessible using case-insensitive properties", function() {
            const testRecord = {
                attributes: { type: null, url: null },
                Id: 'ID',
                Field__c: 'Value'
            };
            const record = createRecordProxy(testRecord);
            expect(record.FIELD__C).equals(testRecord.Field__c);
        });
        it("field should be accessible without namespace prefix", function() { 
            const testRecord = {
                attributes: { type: null, url: null },
                Id: 'ID',
                My_NameSpaced__Field__c: 'Value'
            };
            const record = createRecordProxy(testRecord);
            expect(record.Field__c).equals(testRecord.My_NameSpaced__Field__c);
        });
    });

    describe('#removeNamespacePrefix', () => { 
        it("when no namespace prefix should return field name as-is", function() {
            expect(removeNamespacePrefix('field__c')).equals('field__c');
            expect(removeNamespacePrefix('field')).equals('field');
        });
        it("should remove namespace prefix", function() { 
            expect(removeNamespacePrefix('namespace_prefix__field__c')).equals('field__c');
        });
    });
});