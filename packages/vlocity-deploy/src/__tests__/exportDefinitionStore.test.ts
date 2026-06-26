import 'jest';

import { DatapackExportDefinitionStore } from '../export/exportDefinitionStore';

describe('DatapackExportDefinitionStore', () => {

    describe('#isFieldIgnored', () => {

        function createStore() {
            const store = new DatapackExportDefinitionStore();
            store.load({
                Product2: {
                    objectType: 'Product2',
                    matchingKeyFields: [ 'GlobalKey__c' ],
                    ignoreFields: [
                        '%vlocity_namespace%__DRBundleName__c',
                        'IsActive__c',
                        'ContentModifiedById'
                    ]
                }
            });
            return store;
        }

        it('should match a namespace-resolved field against a placeholder ignore entry', () => {
            const store = createStore();
            expect(store.isFieldIgnored({ objectType: 'Product2' }, 'vlocity_cmt__DRBundleName__c')).toBe(true);
        });

        it('should match regardless of namespace casing differences', () => {
            const store = createStore();
            expect(store.isFieldIgnored({ objectType: 'Product2' }, 'vlocity_cmt__drbundlename__c')).toBe(true);
        });

        it('should match a namespaced field against a non-prefixed ignore entry', () => {
            const store = createStore();
            expect(store.isFieldIgnored({ objectType: 'Product2' }, 'vlocity_cmt__IsActive__c')).toBe(true);
        });

        it('should match standard fields without a namespace', () => {
            const store = createStore();
            expect(store.isFieldIgnored({ objectType: 'Product2' }, 'ContentModifiedById')).toBe(true);
        });

        it('should not match fields that are not in the ignore list', () => {
            const store = createStore();
            expect(store.isFieldIgnored({ objectType: 'Product2' }, 'vlocity_cmt__GlobalKey__c')).toBe(false);
        });

        it('should return false when no ignoreFields are configured', () => {
            const store = new DatapackExportDefinitionStore();
            store.load({ Product2: { objectType: 'Product2', matchingKeyFields: [] } });
            expect(store.isFieldIgnored({ objectType: 'Product2' }, 'vlocity_cmt__DRBundleName__c')).toBe(false);
        });

        it('should resolve ignoreFields by datapackType when it differs from the objectType', () => {
            const store = new DatapackExportDefinitionStore();
            store.load({
                PriceRule: {
                    objectType: 'SBQQ__PriceRule__c',
                    matchingKeyFields: [ 'Name' ],
                    ignoreFields: [ 'CurrencyIsoCode' ]
                }
            });
            // Definitions are keyed by datapackType (the YAML key), so the caller must supply it;
            // looking up by objectType alone misses the config.
            expect(store.isFieldIgnored({ datapackType: 'PriceRule', objectType: 'SBQQ__PriceRule__c' }, 'CurrencyIsoCode')).toBe(true);
            expect(store.isFieldIgnored({ objectType: 'SBQQ__PriceRule__c' }, 'CurrencyIsoCode')).toBe(false);
        });

        it('should resolve a definition keyed by SObject type even when a different datapackType is supplied', () => {
            const store = new DatapackExportDefinitionStore();
            // A single SObject can back multiple datapack types; a definition keyed by the SObject type
            // must apply regardless of which datapack type the record is exported under.
            store.load({
                SBQQ__ProductFeature__c: {
                    objectType: 'SBQQ__ProductFeature__c',
                    matchingKeyFields: [ 'Name' ],
                    ignoreFields: [ 'CurrencyIsoCode' ]
                }
            });
            expect(store.isFieldIgnored({ datapackType: 'Product2', objectType: 'SBQQ__ProductFeature__c' }, 'CurrencyIsoCode')).toBe(true);
        });

        it('should apply a global SObject default to every record', () => {
            const store = new DatapackExportDefinitionStore();
            store.load({
                SObject: { objectType: 'SObject', ignoreFields: [ 'CurrencyIsoCode' ] },
                PriceRule: { objectType: 'SBQQ__PriceRule__c', matchingKeyFields: [ 'Name' ] }
            });
            // Matches both a configured datapack and an arbitrary embedded objectType with no own definition.
            expect(store.isFieldIgnored({ datapackType: 'PriceRule', objectType: 'SBQQ__PriceRule__c' }, 'CurrencyIsoCode')).toBe(true);
            expect(store.isFieldIgnored({ datapackType: 'SBQQ__PriceAction__c', objectType: 'SBQQ__PriceAction__c' }, 'CurrencyIsoCode')).toBe(true);
        });

        it('should prefer the datapackType definition over the SObject default', () => {
            const store = new DatapackExportDefinitionStore();
            store.load({
                SObject: { objectType: 'SObject', ignoreFields: [ 'CurrencyIsoCode' ] },
                PriceRule: { objectType: 'SBQQ__PriceRule__c', matchingKeyFields: [ 'Name' ], ignoreFields: [ 'Other__c' ] }
            });
            // The more specific datapackType definition wins, so the SObject default is not merged in.
            expect(store.isFieldIgnored({ datapackType: 'PriceRule', objectType: 'SBQQ__PriceRule__c' }, 'Other__c')).toBe(true);
            expect(store.isFieldIgnored({ datapackType: 'PriceRule', objectType: 'SBQQ__PriceRule__c' }, 'CurrencyIsoCode')).toBe(false);
        });
    });
});
