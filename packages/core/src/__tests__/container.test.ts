import 'jest';
import { Logger, container, Container, LifecyclePolicy, inject } from '../';
import { ServiceImplCircular } from './container.circular';
import { CircularRef } from './container.circular.ref';

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

    class InjectableProps {
        name: string = 'InjectableProps';
        @inject(ServiceImpl) public service: ServiceImpl;
    }

    class InjectablePropsLazy { 
        name: string = 'InjectablePropsLazy';
        @inject(() => ServiceImpl) public service: ServiceImpl;
    }

    class InjectablePropsNoType {
        name: string = 'InjectablePropsNoType';
        @inject() public service: ServiceImpl;
    }

    class NamedDependencyProps {
        @inject("MyCustomService") public customService: ServiceImpl;
    }

    beforeAll(() => container.add(Logger.null));

    describe('add', () => {
        it('class instance without metadata should add as itself', () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.add(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('ServiceImpl')).not.toBeUndefined();
        });
        it('class instance should add it\'s prototype as well', () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.add(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('ServiceShape')).not.toBeUndefined();
        });
        it('class instance should add it\'s prototype->prototype as well', () => {
            // Arrange
            const testContainer = new Container(Logger.null);

            // Act
            testContainer.add(new ServiceImpl());

            // Assert
            expect(testContainer['instances'].get('BaseShape')).not.toBeUndefined();
        });
    });

    describe('resolve', () => {
        it('should prefer active instance over added type', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            const activeInstance = new ServiceImpl();
            testContainer.add(ServiceImpl, { provides: [ServiceImpl, BaseShape, ServiceShape] });
            testContainer.add(activeInstance);

            // Act + Assert
            expect(testContainer.resolve(BaseShape)).toBe(activeInstance);
            expect(testContainer.resolve(ServiceImpl)).toBe(activeInstance);
            expect(testContainer.resolve(ServiceShape)).toBe(activeInstance);
        });
        it('should create multiple instance when lifecycle is transient', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.add(ServiceImpl, { provides: [ServiceImpl, BaseShape, ServiceShape], lifecycle: LifecyclePolicy.transient });

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
            testContainer.add(ServiceImpl, { provides: [ServiceImpl, BaseShape, ServiceShape], lifecycle: LifecyclePolicy.singleton });

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
            expect(factory).toHaveBeenCalledTimes(2);
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
            expect(factory).toHaveBeenCalledTimes(1);
        });
        it('should resolve circular references without creating duplicate service instances', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.add(ServiceImplCircular, { lifecycle: LifecyclePolicy.singleton });
            testContainer.add(CircularRef, { lifecycle: LifecyclePolicy.singleton });

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
            testContainer.add(ServiceImpl, { provides:  [ServiceImpl, BaseShape, ServiceShape] });
            
            // Act
            const instance = testContainer.new(InjectableProps);

            // Assert
            expect(instance.service).not.toBeUndefined();
            expect(instance.service).toBeInstanceOf(ServiceImpl);
        });

        it('should resolve lazy injectable properties on non-injectable class', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.add(ServiceImpl, { provides:  [ServiceImpl, BaseShape, ServiceShape] });

            const type = Logger;
            const lazyType2 = () => { return Logger };
            const lazyType1 = function a () { return Logger };
            
            // Act
            const instance = testContainer.new(InjectablePropsLazy);

            // Assert
            expect(instance.service).not.toBeUndefined();
            expect(instance.service).toBeInstanceOf(ServiceImpl);
        });

        it('should resolve injectable properties using @inject() without parameters', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            testContainer.add(ServiceImpl, { provides:  [ServiceImpl, BaseShape, ServiceShape] });

            // Act
            const a = new InjectablePropsNoType();
            const instance = testContainer.new(InjectablePropsNoType);

            // Assert
            expect(instance.service).not.toBeUndefined();
            expect(instance.service).toBeInstanceOf(ServiceImpl);
        });

        // it('should resolve named dependencies using @inject("DEP_NAME") syntax', () => {
        //     // Arrange
        //     const testContainer = new Container(Logger.null);
        //     const customService = new ServiceImpl();
        //     testContainer.add(customService, "MyCustomService");

        //     // Act
        //     const instance = testContainer.create(NamedDependencyProps);

        //     // Assert
        //     expect(instance.customService).not.toBeUndefined();
        //     expect(instance.customService).toBe(customService);
        //     expect(instance.customService).toBeInstanceOf(ServiceImpl);
        // });
    });

    describe('removeInstance', () => {
        class ServiceA {
            public id = 'A';
        }

        class ServiceB {
            constructor(@inject(ServiceA) public serviceA: ServiceA) {
                this.id = 'B';
            }
            public id: string;
        }

        class ServiceC {
            constructor(@inject(ServiceA) public serviceA: ServiceA) {
                this.id = 'C';
            }
            public id: string;
        }

        it('should cascade remove dependent instances when removing a shared dependency', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            const instanceA = new ServiceA();
            
            testContainer.add(instanceA);
            const instanceB = testContainer.new(ServiceB);
            const instanceC = testContainer.new(ServiceC);
            
            // Add the dependent instances to the container so they get tracked
            testContainer.add(instanceB);
            testContainer.add(instanceC);
            
            // Verify instances are created and registered
            expect(instanceB.serviceA).toBe(instanceA);
            expect(instanceC.serviceA).toBe(instanceA);
            expect(testContainer['instances'].has('ServiceA')).toBe(true);
            expect(testContainer['instances'].has('ServiceB')).toBe(true);
            expect(testContainer['instances'].has('ServiceC')).toBe(true);

            // Act
            testContainer.removeInstance(instanceA);

            // Assert
            expect(testContainer['instances'].has('ServiceA')).toBe(false);
            expect(testContainer['instances'].has('ServiceB')).toBe(false);
            expect(testContainer['instances'].has('ServiceC')).toBe(false);
        });

        it('should handle circular dependencies during removal', () => {
            // Arrange
            const testContainer = new Container(Logger.null);
            const instanceA = new ServiceA();
            
            testContainer.add(instanceA);
            const instanceB = testContainer.new(ServiceB);
            const instanceC = testContainer.new(ServiceC);
            
            // Add the dependent instances to the container
            testContainer.add(instanceB);
            testContainer.add(instanceC);

            // Act
            testContainer.removeInstance(instanceA);

            // Assert - all should be removed
            expect(testContainer['instances'].has('ServiceA')).toBe(false);
            expect(testContainer['instances'].has('ServiceB')).toBe(false);
            expect(testContainer['instances'].has('ServiceC')).toBe(false);
        });
    });

    describe('container injection', () => {
        class ServiceWithContainerProperty {
            @inject(Container) public container: Container;
        }

        class ServiceWithContainerParameter {
            constructor(@inject(Container) public container: Container) {}
        }

        it('should inject the creating container for Container-typed properties', () => {
            // Arrange
            const rootContainer = new Container(Logger.null);
            const childContainer = rootContainer.create();

            // Act
            const instance = childContainer.new(ServiceWithContainerProperty);

            // Assert
            expect(instance.container).toBe(childContainer);
            expect(instance.container).not.toBe(rootContainer);
        });

        it('should inject the creating container for Container-typed constructor parameters', () => {
            // Arrange
            const rootContainer = new Container(Logger.null);
            const childContainer = rootContainer.create();

            // Act
            const instance = childContainer.new(ServiceWithContainerParameter);

            // Assert
            expect(instance.container).toBe(childContainer);
            expect(instance.container).not.toBe(rootContainer);
        });

        it('should fallback to root container when instance was created outside any container', () => {
            // Arrange
            const instance = new ServiceWithContainerProperty();

            // Act
            const injectedContainer = instance.container;

            // Assert
            expect(injectedContainer).toBe(container);
        });
    });
});
