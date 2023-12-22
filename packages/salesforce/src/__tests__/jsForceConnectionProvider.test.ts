import 'jest';

import { container } from '@vlocode/core';
import { JsForceConnectionProvider, SalesforceConnectionProvider } from '../connection';

describe('JsForceConnectionProvider', () => {
    describe('#create', () => {
        it('should register as SalesforceConnectionProvider in container', () => {
            const isolatedContainer = container.new({ isolated: true });
            const provider = new JsForceConnectionProvider({} as unknown as any);
            isolatedContainer.register(provider);
            expect(provider).toBeInstanceOf(SalesforceConnectionProvider);
            expect(isolatedContainer.get(SalesforceConnectionProvider)).toBe(provider);
            expect(isolatedContainer.get(JsForceConnectionProvider)).toBe(provider);
        });
    });
});