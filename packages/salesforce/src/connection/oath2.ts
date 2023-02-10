import { CustomError, decorate } from "@vlocode/util";
import { OAuth2 } from "jsforce";
import { HttpTransport } from "./httpTransport";
import { SalesforceConnection } from "./salesforceConnection";

interface OAuth2TokenResponse {
    id: string;
    instance_url: string;
    access_token: string;
    refresh_token: string;
}

export class SalesforceOAuth2 extends decorate(OAuth2) {

    private transport: HttpTransport;

    constructor(oauth: OAuth2, connection: SalesforceConnection) {
        super(oauth);

        this.transport = new HttpTransport({
            handleCookies: false,
            // OAuth endpoints do not support gzip encoding
            useGzipEncoding: false,
            shouldKeepAlive: false,
            instanceUrl: connection.instanceUrl,
            baseUrl: connection._baseUrl()
        });
    }

    /**
     * Refreshes the oauth token and returns an OAuth2TokenResponse object.
     * @param code session token
     * @returns New access token
     */
    refreshToken(code: string): Promise<OAuth2TokenResponse> {
        return this.inner.refreshToken(code) as Promise<OAuth2TokenResponse>;
    }

    /**
     * Post a request to token service
     * @param params Params as object send as URL encoded data
     * @returns Response body as JSON object
     */
    private async _postParams(params: Record<string, string>) {
        const response = await this.transport.httpRequest({
            method: 'POST',
            url: this.tokenServiceUrl,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: Object.entries(params).map(([v,k]) => `${v}=${encodeURIComponent(k)}`).join('&'),
        });

        if (response.statusCode && response.statusCode >= 400) {
            if (typeof response.body === 'object') {
                throw new CustomError(response.body['error_description'], { name: response.body['error'] });
            }

            throw new CustomError(response.body ?? '(SalesforceOAuth2) No response from server', {
                name: `ERROR_HTTP_${response.statusCode}`
            });
        }

        if (typeof response.body !== 'object') {
            throw new Error('(SalesforceOAuth2) No response from server');
        }

        return response.body;
    }
}