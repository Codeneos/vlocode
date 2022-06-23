import 'jest';
import { removeNamespacePrefix } from '../salesforce';

describe('salesforceUtil', () => {
    describe('#removeNamespacePrefix', () => {
        it('when no namespace prefix should return field name as-is', () => {
            expect(removeNamespacePrefix('field__c')).toEqual('field__c');
            expect(removeNamespacePrefix('field')).toEqual('field');
        });
        it('should remove namespace prefix', () => {
            expect(removeNamespacePrefix('namespace_prefix__field__c')).toEqual('field__c');
        });
    });
});