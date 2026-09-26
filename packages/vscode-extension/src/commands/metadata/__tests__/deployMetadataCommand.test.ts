import DeployMetadataCommand from '../deployMetadataCommand';

class TestDeployMetadataCommand extends DeployMetadataCommand {

    public execute() {
        return undefined;
    }

    constructor(
        private readonly productionOrg: boolean,
        productionDeployTestLevel?: string
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

    it('uses the configured production deployment test level', async () => {
        await expect(new TestDeployMetadataCommand(true, 'RunLocalTests').getOptions()).resolves.toEqual({
            ignoreWarnings: true,
            testLevel: 'RunLocalTests'
        });
    });

    it('does not set a test level for non-production deployments', async () => {
        await expect(new TestDeployMetadataCommand(false, 'RunLocalTests').getOptions()).resolves.toEqual({
            ignoreWarnings: true
        });
    });
});
