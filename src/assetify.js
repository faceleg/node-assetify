var extend = require('xtend'),
    disk = require('./disk.js'),
    defaults = {
        development: process.env.NODE_ENV === 'development',
        appendTo: 'global',
        js: [],
        base: '/static',
        out: '/assets'
    };

function output(opts, paths){
    paths.forEach(function(path){
        disk.copy(opts.base + path, opts.out + path);
    });
}

var api = {
    publish: function(opts){
        var config = extend(defaults, opts);

        output(config, config.js);
    }
};

module.exports = api;