module.exports = function (source) {
    return source.replace(/ from 'node:([a-zA-Z]+)'/ig, " from '$1'");
};