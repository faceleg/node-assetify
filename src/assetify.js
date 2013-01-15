var extend = require('xtend'),
    disk = require('./disk.js'),
    defaults = {
        development: process.env.NODE_ENV === 'development',
        appendTo: 'global',
        js: [],
        in: '/static',
        out: '/assets'
    },
    config; // module configuration options

function configure(opts){
    if(config !== undefined){
        throw new Error('assetify can only be configured once.');
    }
    if(opts.base === undefined){
        throw new Error('opts.base is required. e.g: __dirname');
    }

    config = extend(defaults, opts);
    config.input = config.base + config.in;
    config.output = config.base + config.out;
}

function output(paths){
    paths.forEach(function(path){
        disk.copy(config.input + path, config.output + path);
    });
}

var api = {
    publish: function(opts){
        configure(opts);

        output(config.js);
    }
};

module.exports = api;