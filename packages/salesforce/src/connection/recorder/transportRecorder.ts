import { HttpRequestInfo, HttpResponse, Transport } from "../httpTransport";
import { SessionDataStore } from "./sessionDataStore";

export class TransportRecorder implements Transport {

    private readonly store: SessionDataStore;

    constructor(
        private readonly transport: Transport | undefined,
        private readonly sessionFile: string = 'sessions-log.json') {
        this.store = new SessionDataStore();
    }

    public record<T extends HttpResponse>(info: HttpRequestInfo, responsePromise: Promise<T>): Promise<T> {
        responsePromise.then(response => {
            // Use sync writes to avoid issues with multiple processes
            // writing to the same file at once causing the log to be corrupted
            this.store.add(info, response);
            this.store.saveSession(this.sessionFile);
        });
        return responsePromise;
    }

    public httpRequest(info: HttpRequestInfo): Promise<HttpResponse> {
        if (!this.transport) {
            throw new Error('No transport provided');
        }
        return this.record(info, this.transport.httpRequest(info));
    }
}