import type { Resolver } from 'enhanced-resolve';

export class NodePrefixResolverPlugin {
    apply(resolver: Resolver) {
        resolver
            .getHook('resolve')
            .tapAsync('NodePrefixResolverPlugin', (request, resolveContext, callback) => {
                // Any logic you need to create a new `request` can go here
                if (request.request?.startsWith('node:')) {
                    console.log(request);
                }
                return callback();
            });
    }
}