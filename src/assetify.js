var extend = require('xtend'),
    disk = require('./disk.js'),
    defaults = {
        development: process.env.NODE_ENV === 'development',
        appendTo: 'global',
        js: [],
        in: '/static',
        out: '/static/out'
    },
    config; // module configuration options

function configure(opts){
    if(config !== undefined){
        throw new Error('assetify can only be configured once.');
    }
    if(opts.base === undefined){
        throw new Error('opts.base is required. e.g: __dirname');
    }
    if(opts.in === opts.out){
        throw new Error("opts.in can't be the same as opts.out");
    }

    config = extend(defaults, opts);
    config.input = config.base + config.in;
    config.output = config.base + config.out;
}

function output(paths){
    var targets = [];
    paths.forEach(function(path){
        var target = config.output + path;
        // TODO: fix path? create subdirectories.
        disk.copy(config.input + path, target);
        targets.push(target);
    });
    return targets;
}

var api = {
    publish: function(opts){
        configure(opts);

        var js = output(config.js);
    }
};

module.exports = api;