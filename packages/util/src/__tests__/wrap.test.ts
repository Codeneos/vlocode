import 'jest';
import { wrap } from '../wrap';

describe('wrap', () => {
    it('should wrap a property without depending on @inject', () => {
        interface Service {
            getName(): string;
        }

        class ServiceImpl implements Service {
            public getName(): string {
                return 'service';
            }
        }

        class CachedService implements Service {
            constructor(private readonly inner: Service) { }

            public getName(): string {
                return `cached:${this.inner.getName()}`;
            }
        }

        class Consumer {
            @wrap(CachedService)
            public service: Service = new ServiceImpl();
        }

        const sut = new Consumer();

        expect(sut.service).toBeInstanceOf(CachedService);
        expect(sut.service.getName()).toBe('cached:service');
    });
});
