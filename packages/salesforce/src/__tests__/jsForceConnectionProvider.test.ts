import 'jest';

import { container } from '@vlocode/core';
import { JsForceConnectionProvider } from '../connection';

describe('JsForceConnectionProvider', () => {
    describe('#create', () => {
        it('should register as JsForceConnectionProvider in container', () => {
            const isolatedContainer = container.new();
            const provider = isolatedContainer.register(JsForceConnectionProvider.create({}));
            expect(provider).toBeInstanceOf(JsForceConnectionProvider);
            expect(isolatedContainer.get(JsForceConnectionProvider)).toBe(provider);
        });
    });
});