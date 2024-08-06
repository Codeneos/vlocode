import 'jest';
import { Logger, container, Container, LifecyclePolicy, injectable } from '../';

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

    @injectable()
    class ServiceImplCircular {
        public id = 0;
        static instanceCounter = 0;
        constructor(public child: CircularRef) {
            this.id = ++ServiceImplCircular.instanceCounter;
        }
    }

    @injectable()
    class CircularRef {
        constructor(public parent: ServiceImplCircular) {
        }
    }

    class InjectableProps {
        @injectable.property public service: ServiceImpl;
    }

    beforeAll(() =>  container.registerAs(Logger.null, Logger));

    describe('register', () => {
        it('class instance without metadata should register as itself', () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('ServiceImpl')).not.toBeUndefined();
        });
        it('class instance should register it\'s prototype as well', () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('ServiceShape')).not.toBeUndefined();
        });
        it('class instance should register it\'s prototype->prototype as well', () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.register(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('BaseShape')).not.toBeUndefined();
        });
    });

    describe('resolve', () => {
        it('should prefer active instance over registered type', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            const activeInstance = new ServiceImpl();
            testContainer.registerType(ServiceImpl, [ServiceImpl, BaseShape, ServiceShape]);
            testContainer.register(activeInstance);

            // Act + Assert
            expect(testContainer.resolve(BaseShape)).toBe(activeInstance);
            expect(testContainer.resolve(ServiceImpl)).toBe(activeInstance);
            expect(testContainer.resolve(ServiceShape)).toBe(activeInstance);
        });
        it('should create multiple instance when lifecycle is transient', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.registerType(ServiceImpl, [ServiceImpl, BaseShape, ServiceShape], { lifecycle: LifecyclePolicy.transient });

            // Act
            const results = [testContainer.resolve(ServiceImpl), testContainer.resolve(ServiceImpl)];

            // Assert
            expect(results[0]).not.toBe(results[1]);
            expect(results[0]).toBeInstanceOf(ServiceImpl);
            expect(results[1]).toBeInstanceOf(ServiceImpl);
        });
        it('should create single instance when lifecycle is singleton', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.registerType(ServiceImpl, [ServiceImpl, BaseShape, ServiceShape], { lifecycle: LifecyclePolicy.singleton });

            // Act
            const results = [testContainer.resolve(ServiceImpl), testContainer.resolve(ServiceImpl)];

            // Assert
            expect(results[0]).toBe(results[1]);
        });
        it('should call factory method when a factory is registered', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            const factory = jest.fn().mockReturnValue(new ServiceImpl());
            testContainer.registerFactory(ServiceImpl, factory);

            // Act
            testContainer.resolve(ServiceImpl);
            testContainer.resolve(ServiceImpl);

            // Assert
            expect(factory).toBeCalledTimes(2);
        });
        it('should call factory method 1 once when for singleton factories', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            const factory = jest.fn().mockReturnValue(new ServiceImpl());
            testContainer.registerFactory(ServiceImpl, factory, LifecyclePolicy.singleton);

            // Act
            testContainer.resolve(ServiceImpl);
            testContainer.resolve(ServiceImpl);

            // Assert
            expect(factory).toBeCalledTimes(1);
        });
        it('should resolve circular references without creating duplicate service instances', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.registerType(ServiceImplCircular, [ServiceImplCircular], { lifecycle: LifecyclePolicy.singleton });
            testContainer.registerType(CircularRef, [CircularRef], { lifecycle: LifecyclePolicy.singleton });

            // Act
            const result = testContainer.resolve(ServiceImplCircular)!;

            // Assert
            expect(result).toBeInstanceOf(ServiceImplCircular);
            expect(result.child).toBeInstanceOf(CircularRef);
            expect(result.child.parent).not.toBeUndefined();
            expect(result.child.parent.child).not.toBeUndefined();
            expect(result.child.parent.id).toEqual(result.id);
        });
    });

    describe('create', () => {
        it('should resolve injectable properties on non-injectable class', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.registerType(ServiceImpl, [ServiceImpl, BaseShape, ServiceShape]);

            // Act
            const instance = testContainer.create(InjectableProps);

            // Assert
            expect(instance.service).not.toBeUndefined();
            expect(instance.service).toBeInstanceOf(ServiceImpl);
        });
    });    
});
