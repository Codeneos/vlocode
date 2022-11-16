import 'jest';

import { container } from '@vlocode/core';
import { JsForceConnectionProvider, SalesforceConnectionProvider } from '../connection';

describe('JsForceConnectionProvider', () => {
    describe('#create', () => {
        it('should register as JsForceConnectionProvider in container', () => {
            const isolatedContainer = container.new();
            const provider = isolatedContainer.register(new JsForceConnectionProvider({} as unknown as any));
            expect(provider).toBeInstanceOf(SalesforceConnectionProvider);
            expect(isolatedContainer.get(SalesforceConnectionProvider)).toBe(provider);
        });
    });
});