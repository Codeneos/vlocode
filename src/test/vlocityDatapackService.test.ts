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

declare var VlocityUtils: any;

describe('vlocityDatapackService', () => {   

    describe('#resolveProjectPathFor (private)', () => { 
        it("should always return absolute path", function() { 
            let vds = [
                new vlocityDatapackService(null, { projectPath: '.\\project\\vlc\\' }),
                new vlocityDatapackService(null, { projectPath: '.\\' }),
                new vlocityDatapackService(null, { projectPath: '.\\project\\folder\\..' }),
                new vlocityDatapackService(null, { projectPath: '.\\project' })
            ];
            let uriForResolve = vscode.Uri.file('./myfile');
            // assert
            vds.forEach(v => expect(path.isAbsolute((<any>v).resolveProjectPathFor(uriForResolve))).equals(true));
        });
        it("should return project path as-is when absolute", function() { 
            let vds = new vlocityDatapackService(null, { projectPath: 'x:\\project\\vlc\\' });
            let uriForResolve = vscode.Uri.file('./myfile');
            // assert
            expect((<any>vds).resolveProjectPathFor(uriForResolve)).equals('x:\\project\\vlc\\');
        });
    });

    describe('#getDatapackManifestKey',  () => {
        it('should resolve single level datapacks', () => {
            let datapackFile = vscode.Uri.file('c:\\project\\vlc\\dptype\\dpname\\mypack_datapack.json');
            let vds = new vlocityDatapackService(null, { projectPath: 'c:\\project\\vlc\\' }).getDatapackManifestKey(datapackFile);
            // assert
            expect(vds.datapackType).equals('dptype');
            expect(vds.key).equals('dpname');
        });
        it('should resolve multi level datapacks', () => {
            let datapackFile = vscode.Uri.file('c:\\project\\vlc\\dptype\\dpname1\\dpname2\\mypack_datapack.json');
            let vds = new vlocityDatapackService(null, { projectPath: 'c:\\project\\vlc\\' }).getDatapackManifestKey(datapackFile);
            // assert
            expect(vds.datapackType).equals('dptype');
            expect(vds.key).equals('dpname1/dpname2');
        });
    });

    describe('#resolveDatapackHeader',  () => {        
        beforeEach(() => {
            // setup fake FS for testing
            mockFs({
                'c:/datapacks': {
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
            let datapackFolder = vscode.Uri.file('c:/datapacks/product2/test1');
            new vlocityDatapackService(null, {}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).not.equals(undefined);
                expect(datapackHeader.path).equals('/c:/datapacks/product2/test1/header_Datapack.json');
                done();
            }).catch(err => done(err));           
        });
        it('should resolve datapack header for siblings', (done) => {
            let datapackFolder = vscode.Uri.file('c:/datapacks/product2/test1/otherfile.html');
            new vlocityDatapackService(null, {}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).not.equals(undefined);
                expect(datapackHeader.path).equals('/c:/datapacks/product2/test1/header_Datapack.json');
                done();
            }).catch(err => done(err));
        });
        it('should resolve datapack header when datapack header is passed', (done) => {
            let datapackFolder = vscode.Uri.file('c:/datapacks/product2/test1/header_Datapack.json');
            new vlocityDatapackService(null, {}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).not.equals(undefined);
                expect(datapackHeader.path).equals('/c:/datapacks/product2/test1/header_Datapack.json');
                done();
            }).catch(err => done(err));          
        });
        it('should return undefined for files outside of a datapack folder', (done) => {
            let datapackFolder = vscode.Uri.file('c:/datapacks/product2/test2/no_dataoacks_here.html');
            new vlocityDatapackService(null, {}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
                // assert
                expect(datapackHeader).equals(undefined);
                done();
            }).catch(err => done(err));           
        });
        it('should return undefined for non-existoing files', (done) => {
            let datapackFolder = vscode.Uri.file('c:/datapacks/product2/test2/no_dataoacks_here.html');
            new vlocityDatapackService(null, {}).resolveDatapackHeader(datapackFolder).then(datapackHeader => {
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
            vds.setLogger(<Logger>{
                log: logSpy, 
                info: logSpy, 
                verbose: logSpy,
                warn: logSpy,
                error:logSpy
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