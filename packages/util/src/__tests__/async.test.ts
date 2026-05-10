import { EventEmitter } from 'events';
import 'jest';
import * as async from '../async';

describe('async', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    describe('#awaitOnce', () => {
        it('should resolve after event is emitted', async () => {
            const emitter = new EventEmitter(); 
            setTimeout(() => emitter.emit('test', 'resolved'), 500);
            const resultPromise = async.resumeOnce('test', emitter);
            await jest.runAllTimersAsync();
            const result = await resultPromise;
            expect(result).toEqual('resolved');
        });
        it('should resolve after event is emitted with array', async () => {
            const emitter = new EventEmitter(); 
            setTimeout(() => emitter.emit('test', 'resolved', 0, 1), 500);
            const resultPromise = async.resumeOnce<[string, number, number]>('test', emitter);
            await jest.runAllTimersAsync();
            const result = await resultPromise;
            expect(result[0]).toEqual('resolved');    
            expect(result[1]).toEqual(0);    
            expect(result[2]).toEqual(1);
        });
        it('should reject if event is not emitted within timeout', async () => {
            const emitter = new EventEmitter(); 
            setTimeout(() => emitter.emit('test'), 500);
            const rejectPromise = async.resumeOnce('test', emitter, 250);
            jest.advanceTimersByTime(250);
            await expect(rejectPromise).rejects.toThrowError();
        });
    });
});