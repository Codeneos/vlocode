import { expect } from 'chai';
import { spy } from 'sinon';
import * as path from 'path';
import * as mockFs from 'mock-fs';
import * as fs from 'fs';
import 'mocha';

import * as vscode from 'vscode';
import vlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import { fail } from 'assert';
import { Logger } from 'loggers';
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

    describe('#resolveDatapackHeader',  () => {        
        beforeEach(() => {
            // setup fake FS for testing
            mockFs({
                [makePath(`/datapacks`)]: {
                    'product2': {
                        'outside_file.json': '{}',
                        'test1': {
                            'header_Datapack.json': '{}',
                            'otherfile.html': '',
                            'more.json': ''
                        },
                        'test2': {
                            'no_dataoacks_here.json': '{}'
                        }
                    }
                }
            });
        });
        it('should resolve datapack header for folders/directories', (done) => {
            let datapackFolder = vscode.Uri.file(makePath('/datapacks/product2/test1'));
            new vlocityDatapackService(null, <VlocodeConfiguration>{}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).not.equals(undefined);
                expect(datapackHeader.fsPath).equals(makePath('/datapacks/product2/test1/header_Datapack.json'));
                done();
            }).catch(err => done(err));           
        });
        it('should resolve datapack header for siblings', (done) => {
            let datapackFolder = vscode.Uri.file(makePath('/datapacks/product2/test1/otherfile.html'));
            new vlocityDatapackService(null, <VlocodeConfiguration>{}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).not.equals(undefined);
                expect(datapackHeader.fsPath).equals(makePath('/datapacks/product2/test1/header_Datapack.json'));
                done();
            }).catch(err => done(err));
        });
        it('should resolve to self for datapack header', (done) => {
            let datapackFolder = vscode.Uri.file(makePath('/datapacks/product2/test1/header_Datapack.json'));
            new vlocityDatapackService(null, <VlocodeConfiguration>{}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).not.equals(undefined);
                expect(datapackHeader.fsPath).equals(makePath('/datapacks/product2/test1/header_Datapack.json'));
                done();
            }).catch(err => done(err));          
        });
        it('should return undefined for files outside of a datapack folder', (done) => {
            let datapackFolder = vscode.Uri.file(makePath('/datapacks/product2/test2/no_dataoacks_here.html'));
            new vlocityDatapackService(null, <VlocodeConfiguration>{}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).equals(undefined);
                done();
            }).catch(err => done(err));           
        });
        it('should return undefined for non-existing files', (done) => {
            let datapackFolder = vscode.Uri.file(makePath('/datapacks/product2/test2/no_dataoacks_here.html'));
            new vlocityDatapackService(null, <VlocodeConfiguration>{}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).equals(undefined);
                done();
            }).catch(err => done(err));          
        });
        afterEach(mockFs.restore);
    });

    describe('#setLogger', () => {
        it("should intercept all logging calls", function() {
            var logSpy = spy();
            vds.setLogger(<Logger><any>{
                log: logSpy, 
                info: logSpy, 
                verbose: logSpy,
                warn: logSpy,
                error:logSpy,
                debug:logSpy,
                write: null
            });
            VlocityUtils.verboseLogging = true;
            VlocityUtils.log('b', 'a');
            VlocityUtils.report('b', 'a');
            VlocityUtils.success('b', 'a');
            VlocityUtils.warn('b', 'a');
            VlocityUtils.error('b', 'a');
            VlocityUtils.verbose('b', 'a');
            // assert
            expect(logSpy.callCount).equals(6);
        });
        it("should format log message", function() {
            var logSpy = spy();
            vds.setLogger(<any>{log: logSpy});
            VlocityUtils.log('b', 'a', 'c');    
            // assert
            logSpy.calledOnceWith('b: a c');
        });
    });
});