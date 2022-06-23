import 'jest';

import { cache, clearCache } from '../cache';
import { DeferredPromise } from '../deferred';

class CacheTester {
    variArgsCallCount = 0;
    globalCachedCount = 0;
    unwrapPromiseCount = 0;
    cachedGetterCount = 0;
    deferredPromise: DeferredPromise<any>;

    @cache()
    public get cachedGetter() {
        this.cachedGetterCount++;
        return 'cachedGetter';
    }

    @cache()
    public variArgs(...args: any[]) {
        this.variArgsCallCount++;
        return args;
    }

    @cache( { scope: 'global' } )
    public globalCached(...args: any[]) {
        this.globalCachedCount++;
        return args;
    }

    @cache( { unwrapPromise: true } )
    public async unwrapPromise(...args: any[]) {
        this.unwrapPromiseCount++;
        return this.deferredPromise = new DeferredPromise();
    }

    @cache( { immutable: true } )
    public immutableArrayResponse(...args: any[]) {
        return [1,2,3,4];
    }

    @cache()
    public arrayResponse(...args: any[]) {
        return [1,2,3,4];
    }
}

describe('cache', () => {
    it('should cache distinct identical invocations with primitive arguments', async () => {
        const sut = new CacheTester();
        const v1 = sut.variArgs('test');
        const v2 = sut.variArgs('test');
        const v3 = sut.variArgs('test');

        expect(sut.variArgsCallCount).toEqual(1);
        expect(v1).toEqual(v2);
        expect(v1).toEqual(v3);
    });
    it('should cache across instance when scope is global', async () => {
        const sut1 = new CacheTester();
        const sut2 = new CacheTester();
        const v1 = sut1.globalCached('test');
        const v2 = sut2.globalCached('test');

        expect(sut1.globalCachedCount).toEqual(1);
        expect(sut2.globalCachedCount).toEqual(0);
        expect(v1).toEqual(v2);
    });
    it('should unwrap promise', async () => {
        const sut = new CacheTester();
        setTimeout(() => sut.deferredPromise.resolve('test'), 10);

        const result1Promise = sut.unwrapPromise();
        const result1 = await result1Promise;
        const result2 = sut.unwrapPromise();

        expect(sut.unwrapPromiseCount).toEqual(1);
        expect(typeof result1Promise).toEqual('object');
        expect(result1).toEqual('test');
        expect(typeof result2).toEqual('string');
        expect(result2).toEqual('test');
    });
    it('should not cached rejected promises', async () => {
        const sut = new CacheTester();
        
        setTimeout(() => sut.deferredPromise.reject('r1'));        
        const result1Promise = await sut.unwrapPromise().catch(r => r);

        setTimeout(() => sut.deferredPromise.reject('r2'));
        const result2Promise = await sut.unwrapPromise().catch(r => r);
        
        expect(sut.unwrapPromiseCount).toEqual(2);
        expect(result1Promise).toEqual('r1');
        expect(result2Promise).toEqual('r2');
    });
    it('should cache getters when decorated', async () => {
        const sut = new CacheTester();
        const a = sut.cachedGetter;
        const b = sut.cachedGetter;

        expect(sut.cachedGetterCount).toEqual(1);
        expect(a).toEqual('cachedGetter');
        expect(b).toEqual('cachedGetter');
    });
    it('should return immutable array', async () => {
        const sut = new CacheTester();
        const result = sut.immutableArrayResponse();
    
        expect(() => result.pop()).toThrow();
        expect(() => result.splice(0,1)).toThrow();
        expect(() => result[0] = 10).toThrow();
        expect(() => result.push(10)).toThrow();
        expect(() => result.sort()).toThrow();
    });
    it('should return shallow clone (array)', async () => {
        const sut = new CacheTester();
        const result1 = sut.arrayResponse();
        const result2 = sut.arrayResponse();
        result1.pop();

        expect(result1.length).not.toEqual(result2.length);
    });
});

describe('clearCache', () => {
    it('should should clear previously cached responses', async () => {
        const sut = new CacheTester();
        sut.variArgs('test');
        clearCache(sut);
        sut.variArgs('test');

        expect(sut.variArgsCallCount).toEqual(2);
    });
});