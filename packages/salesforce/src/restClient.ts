import { HttpRequestPart, SalesforceConnection } from './connection';

/**
 * REST resource client
 */
export class RestClient {

    private contentType = 'application/json; charset=utf-8';

    constructor(
        public readonly connection: SalesforceConnection,
        public readonly endpoint: string) {
    }

    public post<T>(resource: string, body: object | HttpRequestPart[]) : Promise<T> {
        return this.connection.request<T>({            
            url: this.formatUrl(resource), 
            method: 'POST',
            parts: Array.isArray(body) ? body : undefined,
            body: Array.isArray(body) ? undefined : this.formatBody(body),
            headers: {
                'content-type': this.contentType
            }
        });
    }

    public get<T>(resource: string) : Promise<T> {
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'GET',
            headers: {
                'content-type': this.contentType
            }
        });
    }

    public patch<T>(resource: string, body: object) : Promise<T> {  
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'PATCH', 
            body: this.formatBody(body),
            headers: {
                'content-type': this.contentType
            }
        });
    }

    private formatUrl(resource: string): string {
        return `${this.endpoint.replace(/\/$/ig, '')}/${resource}`;
    }

    private formatBody(body: any): string {
        if (typeof body === 'string') {
            return body;
        }
        return JSON.stringify(body);
    }
}