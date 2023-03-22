import { HttpRequestInfo, HttpResponse, ReplayTransport, SessionDataStore } from "@vlocode/salesforce";

export class MockTransport extends ReplayTransport {
    public readonly matchers = new Array<{
        matcher: RegExp,
        response: HttpResponse
    }>();

    constructor(sessionData: SessionDataStore) {
        super(sessionData);
    }

    public addQueryResponse(matcher: RegExp, records: Array<any>) {
        return this.matchers.push({
            matcher,
            response: {
                statusCode: 200,
                headers: {
                    "content-type": "application/json; charset=utf-8",
                },
                body: {
                    totalSize: 37,
                    done: true,
                    records
                }
            }
        });
    }

    public httpRequest(info: HttpRequestInfo): Promise<HttpResponse> {
        for (const { matcher, response } of this.matchers) {
            if (matcher.test(info.url)) {
                return Promise.resolve(response);
            }
        }
        return super.httpRequest(info);
    }
}