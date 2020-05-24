import { expect } from 'chai';
import { spy } from 'sinon';
import 'mocha';

import * as vlocityLogging from 'lib/vlocity/vlocityLogging';
import { Logger } from 'lib/logging';

declare let VlocityUtils: any;

describe('vlocityLogging', () => {

    describe('#setLogger', () => {
        it('should intercept all logging calls', () => {
            const logSpy = spy();
            vlocityLogging.setLogger(Object.assign(
                new Logger(undefined, 'test'),
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
        it('should format log messages', () => {
            const logSpy = spy();
            vlocityLogging.setLogger({ log: logSpy } as any);
            VlocityUtils.log('b', 'a', 'c');

            // assert
            logSpy.calledOnceWith('b: a c');
        });
    });
});