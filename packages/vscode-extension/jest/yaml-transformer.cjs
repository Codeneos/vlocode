const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(target, source) {
    if (Array.isArray(target) && Array.isArray(source)) {
        return [ ...target, ...source ];
    }

    if (isPlainObject(target) && isPlainObject(source)) {
        const result = { ...target };
        for (const [ key, value ] of Object.entries(source)) {
            if (!(key in result)) {
                result[key] = value;
                continue;
            }
            result[key] = mergeDeep(result[key], value);
        }
        return result;
    }

    return source;
}

function loadYaml(filePath) {
    const loaded = yaml.load(fs.readFileSync(filePath, 'utf8')) ?? {};
    if (!Array.isArray(loaded.include) || loaded.include.length === 0) {
        return loaded;
    }

    const basePath = path.dirname(filePath);
    const included = loaded.include.map(includeFile => loadYaml(path.join(basePath, includeFile)));
    delete loaded.include;

    return mergeDeep(included.reduce((result, item) => mergeDeep(result, item), {}), loaded);
}

module.exports = {
    process(_sourceText, sourcePath) {
        const value = JSON.stringify(loadYaml(sourcePath))
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029');

        return { code: `module.exports = Object.freeze(${value});` };
    }
};
