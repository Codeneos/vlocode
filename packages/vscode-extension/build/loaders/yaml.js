const merge = require('webpack-merge').merge;
const yaml = require('js-yaml');
const { dirname, join } = require('path');

function loadYaml(loader, file) {
    const loadedYml  = yaml.load(loader.fs.readFileSync(file, 'utf8'));
    loader.addDependency(file);

    if (loadedYml.include) {
        const basePath = dirname(file);
        const includedYml = loadedYml.include.map(file => loadYaml(loader, join(basePath, file)));
        delete loadedYml.include;
        return merge(...includedYml, loadedYml);
    }

    return loadedYml;
}

module.exports = function (source) {
    if (this.cacheable) {
        this.cacheable(true);
    }

    const path = this.utils.absolutify(this.context, this.resourcePath);
    const value = JSON.stringify(loadYaml(this, path))
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

    return `module.exports = Object.freeze(${value});`;
};