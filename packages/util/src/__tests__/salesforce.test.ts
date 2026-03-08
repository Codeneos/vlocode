import 'jest';
import { removeNamespacePrefix } from '../salesforce';

describe('salesforceUtil', () => {
    describe('#removeNamespacePrefix', () => {
        it('when no namespace prefix should return field name as-is', () => {
            expect(removeNamespacePrefix('field__c')).toEqual('field__c');
            expect(removeNamespacePrefix('field')).toEqual('field');
        });
        it('should handle edge cases identically', () => {
            expect(removeNamespacePrefix('__c')).toEqual('__c'); // 0-length namespace
            expect(removeNamespacePrefix('vlocity_cmt__Prefix__c__c')).toEqual('Prefix__c__c');
            expect(removeNamespacePrefix('__vlocity__field__c')).toEqual('__vlocity__field__c');
            expect(removeNamespacePrefix('SomeType__')).toEqual('SomeType__');
            expect(removeNamespacePrefix('Prefix__Type__')).toEqual('Type__');
        });
        it('should handle edge cases identically', () => {
            expect(removeNamespacePrefix('__c')).toEqual('__c'); // 0-length namespace
            expect(removeNamespacePrefix('vlocity_cmt__Prefix__c__c')).toEqual('Prefix__c__c');
            expect(removeNamespacePrefix('__vlocity__field__c')).toEqual('__vlocity__field__c');
            expect(removeNamespacePrefix('SomeType__')).toEqual('SomeType__');
            expect(removeNamespacePrefix('Prefix__Type__')).toEqual('Type__');
        });
        it('should remove namespace prefix', () => {
            expect(removeNamespacePrefix('namespace_prefix__field__c')).toEqual('field__c');
        });
    });
});