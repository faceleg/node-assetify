var async = require('async'),
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

function addPlugin(key, eventName, plugin){
    var plugins = ensurePlugins(key, eventName);
    plugins.push(plugin);
}

function raise(key, eventName, items, config, ctx, done){
    var plugins = getPlugins(key, eventName),
        tasks = [];

    plugins.forEach(function(plugin){
        tasks.push(async.apply(plugin, items, config, ctx));
    });

    async.series(tasks, function(err){
        if(err){
            throw err;
        }
        return done(null);
    });
}

function register(key, eventName, plugin){
    if(typeof key === 'object'){
        key.events.forEach(function(opts){
            register(key.key, opts.eventName, opts.plugin);
        });
    }else{
        addPlugin(key, eventName, plugin);
    }
}

var api = {
    register: register,
    raise: raise
};

module.exports = api;