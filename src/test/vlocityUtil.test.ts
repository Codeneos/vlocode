import { expect } from 'chai';
import { spy } from 'sinon';
import 'mocha';
import * as vlocityUtil from 'vlocityUtil';
import { Logger } from 'loggers';

declare var VlocityUtils: any;

describe('vlocityUtil', () => {   

    describe('#setVlocityLogger', () => {
        it("should intercept all logging calls", function() {
            var logSpy = spy();
            vlocityUtil.setVlocityLogger(<Logger><any>{
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
        it("should format log messages", function() {
            var logSpy = spy();
            vlocityUtil.setVlocityLogger(<any>{log: logSpy});
            VlocityUtils.log('b', 'a', 'c');    
            // assert
            logSpy.calledOnceWith('b: a c');
        });
    });
});