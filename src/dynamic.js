var middleware = require('./middleware.js');

function process(key, req, res){
    var dynamics = {
        before: [],
        after: []
    };

    (res.locals.assetify.__dynamicStore || []).forEach(function(local){
        if(local.key === key){
            if(local.placement === 'before'){
                dynamics.before.push({ src: local.src, inline: true });
            }else{
                dynamics.after.push({ src: local.src, inline: true });
            }
        }
    });

    return dynamics;
}

function register(key){
    middleware.register(key, 'add', function(req, res){
        var locals = res.locals;

        return function(src, placement){
            if (locals.assetify.__dynamicStore === undefined){
                locals.assetify.__dynamicStore = [];
            }
            locals.assetify.__dynamicStore.push({
                key: key,
                src: src,
                placement: placement
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