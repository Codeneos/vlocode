import 'jest';
import { DeferredPromise } from '../deferred';

describe('DeferredPromise', () => {
    it('should resolve the promise', async () => {
        const deferred = new DeferredPromise<number>();
        setTimeout(() => deferred.resolve(42), 10);
        const result = await deferred;
        expect(result).toBe(42);
    });

    it('should reject the promise', async () => {
        const deferred = new DeferredPromise<number>();
        setTimeout(() => deferred.reject(new Error('Something went wrong')));

        try {
            await deferred;
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Something went wrong');
        }
    });

    it('should bind to another promise', async () => {
        const deferred1 = new DeferredPromise<number>();
        const deferred2 = new DeferredPromise<number>();

        deferred1.bind(deferred2);
        deferred2.resolve(42);
        const result = await deferred1;

        expect(result).toBe(42);
    });

    it('should reset the promise', async () => {
        const deferred = new DeferredPromise<number>();
        deferred.resolve(42);
        deferred.reset();
        expect(deferred.isResolved).toBe(false);
    });

    it('should handle then and catch methods', async () => {
        const deferred = new DeferredPromise<number>();
        deferred.resolve(42);

        const result = await deferred.then(value => value * 2).catch(error => -1);
        expect(result).toBe(84);
    });

    it('should handle finally method', async () => {
        const deferred = new DeferredPromise<number>();
        deferred.resolve(42);

        let finallyCalled = false;
        const result = await deferred.finally(() => {
            finallyCalled = true;
        });

        expect(result).toBe(42);
        expect(finallyCalled).toBe(true);
    });
});