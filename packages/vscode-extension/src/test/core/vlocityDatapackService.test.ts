import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import { spy } from 'sinon';
import * as mockFs from 'mock-fs';
import 'mocha';

import { fail } from 'assert';
import * as vscode from 'vscode';
import { Logger } from '@vlocode/core';
import VlocodeConfiguration from '@lib/vlocodeConfiguration';
import vlocityDatapackService, * as vds from '../../lib/vlocity/vlocityDatapackService';

declare let VlocityUtils: any;

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