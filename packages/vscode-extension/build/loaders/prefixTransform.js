module.exports = function (source) {
    if (this.cacheable) {
        this.cacheable(true);
    }
    return source.replace(/ from 'node:([a-zA-Z]+)'/ig, " from '$1'");
};