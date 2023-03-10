import { substringAfterLast, substringBefore } from "@vlocode/util";
import { EventEmitter } from "events";
import { RestClient } from "../restClient";
import { QueryRelationshipInfo, QueryResponse } from "./types";

enum AsyncQueryIteratorState {
    idle,
    fetching,
    done
}

/**
 * Async query result iterator that iterates over the query results using the REST API
 * for either tooling (`/services/tooling`) or sobject records (`/services/data`)
 * 
 * The AsyncQueryIterator emits the following events:
 *  - `error` thrown when an error occurs during
 *  - `done` emitted when the fetching of records completes
 *  - `records` emitted when a new batch of records is fetched with the array of fetched records
 */
export class AsyncQueryIterator<T extends object = Record<string, unknown>> extends EventEmitter implements AsyncIterableIterator<T>, Promise<T[]> {

    public [Symbol.toStringTag] = 'AsyncQueryIterator';

    private recordsPromise?: Promise<T[]>;
    private resultsPromise?: Promise<QueryResponse<T>>;

    private state: AsyncQueryIteratorState = AsyncQueryIteratorState.idle;
    private iteratorOffset = 0;
    private records = new Array<T>();
    private errors = new Array<any>();
    private iteratorActive = true;
    private nextResourceUrl: string | undefined;

    /**
     * True when all records are fetched or when an error occurred during fetching
     */
    public get isDone() {
        return this.state === AsyncQueryIteratorState.done;
    }

    /**
     * The total number of records fetched by the query
     */
    public get totalCount() {
        return this.records.length;
    }

    constructor(
        private readonly client: RestClient,
        resourceUrl: string,
        private queryMore = true) {
        super();
        this.nextResourceUrl = resourceUrl;
    }
    
    public execute(): this {
        void this.fetch();
        return this;
    }

    /**
     * Fetches records from the server by accessing the query resource and iterating over the `nextRecordsUrl` urls from the response
     * until there are no more records to fetch.
     * @returns All records fetched
     */
    private async fetch() {
        console.assert(this.state === AsyncQueryIteratorState.idle, 'Iterator is already fetching records'); 
        try {
            this.state = AsyncQueryIteratorState.fetching;
            while (this.nextResourceUrl && this.iteratorActive) {
                const responses = await this.client.get<QueryResponse<T>>(this.nextResourceUrl);
                this.nextResourceUrl = this.getQueryLocator(responses.nextRecordsUrl);
                await this.processRecords(responses.records);

                if (!this.nextResourceUrl || !this.iteratorActive || !this.queryMore) {
                    // Change state before calling emit to not crash the 
                    // the async iterator when have 0 results
                    this.state = AsyncQueryIteratorState.done;
                }

                this.records.push(...responses.records);
                this.emit('records', responses.records);

                if (!this.queryMore) {
                    // Query more is disabled, stop fetching records but do fetch the first record set
                    break;
                }
            }
            this.state = AsyncQueryIteratorState.done;
            this.emit('done', this.records);
        } catch (err) {
            this.state = AsyncQueryIteratorState.done;
            this.errors.push(err);
            this.emit('error', err);
        } finally {            
            this.removeAllListeners();
            delete this.resultsPromise;
        }
    }

    private async processRecords(records: any[]) {
        await Promise.all(records.map(record => this.processRelationships(record))); 
    }

    private async processRelationships(record: any) {
        for (const key of Object.keys(record)) {
            const value = record[key];
            if (this.isRelationship(value)) {
                // When the relationship is not yet fetched we need to fetch it
                const records = value.records ?? [];
                let nextRecordsUrl = this.getQueryLocator(value.queryLocator ?? value.nextRecordsUrl);
                while (nextRecordsUrl && this.queryMore) {
                    const responses = await this.client.get<QueryResponse<T>>(nextRecordsUrl);
                    nextRecordsUrl = this.getQueryLocator(responses.queryLocator ?? value.nextRecordsUrl);
                    records.push(...responses.records);
                }

                // Process fetched records
                await this.processRecords(records);

                // replace relationship with the fetched records
                record[key] = records;
            }

            if(key === 'attributes' && typeof value['url'] === 'string' && !record['Id']) {
                // Extract the ID from the URL
                record['Id'] = substringBefore(substringAfterLast(value['url'], '/'), '.');
            }
        }
    }

    private getQueryLocator(value: string | undefined | null) {
        if (value) {
            const endpointParts = this.client.endpoint.split('/').filter(p => !!p);
            const urlParts = value.split('/').filter(p => !!p);
            return urlParts.slice(endpointParts.length).join('/');
        }
    }

