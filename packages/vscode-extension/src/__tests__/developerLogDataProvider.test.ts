import 'jest';

import { DeveloperLogDataProvider } from '../treeViews/dataProviders/developerLogDataProvider';

jest.mock('../lib/config', () => ({
    ...jest.requireActual('../lib/config'),
    ConfigurationManager: {
        onConfigChange: jest.fn(() => ({ dispose: jest.fn() }))
    }
}));

describe('DeveloperLogDataProvider', () => {
    function createLog(index: number) {
        return {
            id: `log-${index}`,
            operation: 'TestOperation',
            size: 1024 * 10,
            startTime: new Date(2024, 0, 1, 0, 0, index)
        };
    }

    function createProvider(developerLogsLimit?: number) {
        const logs = Array.from({ length: 105 }, (_, index) => createLog(index));
        const service = {
            commands: {
                registerAll: jest.fn()
            },
            config: {
                salesforce: {
                    developerLogsLimit
                }
            },
            onUsernameChanged: jest.fn(),
            validateAll: jest.fn(),
            salesforceService: {
                logs: {
                    getDeveloperLogs: jest.fn().mockResolvedValue(logs)
                }
            }
        };

        return {
            logs,
            service,
            provider: new DeveloperLogDataProvider(service as any, { error: jest.fn() } as any)
        };
    }

    it('keeps 100 logs by default', async () => {
        const { provider } = createProvider();

        await expect(provider.getChildren()).resolves.toHaveLength(100);
    });

    it('keeps the configured number of logs', async () => {
        const { provider } = createProvider(3);

        await expect(provider.getChildren()).resolves.toHaveLength(3);
    });
});
