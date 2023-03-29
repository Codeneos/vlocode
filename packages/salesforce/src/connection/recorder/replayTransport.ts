import { HttpRequestInfo, HttpResponse, Transport } from '../httpTransport';
import { SessionDataStore } from './sessionDataStore';

export class ReplayTransport implements Transport {

    constructor(private readonly sessionData: SessionDataStore) {
    }

    public httpRequest(info: HttpRequestInfo): Promise<HttpResponse> {
        if (!this.sessionData) {
            throw new Error('No session data loaded');
        }

        const response = this.sessionData.get(info);
        if (!response) {
            throw new Error(`No recorded response found for request ${info.method} ${info.url} (${this.sessionData.requestHash(info)})`);
        }

        return Promise.resolve(response);
    }
}