import { expect } from 'chai';
import { spy } from 'sinon';
import 'mocha';

import * as vlocityUtil from 'vlocityUtil';
import { Logger } from 'logging';

declare var VlocityUtils: any;

describe('vlocityUtil', () => {   

    describe('#setVlocityLogger', () => {
        it("should intercept all logging calls", () => {
            const logSpy = spy();
            vlocityUtil.setVlocityLogger(Object.assign(
                new Logger(null, null, null), 
                { write: logSpy } )
            );
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
        it("should format log messages", () => {
            const logSpy = spy();
            vlocityUtil.setVlocityLogger(<any>{ log: logSpy });
            VlocityUtils.log('b', 'a', 'c');

            // assert
            logSpy.calledOnceWith('b: a c');
        });
    });
});