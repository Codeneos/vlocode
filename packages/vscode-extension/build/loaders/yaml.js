const fs = require('fs');
const merge = require('webpack-merge').merge;
const yaml = require('js-yaml');

function loadYaml(yamlSrc) {
    const loadedYml  = yaml.load(yamlSrc);
    if (loadedYml.include) {
        const includedYml = loadedYml.include.map(file => loadYamlFile(file));
        delete loadedYml.include;
        return merge(...includedYml, loadedYml);
    }
    return loadedYml;
}

function loadYamlFile(yamlFile) {
    console.log(`Loading ${yamlFile}...`);
    return loadYaml(fs.readFileSync(yamlFile, 'utf8'));
}

module.exports = function (source) {
    if (this.cacheable) {
        this.cacheable(true);
    }

    const value = JSON.stringify(loadYaml(source))
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

    return `module.exports = Object.freeze(${value});`;
};