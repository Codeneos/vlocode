import { expect } from 'chai';
import { spy } from 'sinon';
import * as path from 'path';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';
import 'mocha';

import * as vscode from 'vscode';
import vlocityDatapackService, * as vds from '../../services/vlocityDatapackService';
import { fail } from 'assert';
import { Logger } from 'logging';
import { makePath } from 'test/helpers';
import VlocodeConfiguration from 'models/vlocodeConfiguration';

declare var VlocityUtils: any;

describe('vlocityDatapackService', () => {   

    /* This test case is not sufficiently stable for cross platform builds
     * Todo: rewrite logic
    describe('#getDatapackManifestKey',  () => {
        it('should resolve single level datapacks', () => {
            let datapackFile = vscode.Uri.file('/project/vlc/dptype/dpname/mypack_datapack.json');
            let vds = new vlocityDatapackService(null, <VlocodeConfiguration>{ projectPath: '/project/vlc/' }).getDatapackManifestKey(datapackFile);
            // assert
            expect(vds.datapackType).equals('dptype');
            expect(vds.key).equals('dpname');
        });
        it('should resolve multi level datapacks', () => {
            let datapackFile = vscode.Uri.file('/project/vlc/dptype/dpname1/dpname2/mypack_datapack.json');
            let vds = new vlocityDatapackService(null, <VlocodeConfiguration>{ projectPath: '/project/vlc/' }).getDatapackManifestKey(datapackFile);
            // assert
            expect(vds.datapackType).equals('dptype');
            expect(vds.key).equals('dpname1/dpname2');
        });
    });
    */
});