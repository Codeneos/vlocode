
import { VlocodeCommand } from '../constants';
import RefreshDatapackCommand from './refreshDatapackCommand';
import DeployDatapackCommand from './deployDatapackCommand';
import ExportDatapackCommand from './exportDatapackCommand';
import SelectOrgCommand from './selectOrgCommand';
import AdminCommands from './vlocityAdminCommand';
import BuildParentKeyFilesCommand from './buildParentKeyFiles';
import OpenSalesforceCommand from './openSalesforceCommand';
import RenameDatapackCommand from './renameDatapackCommand';
import CloneDatapackCommand from './cloneDatapackCommand';
import SalesforceCommand from './salesforce';

export default {
    [VlocodeCommand.refreshDatapack]: RefreshDatapackCommand,
    [VlocodeCommand.deployDatapack]: DeployDatapackCommand,
    [VlocodeCommand.exportDatapack]: ExportDatapackCommand,
    [VlocodeCommand.selectOrg]: SelectOrgCommand,
    [VlocodeCommand.buildParentKeyFiles]: BuildParentKeyFilesCommand,
    [VlocodeCommand.openInSalesforce]: OpenSalesforceCommand,
    [VlocodeCommand.renameDatapack]: RenameDatapackCommand,
    [VlocodeCommand.cloneDatapack]: CloneDatapackCommand,
    ...SalesforceCommand,
    ...AdminCommands
};
