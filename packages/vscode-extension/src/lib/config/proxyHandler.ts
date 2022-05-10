import { configurationSection, storeAsOverrideMethod } from './configBase';
import { WorkspaceOverrideConfiguration } from './overrideConfiguration';
import { VscodeWorkspaceConfigProvider } from './workspaceConfigProvider';

export class ConfigProxyHandler<T extends object> implements ProxyHandler<T> {

    public constructor(
        private readonly configSectionName: string,
        private readonly workspaceOverrideConfig: WorkspaceOverrideConfiguration,
        private readonly configProvider: VscodeWorkspaceConfigProvider) {
    }

    public get(target: T, key: string | symbol) {
        if (key == configurationSection) {
            return this.configSectionName;
        } else if (key == storeAsOverrideMethod) {
            return this.workspaceOverrideConfig.setValue.bind(this.workspaceOverrideConfig);
        }
        if (typeof key === 'symbol' || typeof target[key] === 'function') {
            return target[key];
        }
        const value = this.getWorkspaceConfiguration().get(key.toString());
        if (typeof value === 'object' && value !== null) {
            return this.wrapInProxy(key, value);
        }
        const override = this.workspaceOverrideConfig.getValue(`${this.configSectionName}.${key}`);
        if (override !== undefined) {
            return override;
        }
        return value;
    }

    public set(target: any | T, key: string | symbol, value: any) {
        if (typeof key === 'symbol') {
            target[key] = value;
        } else {
            void this.getWorkspaceConfiguration().update(key.toString(), value, false);
        }
        return true;
    }

    public getOwnPropertyDescriptor(target: any | T, key: string | symbol) : PropertyDescriptor | undefined {
        return {
            value: this.get(target, key),
            enumerable: true,
            configurable: true
        };
    }

    public ownKeys() {
        const config = this.getWorkspaceConfiguration();
        const workspaceConfigKeys = Object.getOwnPropertyNames(config).filter(key => typeof config[key] !== 'function');
        const overrideKeys = this.workspaceOverrideConfig.getKeys() ?? [];
        return [...new Set([...workspaceConfigKeys, ...overrideKeys])];
    }

    private getWorkspaceConfiguration() {
        return this.configProvider.getVscodeConfiguration(this.configSectionName);
    }

    private wrapInProxy<T extends Object>(propertyPath: string | symbol | number, value: T): T {
        return new Proxy(value, {
            get: (target, key) => {
                // Handle base config properties
                if (key == configurationSection) {
                    return `${this.configSectionName}.${propertyPath.toString()}`;
                } else if (key == storeAsOverrideMethod) {
                    return this.workspaceOverrideConfig.setValue.bind(this.workspaceOverrideConfig);
                }
                // Set values
                const value = target[key];
                const fullPropertyPath = `${propertyPath.toString()}.${key.toString()}`;
                if (typeof value === 'object' && value !== null) {
                    return this.wrapInProxy(fullPropertyPath, value);
                }
                const override = this.workspaceOverrideConfig.getValue(`${this.configSectionName}.${fullPropertyPath}`);
                if (override !== undefined) {
                    return override;
                }
                return value;
            },
            set: (target, key, newValue) => {
                return this.set(value, `${propertyPath.toString()}.${key.toString()}`, newValue);
            }
        });
    }
}
