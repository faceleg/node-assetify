'use strict';

var extend = require('xtend'),
    async = require('async'),
    registry = {};

function ensurePlugins(key, eventName){
    var id = (key || 'all') + '_' + eventName;
    if (registry[id] === undefined){
        registry[id] = [];
    }
    return registry[id];
}

function getPlugins(key, eventName){
    var specific = ensurePlugins(key, eventName),
        shared = ensurePlugins('all', eventName);

    return specific.concat(shared);
}

function addPlugin(key, eventName, plugin, opts){
    var plugins = ensurePlugins(key, eventName);
    plugins.push({
        plugin: plugin,
        opts: opts
    });
}

function raise(key, eventName, items, config, ctx, done){
    var plugins = getPlugins(key, eventName),
        tasks = [];

    plugins.forEach(function(e){
        ctx.opts = e.opts;
        tasks.push(async.apply(e.plugin, items, config, ctx));
    });

    async.series(tasks, function(err){
        if(err){
            throw err;
        }
        return done(null);
    });
}

function register(key, eventName, plugin, opts){
    if(typeof key === 'object'){
        key.events.forEach(function(e){
            register(key.key, e.eventName, e.plugin, e.opts);
        });
    }else{
        addPlugin(key, eventName, plugin, opts);
    }
}

var api = {
    register: register,
    raise: raise
};

module.exports = api;