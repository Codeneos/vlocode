import 'jest';
import { Logger, container, Container } from '../';

describe('container', () => {

    abstract class BaseShape {
        public abstract foo(): string;
    }

    abstract class ServiceShape extends BaseShape {
        public abstract bar(): Promise<string>;
    }

    class ServiceImpl extends ServiceShape {
        foo() { return 'bar'; }
        bar() { return Promise.resolve('foo'); }
    }
    
    beforeAll(() =>  container.registerAs(Logger.null, Logger));

    describe('register', () => {
        it('class instance without metadata should register as itself', async () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('ServiceImpl')).not.toBeUndefined();
        });
        it('class instance should register it\'s prototype as well', async () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('ServiceShape')).not.toBeUndefined();
        });
        it('class instance should register it\'s prototype->prototype as well', async () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('BaseShape')).not.toBeUndefined();
        });
    });
});
