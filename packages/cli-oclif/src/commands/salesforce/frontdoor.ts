import { Args } from '@oclif/core';

import { SalesforceCommand } from '../../salesforceCommand';

export default class SalesforceFrontdoor extends SalesforceCommand<typeof SalesforceFrontdoor> {

    static description = 'Get a Salesforce frontdoor URL for an authenticated org';

    static args = {
        path: Args.string({
            description: 'Salesforce relative path to open after login, e.g. lightning/setup/SetupOneHome/home',
            required: false,
        }),
    };

    static examples = [
        '<%= config.bin %> <%= command.id %> -u my-org',
        '<%= config.bin %> <%= command.id %> lightning/setup/SetupOneHome/home -u my-org',
    ];

    async run() {
        const url = await this.salesforce.getPageUrl(this.args.path ?? '', { useFrontdoor: true });
        this.log(url);
    }
}