    private isRelationship(object: unknown): object is QueryRelationshipInfo {
        return typeof object === 'object' && object !== null && typeof object['done'] === 'boolean' && Array.isArray(object['records']);
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        this.iteratorOffset = 0;
        if (this.nextResourceUrl) {
            this.state = AsyncQueryIteratorState.idle;
        }
        return this;
    }

    public then<TResult1 = T[], TResult2 = never>(onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined): Promise<TResult1 | TResult2> {
        return this.promise().then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined): Promise<T[] | TResult> {
        return this.promise().catch(onrejected);
    }

    public finally(onfinally?: (() => void) | undefined): Promise<T[]> {
        return this.promise().finally(onfinally);
    }

    protected promise() {
        if (this.errors.length) {
            return Promise.reject(this.errors[0]);
        }
        if (this.state === AsyncQueryIteratorState.done) {
            return Promise.resolve(this.records);
        }
        if (this.state !== AsyncQueryIteratorState.fetching) {
            void this.fetch();
        }
        if (!this.recordsPromise) {
            // return this.oncePromise('records', () => this.next());
            this.recordsPromise = this.oncePromise('done', () => this.records);
        }
        return this.recordsPromise;
    }

    public async next(): Promise<IteratorResult<T, undefined>> {
        if (this.errors.length) {
            throw this.errors[0];
        }

        if (this.iteratorOffset < this.records.length) {
            // Yield record as long as there are records left to Yield
            return {
                value: this.records[this.iteratorOffset++],
                done: false
            };
        }

        if (this.state === AsyncQueryIteratorState.done) {
            return {
                value: undefined,
                done: true
            };
        }

        if (this.state !== AsyncQueryIteratorState.fetching) {
            void this.fetch();
        }

        return this.oncePromise('records', () => this.next());
    }

    private oncePromise<TResult>(event: string, handler: (...args: any[]) => TResult): Promise<TResult> {
        return new Promise((resolve, reject) => {
            const resolveHandler = (...args) => {
                this.removeListener('error', rejectHandler);
                resolve(handler(...args));
            };
            const rejectHandler = (error) => {
                this.removeListener(event, resolveHandler);
                reject(error);
            };
            this.once('error', rejectHandler);
            this.once(event, resolveHandler);
        });
    }

    public return(): Promise<IteratorResult<T, undefined>> {
        this.iteratorActive = false;
        this.iteratorOffset = Number.MAX_SAFE_INTEGER;
        return Promise.resolve({
            value: undefined,
            done: true
        });
    }

    public throw(): Promise<IteratorResult<T, undefined>> {
        this.iteratorActive = false;
        this.iteratorOffset = Number.MAX_SAFE_INTEGER;
        return Promise.resolve({
            value: undefined,
            done: true
        });
    }
}

/**
 * JSForce compatibility adapter changing the AsyncQueryIterator to be backward compatible with JSForce's Query result.
 */
export class JsForceAsyncQueryIterator<T extends object = Record<string, unknown>> extends AsyncQueryIterator<T> implements Promise<QueryResponse<T>> {

    /**
     * Track if compatibility handlers have been registered; otherwise don't emit compatibility events
     */
    private handlersRegistered = false;

    public run() { return this.execute(); }
    public exec() { return this.execute(); }

    public on(name: string, handler: (...args: any[]) => any) {
        return this.registerHandler('on', name, handler);
    }

    public once(name: string, handler: (...args: any[]) => any) {
        return this.registerHandler('once', name, handler);
    }

    public prependListener(name: string, handler: (...args: any[]) => any) {
        return this.registerHandler('prependListener', name, handler);
    }

    public prependOnceListener(name: string, handler: (...args: any[]) => any) {
        return this.registerHandler('prependOnceListener', name, handler);
    }

    public addListener(name: string, handler: (...args: any[]) => any) {
        return this.registerHandler('addListener', name, handler);
    }

    private registerHandler(
        type: 'on' | 'once' | 'prependListener' | 'prependOnceListener' | 'appendOnceListener' | 'addListener', 
        name: string, 
        handler: (...args: any[]) => any) 
    {        
        if (this.handlersRegistered && (name === 'end' || name === 'record')) {
            this.on('done', () => this.emit('end'));
            this.on('records', records => records.forEach(r => this.emit('record', r)));
            this.handlersRegistered = true;
        }        
        return super[type](name, handler);
    }

    public then<TResult1 = any, TResult2 = never>(
        onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null | undefined, 
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
        return this.promise().then(onfulfilled, onrejected);
    }

    public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<any | TResult> {
        return this.promise().catch(onrejected);
    }

    public finally(onfinally?: (() => void) | null | undefined): Promise<any> {
        return this.promise().finally(onfinally);
    }

    protected promise(): Promise<any> {
        return super.promise().then(
            (records) => ({
                totalSize: records.length,
                done: true,
                records
            })
        );
    }
}