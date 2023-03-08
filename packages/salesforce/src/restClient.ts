import { OutgoingHttpHeaders } from 'http';
import { HttpRequestInfo, HttpRequestPart, HttpResponse, RequestOptions } from './connection';

export interface RestClientOptions {
    contentType?: string;
    rawResponse?: boolean;
}

/**
 * Connection request method abstraction; needs unification with transport
 */
interface ServerConnection {
    request(request: HttpRequestInfo, options: RequestOptions & { responseType: 'raw' }): Promise<HttpResponse>;
    request<T = any>(request: HttpRequestInfo, options?: RequestOptions): Promise<T>;
}

/**
 * REST resource client
 */
export class RestClient {

    /**
     * Extra headers included in each request
     */
    private extraHeaders: Record<string, string | number>;

    constructor(
        public readonly connection: ServerConnection,
        public readonly endpoint: string,
        private readonly contentType = 'application/json; charset=utf-8') {
    }

    /**
     * Get the current value of a request header by the specified name.
     * @param name header name
     */
    public extraHeader(name: string): string | number | undefined;

    /**
     * Add or override a request header that will be used for each re
     * @param name header name
     */
    public extraHeader(name: string, value: string | number): this;

    public extraHeader(name: string, value?: string | number | undefined): any {
        if (value === undefined) {
            return this.extraHeaders?.[name];
        }
        if (!this.extraHeaders) {
            this.extraHeaders = {};
        }
        this.extraHeaders[name] = value;
        return this;
    }

    public post(body: object | string | HttpRequestPart[], resource: string | undefined, options: RestClientOptions & { rawResponse: true }): Promise<HttpResponse>;
    public post<T>(body: object | string | HttpRequestPart[], resource?: string, options?: RestClientOptions & { rawResponse?: false | undefined }) : Promise<T>;
    public post<T>(body: object | string | HttpRequestPart[], resource?: string, options?: RestClientOptions) : Promise<T> {
        return this.connection.request<T>({            
            url: this.formatUrl(resource), 
            method: 'POST',
            parts: Array.isArray(body) ? body : undefined,
            body: Array.isArray(body) ? undefined : this.formatBody(body),
            headers: this.getRequestHeaders(options)
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public get<T extends HttpResponse>(resource: string | undefined, options: RestClientOptions & { rawResponse: true }): Promise<T>;
    public get<T>(resource?: string, options?: RestClientOptions & { rawResponse?: false | undefined }) : Promise<T>;
    public get<T>(resource?: string, options?: RestClientOptions) : Promise<T> {
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'GET',
            headers: this.getRequestHeaders(options)
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public patch(body: object | string, resource: string | undefined, options: RestClientOptions & { rawResponse: true }): Promise<HttpResponse>;
    public patch<T>(body: object | string, resource?: string, options?: RestClientOptions & { rawResponse?: false | undefined }): Promise<T>;
    public patch<T>(body: object | string, resource?: string, options?: RestClientOptions): Promise<T> {  
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'PATCH', 
            body: this.formatBody(body),
            headers: this.getRequestHeaders(options)
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public put(body: object | string, resource: string | undefined, options: RestClientOptions & { rawResponse: true }): Promise<HttpResponse>;
    public put<T>(body: object | string, resource?: string, options?: RestClientOptions & { rawResponse?: false | undefined }): Promise<T>;
    public put<T>(body: object | string, resource?: string, options?: RestClientOptions): Promise<T> {  
        return this.connection.request<T>({ 
            url: this.formatUrl(resource),
            method: 'PUT', 
            body: this.formatBody(body),
            headers: this.getRequestHeaders(options)
        }, { responseType: options?.rawResponse ? 'raw' : undefined });
    }

    public async delete(resource?: string, options?: RestClientOptions): Promise<number> {  
        const response = await this.connection.request({ 
            url: this.formatUrl(resource),
            method: 'DELETE', 
            headers: this.getRequestHeaders(options)
        }, { noContentResponse: true, responseType: 'raw' } );
        return response.statusCode ?? 200;
    }

    private getRequestHeaders(options?: RestClientOptions): OutgoingHttpHeaders {
        return {
            'content-type': options?.contentType ?? this.contentType,
            ...(this.extraHeaders ?? {})
        }
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