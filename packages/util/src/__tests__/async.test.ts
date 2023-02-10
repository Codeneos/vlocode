import EventEmitter = require('events');
import 'jest';
import * as async from '../async';

describe('async', () => {
    describe('#awaitOnce', () => {
        it('should resolve after event is emitted', async () => {
            const emitter = new EventEmitter(); 
            setTimeout(() => emitter.emit('test', 'resolved'), 500);
            const result = await async.resumeOnce('test', emitter);           
            expect(result).toEqual('resolved');
        });
        it('should resolve after event is emitted with array', async () => {
            const emitter = new EventEmitter(); 
            setTimeout(() => emitter.emit('test', 'resolved', 0, 1), 500);
            const result = await async.resumeOnce<[string, number, number]>('test', emitter);           
            expect(result[0]).toEqual('resolved');    
            expect(result[1]).toEqual(0);    
            expect(result[2]).toEqual(1);
        });
        it('should reject if event is not emitted within timeout', async () => {
            const emitter = new EventEmitter(); 
            setTimeout(() => emitter.emit('test'), 500);
            await expect(async.resumeOnce('test', emitter, 250)).rejects.toThrowError();
        });
    });
});