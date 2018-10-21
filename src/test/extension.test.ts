//
// Vlocode unit tests
//

import * as assert from 'assert';
import * as sinon from 'sinon';
import { mockModule } from './helpers';

import * as vscode from 'vscode';
import * as s from '../singleton';
import * as l from '../loggers';
import constants from '../constants';
import VlocodeConfiguration from '../models/VlocodeConfiguration';
import VlocityDatapackService, * as vds from '../services/vlocityDatapackService';
import { ConsoleLogger } from '../loggers';
declare var VlocityUtils: any;

suite("Core Framework Tests", function () {
    test("singleton.getInstance: should only create 1 instance of a class", function() {
        let objectSingleton1 : any = s.getInstance(Object);
        let objectSingleton2 : any = s.getInstance(Object);
        
        objectSingleton1['value'] = 1;
        assert.equal(objectSingleton1['value'], objectSingleton2['value']);
    });
});

suite("Vlocity Datapack Service Wrapper Tests", function () {
    test("setLogger: should intercept all logging calls", function() {
        // setup
        var spy = sinon.spy();
        vds.setLogger(<any>{log: spy});

        // act
        VlocityUtils.verboseLogging = true;
        VlocityUtils.log('b', 'a');
        VlocityUtils.report('b', 'a');
        VlocityUtils.success('b', 'a');
        VlocityUtils.warn('b', 'a');
        VlocityUtils.error('b', 'a');
        VlocityUtils.verbose('b', 'a');
        try { VlocityUtils.fatal('b', 'a'); } catch(e){ }

        // assert
        assert.equal(spy.callCount, 7);
    });
    test("setLogger: should format log message", function() {
        // setup
        var spy =  sinon.spy();
        vds.setLogger(<any>{log: spy});

        // act
        VlocityUtils.log('b', 'a', 'c');

        // assert
        spy.calledOnceWith('b: a c');
    });
});