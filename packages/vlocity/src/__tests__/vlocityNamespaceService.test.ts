import 'jest';

import { Logger, container } from '@vlocode/core';
import { VlocityNamespaceService } from '../vlocityNamespaceService';

describe('VlocityNamespaceService', () => {

    function createConnectionProvider(connection: any) {
        return {
            getJsForceConnection: jest.fn().mockResolvedValue(connection)
        } as any;
    }

    function createConnection(options: {
        installedPackages?: any[];
        apexClasses?: any[];
    } = {}) {
        return {
            instanceUrl: 'https://example.my.salesforce.com',
            tooling: {
                query: jest.fn().mockResolvedValue({
                    records: options.installedPackages ?? []
                })
            },
            query: jest.fn().mockResolvedValue({
                records: options.apexClasses ?? []
            }),
            query2: jest.fn((soql: string) => {
                if (soql.includes('InstalledSubscriberPackage')) {
                    return Promise.resolve(options.installedPackages ?? []);
                }
                if (soql.includes('ApexClass')) {
                    return Promise.resolve(options.apexClasses ?? []);
                }
                return Promise.resolve([]);
            })
        };
    }

    function createService() {
        const testContainer = container.create();
        testContainer.add(Logger.null);
        return testContainer.new(VlocityNamespaceService);
    }

    it('detects the managed package namespace from installed packages', async () => {
        const connection = createConnection({
            installedPackages: [{
                SubscriberPackage: {
                    Name: 'Vlocity CMT',
                    NamespacePrefix: 'vlocity_cmt'
                }
            }]
        });
        const service = createService();

        await service.initialize(createConnectionProvider(connection));

        expect(service.getNamespace()).toBe('vlocity_cmt');
        expect(connection.query2).toHaveBeenCalledWith(
            'SELECT SubscriberPackage.NamespacePrefix, SubscriberPackage.Name FROM InstalledSubscriberPackage',
            { type: 'tooling', queryMore: false }
        );
        expect(connection.query).not.toHaveBeenCalled();
        expect(connection.tooling.query).not.toHaveBeenCalled();
    });

    it('falls back to the Vlocity ApexClass namespace when installed packages are not visible', async () => {
        const connection = createConnection({
            installedPackages: [],
            apexClasses: [{
                NamespacePrefix: 'vlocity_cmt'
            }]
        });
        const service = createService();

        await service.initialize(createConnectionProvider(connection));

        expect(service.getNamespace()).toBe('vlocity_cmt');
        expect(connection.query2).toHaveBeenCalledWith(
            "SELECT NamespacePrefix FROM ApexClass WHERE Name = 'DRDataPackService' LIMIT 1",
            { queryMore: false }
        );
        expect(connection.query).not.toHaveBeenCalled();
        expect(connection.tooling.query).not.toHaveBeenCalled();
    });
});
