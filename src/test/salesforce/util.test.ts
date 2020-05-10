import { expect } from 'chai';
import { spy } from 'sinon';
import 'mocha';

import { removeNamespacePrefix, norm } from 'lib/util/salesforce';

declare var VlocityUtils: any;
describe('salesforceUtil', () => {   
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