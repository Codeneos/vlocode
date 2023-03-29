import { calculateHash, deepClone, removeUndefinedProperties } from '@vlocode/util';
import { readJsonSync, writeJsonSync } from 'fs-extra';
import { HttpRequestInfo, HttpResponse } from '../httpTransport';

export interface SessionLogEntry {
    index: number;
    count: number;
    hash: string;
    request: HttpRequestInfo;
    response: HttpResponse;
}

export class SessionDataStore {
    private readonly filterHeaderKeys = [
        'authorization',
        'cookie',
        'set-cookie',
        'date',
        'user-agent',
        'sforce-limit-info',
        'cache-control',
        'strict-transport-security'
    ];

    private sessionData: Record<string, SessionLogEntry> = {};

    public static loadSession(sessionFile: string): SessionDataStore {
        const store = new SessionDataStore();
        store.addSessionData(readJsonSync(sessionFile, { throws: true }));
        return store;
    }

    public saveSession(sessionFile: string) {
        writeJsonSync(sessionFile, this.sessionData);
    }

    public addSessionData(sessionData: Record<string, SessionLogEntry>) {
        // normalize hashes so that old recordings can be read
        for (const entry of Object.values(sessionData)) {
            this.add(entry.request, entry.response);
        }
        return this;
    }

    public get(info: HttpRequestInfo) {
        const requestInfo = this.normalizeRequest(info);
        const hash = calculateHash(requestInfo);

        if (this.sessionData[hash]) {
            return deepClone(this.sessionData[hash].response);
        }
    }

    public requestHash(info: HttpRequestInfo) {
        return calculateHash(this.normalizeRequest(info));
    }

    public add(info: HttpRequestInfo, response: HttpResponse) {
        const requestInfo = this.normalizeRequest(info);
        const hash = calculateHash(requestInfo);
        const currentEntry = this.sessionData[hash];

        const entry = {
            index: currentEntry?.['index'] ?? Object.entries(this.sessionData).length,
            count: (currentEntry?.['count'] ?? 0) + 1,
            hash: hash,
            request: requestInfo,
            response: {
                statusCode: response.statusCode,
                statusMessage: response.statusMessage,
                headers: this.filterHeaders(response.headers ?? {}),
                body: response.body
            }
        };

        Object.assign(this.sessionData, { [hash]: entry });
        return this;
    }

    private normalizeRequest(info: HttpRequestInfo) : HttpRequestInfo {
        const normalized = removeUndefinedProperties({
            ...info,
            body: info.body ? this.normalizeBody(info.body) : undefined,
            url: this.normalizeUrl(info.url),
            headers: this.filterHeaders(info.headers ?? {})
        });

        if (normalized.body && (normalized.method === 'POST' || normalized.method === 'PATCH')) {
            if (normalized.url === '/services/data/{apiVersion}/composite/sobjects') {
                normalized.body = this.normalizePostBody(normalized.body);
            }
        }

        return normalized;
    }

    private filterHeaders<T extends Record<string, string | string[] | number | undefined>>(headers: T | undefined): T {
        return Object.fromEntries(
            Object.entries<T>(headers ?? {}).filter(([key]) => !this.filterHeaderKeys.includes(key.toLowerCase()))
        ) as any as T;
    }

    private normalizePostBody(body: string): string {
        const composite = JSON.parse(body);
        composite.records = composite.records.map(r => ({ attributes: r.attributes }));
        return JSON.stringify(composite).toLowerCase();
    }

    private normalizeBody(body: string) : string {
        return body.replace(/(v[0-9]{2}\.0)/ig, 'apiVersion');
    }

    private normalizeUrl(url: string) : string {
        if (!url.startsWith('http')) {
            url = `https://vlocode.curlybracket.nl${url.startsWith('/') ? url : `/${url}`}`;
        }
        const parsedUrl = new URL(url.replaceAll('/{apiVersion}/', '/v55.0/'));
        const versionNormalizedPath = parsedUrl.pathname.replace(/\/v[0-9.]+\//ig, '/{apiVersion}/');
        return versionNormalizedPath + parsedUrl.search;
    }
}