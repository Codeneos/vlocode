import { LogManager } from "@vlocode/core";
import { CustomError, encodeQueryString } from "@vlocode/util";
import { HttpTransport, Transport } from './httpTransport';

interface OAuth2TokenResponse  {
    id: string;
    instance_url: string;
    access_token: string;
    refresh_token: string;
}

interface SalesforceOAuth2Options {
    loginUrl?: string;
    authzServiceUrl?: string;
    tokenServiceUrl?: string;
    revokeServiceUrl?: string;
    clientId: string;
    clientSecret?: string;
    redirectUri: string;
}

export class SalesforceOAuth2 {

    private readonly transport: Transport;

    public readonly loginUrl: string;
    public readonly authzServiceUrl: string;
    public readonly tokenServiceUrl: string;
    public readonly revokeServiceUrl: string;

    public readonly clientId: string;
    public readonly clientSecret: string;
    public readonly redirectUri: string;

    constructor(options: SalesforceOAuth2Options) {
        if (options.authzServiceUrl && options.tokenServiceUrl) {
            this.loginUrl = options.authzServiceUrl.split('/').slice(0, 3).join('/');
            this.authzServiceUrl = options.authzServiceUrl;
            this.tokenServiceUrl = options.tokenServiceUrl;
            this.revokeServiceUrl = options.revokeServiceUrl ?? `${this.loginUrl}/services/oauth2/revoke`;
        } else {
            if (!options.loginUrl) {
                throw new Error('Cannot create OAuth instance without setting the loginUrl');
            }
            this.loginUrl = options.loginUrl;
            this.authzServiceUrl = `${this.loginUrl}/services/oauth2/authorize`;
            this.tokenServiceUrl = `${this.loginUrl}/services/oauth2/token`;
            this.revokeServiceUrl = `${this.loginUrl}/services/oauth2/revoke`;
        }

        this.transport = new HttpTransport({
            handleCookies: false,
            // OAuth endpoints do not support gzip encoding
            useGzipEncoding: false,
            instanceUrl: options.loginUrl,
            baseUrl: `${options.loginUrl}/services/oauth2`
        }, LogManager.get(SalesforceOAuth2));

        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret!;
        this.redirectUri = options.redirectUri;
    }

    public getAuthorizationUrl(params?: { scope?: string | undefined; state?: string | undefined; }): string {
        const authzParams: Record<string, string> = {
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            ...params
        }
        const queryString = encodeQueryString(authzParams);
        return `${this.authzServiceUrl}${this.authzServiceUrl.includes('?') ? '&' : '?'}${queryString}`;
    }

    public requestToken(code: string): Promise<OAuth2TokenResponse>;
    public requestToken(code: string, extraParams?: Record<string, string>): Promise<OAuth2TokenResponse> {
        const params: Record<string, string> = {
            grant_type: 'authorization_code',
            code,
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            ...extraParams
        }
        if (this.clientSecret) {
            params.client_secret = this.clientSecret;
        }
        return this.post(params, { url: this.tokenServiceUrl });
    }

    public authenticate(username: string, password: string): Promise<OAuth2TokenResponse> {
        const params: Record<string, string> = {
            grant_type: 'password',
            username : username,
            password : password,
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
        }
        if (this.clientSecret) {
            params.client_secret = this.clientSecret;
        }
        return this.post(params, { url: this.authzServiceUrl });
    }

    revokeToken(token: string): Promise<undefined> {
        return this.post({ token }, { url: this.revokeServiceUrl });
    }

    /**
     * Refreshes the oauth token and returns an OAuth2TokenResponse object.
     * @param refreshToken The refresh token used to get a new access token
     * @returns New access token
     */
    public refreshToken(refreshToken: string): Promise<OAuth2TokenResponse> {
        const params: Record<string, string> = {
            grant_type : "refresh_token",
            refresh_token : refreshToken,
            client_id : this.clientId
        };
        if (this.clientSecret) {
            params.client_secret = this.clientSecret;
        }
        return this.post(params);
    }

    /**
     * Retrieves user information using the provided access token.
     * @param accessToken The access token to use for authentication.
     * @returns A promise that resolves to an object containing user information.
     */
    public async userInfo(accessToken: string): Promise<Record<string, any>> {
        const params: Record<string, string> = {
            access_token: accessToken,
        };
        return this.post(params, { url: 'userinfo' });
    }

    /**
     * Introspect checks the current state of an OAuth 2.0 access or refresh token.
     * @param token Token strign to introspect
     * @param type Type of token to introspect
     * @returns
     */
    public async introspect(token: string, type: 'access_token' | 'refresh_token'): Promise<Record<string, any>> {
        const params: Record<string, string> = {
            token,
            token_type_hint: type
        };
        return this.post(params, { url: 'introspect' });
    }

    /**
     * Post a request to token service
     * @param params Params as object send as URL encoded data
     * @returns Response body as JSON object
     */
    private async post<T>(params: Record<string, string>, options?: { url?: string; }): Promise<T> {
        const response = await this.transport.httpRequest({
            method: 'POST',
            url: options?.url ?? this.tokenServiceUrl,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: encodeQueryString(params),
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