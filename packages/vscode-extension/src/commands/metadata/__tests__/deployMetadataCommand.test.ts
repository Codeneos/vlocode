import DeployMetadataCommand from '../deployMetadataCommand';
import type { VlocodeSalesforceConfiguration } from '../../../lib/vlocodeConfiguration';

class TestDeployMetadataCommand extends DeployMetadataCommand {

    constructor(
        private readonly productionOrg: boolean,
        productionDeployTestLevel?: VlocodeSalesforceConfiguration['productionDeployTestLevel']
    ) {
        super();
        Object.defineProperty(this, 'vlocode', {
            value: {
                config: {
                    salesforce: {
                        productionDeployTestLevel
                    }
                }
            }
        });
    }

    protected get salesforce() {
        return {
            isProductionOrg: async () => this.productionOrg
        } as any;
    }

    public getOptions() {
        return this.getDeploymentStartOptions();
    }
}

describe('DeployMetadataCommand', () => {
    it('defaults production deployments to RunRelevantTests', async () => {
        await expect(new TestDeployMetadataCommand(true).getOptions()).resolves.toEqual({
            ignoreWarnings: true,
            testLevel: 'RunRelevantTests'
        });
    });

    it.each<VlocodeSalesforceConfiguration['productionDeployTestLevel']>([
        'RunRelevantTests', 'RunLocalTests', 'RunAllTestsInOrg'
    ])('uses the configured production deployment test level %s', async testLevel => {
        await expect(new TestDeployMetadataCommand(true, testLevel).getOptions()).resolves.toEqual({
            ignoreWarnings: true,
            testLevel
        });
    });

    it.each<VlocodeSalesforceConfiguration['productionDeployTestLevel'] | undefined>([
        undefined, 'RunRelevantTests', 'RunLocalTests', 'RunAllTestsInOrg'
    ])('does not set a test level for non-production deployments (configured: %s)', async testLevel => {
        await expect(new TestDeployMetadataCommand(false, testLevel).getOptions()).resolves.toEqual({
            ignoreWarnings: true
        });
    });
});
