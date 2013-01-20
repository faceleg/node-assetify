var middleware = require('./middleware.js');

function process(key, locals){
    var dynamics = [];

    (locals.assetify.__dynamicStore || []).forEach(function(local){
        if(local.key === key){
            dynamics.push({ src: local.src, inline: true });
        }
    });
    return dynamics;
}

function register(key){
    middleware.register(key, 'add', function(locals){
        return function(src){
            if (locals.assetify.__dynamicStore === undefined){
                locals.assetify.__dynamicStore = [];
            }
            locals.assetify.__dynamicStore.push({
                key: key,
                src: src
            });
        };
    });
}

function expose(){
    register('js');
    register('css');
}

module.exports = {
    process: process,
    expose: expose
};