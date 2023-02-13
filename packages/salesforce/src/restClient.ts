import { HttpRequestPart, HttpResponse, SalesforceConnection } from './connection';

export interface RestClientOptions {
    contentType?: string;
    rawResponse?: boolean;
}

/**
 * REST resource client
 */
export class RestClient {

    constructor(
        public readonly connection: SalesforceConnection,
        public readonly endpoint: string,
        private readonly contentType = 'application/json; charset=utf-8') {
    }

    public post<T>(body: object | string | HttpRequestPart[], resource?: string, options?: RestClientOptions) : Promise<T> {
        return this.connection.request<T>({            
            url: this.formatUrl(resource), 
            method: 'POST',
            parts: Array.isArray(body) ? body : undefined,
            body: Array.isArray(body) ? undefined : this.formatBody(body),
            headers: {
                'content-type': options?.contentType ?? this.contentType
            }
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public get<T>(resource?: string, options?: RestClientOptions) : Promise<T> {
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'GET',
            headers: {
                'content-type': options?.contentType ?? this.contentType
            }
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public patch<T>(body: object | string, resource?: string, options?: RestClientOptions) : Promise<T> {  
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'PATCH', 
            body: this.formatBody(body),
            headers: {
                'content-type': options?.contentType ?? this.contentType
            }
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public put<T>(body: object | string, resource?: string, options?: RestClientOptions) : Promise<T> {  
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'PUT', 
            body: this.formatBody(body),
            headers: {
                'content-type': options?.contentType ?? this.contentType
            }
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public async delete(resource?: string, options?: RestClientOptions) : Promise<number> {  
        const response = await this.connection.request<HttpResponse>({ 
            url: this.formatUrl(resource),
            method: 'DELETE', 
            headers: {
                'content-type': options?.contentType ?? this.contentType
            }
        }, { noContentResponse: true, responseType: 'raw' } );
        return response.statusCode ?? 200;
    }

    private formatUrl(resource?: string): string {
        const resourceBase = this.endpoint.replace(/\/$/ig, '');
        return resource ? `${resourceBase}/${resource}` : resourceBase;
    }

    private formatBody(body: any): string {
        if (typeof body === 'string') {
            return body;
        }
        return JSON.stringify(body);
    }
}