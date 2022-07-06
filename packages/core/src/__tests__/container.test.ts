import 'jest';
import * as path from 'path';
import { Logger, container, injectable, Container } from '../';

describe('container', () => {

    abstract class ServiceShape {
        public abstract foo(): string;
        public abstract bar(): Promise<string>;
    }

    class ServiceImpl extends ServiceShape {
        foo() { return 'bar'; }
        bar() { return Promise.resolve('foo'); }
    }
    
    beforeAll(() =>  container.registerAs(Logger.null, Logger));

    describe('registerType', () => {
        it('class instance without metadata should register as itself', async () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['serviceTypes'].size).toBe(0);
            expect(testContainer['instances'].size).toBe(1);
            expect(testContainer['instances'].get('ServiceImpl')).not.toBeNull();
        });
    });
});
