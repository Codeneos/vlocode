
/* Wrapper arround Angular functions */
import Constants from "./constants";

declare var angular: ng.IAngularStatic
var appModule;

export function module() : ng.IModule {
    return appModule || (appModule = angular.module(Constants.NG_APP_NAME, []));
} 

export function registerComponent<T>(ctor: (new () => T)) {
    let componentName = ctor.name.toLowerCase().replace(/^(.*?)component$/g,"$1");
    console.debug(`registerComponent ${ctor.name} as ${componentName}`);
    module().component(componentName, new ctor());
}

export function bootstrapAngular<T>(components: [(new () => T)]) {
    components.forEach(cmp => registerComponent(cmp));
    angular.element(document).ready(() => {
        angular.bootstrap(document, [Constants.NG_APP_NAME])
    });
}