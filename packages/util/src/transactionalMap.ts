/**
 * Map decorator that supports commit and rollback operations, any changes to the underlying map are only persisted when `commit` is called. 
 * Before any changes to the map are commited they can be reverted by calling rollback. 
 * A transaction is automaticlly started once any when calling `delete`, `set` or `clear`. At any given moment in time there can only be a single open transaction.
 * 
 * The transaction is implemented by creating a shallow clone from the target map; this is a less efficient implementation but has benefits when it comes to implementation complexcity
 */
export class TransactionalMap<K, V> implements Map<K, V> {
    private pending: Map<K, V> | undefined;

    constructor(private inner = new Map<K, V>()) {
    }

    public get [Symbol.toStringTag]() {
        return this.getConstant()[Symbol.toStringTag];
    }

    public get size() {
        return this.getConstant().size;
    }

    rollback(): this {
        this.pending = undefined;
        return this;
    }

    commit(): this {
        if (this.pending) {
            this.inner = this.pending;
            this.pending = undefined;
        }
        return this;
    }

    entries(): MapIterator<[K, V]> {
        return this.getConstant().entries();
    }
    

    keys(): MapIterator<K> {
        return this.getConstant().keys();
    }

    values(): MapIterator<V> {
        return this.getConstant().values();
    }

    [Symbol.iterator](): MapIterator<[K, V]> {
        return this.getConstant()[Symbol.iterator]();
    }

    clear() {
        this.getModifiyable().clear();
    }

    delete(key: K) {
        return this.getModifiyable().delete(key);
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {        
        this.getConstant().forEach((v, k) => {
            if (thisArg) {
                callbackfn.apply(thisArg, [v, k, this]);
            } else {
                callbackfn(v, k, this);
            }
        });
    }

    get(key: K): V | undefined {
        return this.getConstant().get(key);
    }

    has(key: K): boolean {
        return this.getConstant().has(key);
    }

    set(key: K, value: V): this {
        this.getModifiyable().set(key, value);
        return this;
    }

    private getModifiyable() {
        return this.pending ?? (this.pending = new Map<K, V>(this.inner));
    }

    private getConstant() {
        return this.pending ?? this.inner;
    }
}