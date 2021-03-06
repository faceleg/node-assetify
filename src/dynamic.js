'use strict';

function instance(){
    var middleware;
    
    function process(key, req, res){
        var dynamics = {
                before: [],
                after: []
            };

        (res.locals.assetify.__dynamicStore || []).forEach(function(item){
            if(item.key === key){
                if(item.placement === 'before'){
                    dynamics.before.push({ src: item.src, inline: true });
                }else{
                    dynamics.after.push({ src: item.src, inline: true });
                }
            }
        });

        return dynamics;
    }

    function register(key){
        middleware.register(key + '.add', function(req, res, done){
            done(null, function(src, placement){
                var locals = res.locals;
                
                if (locals.assetify.__dynamicStore === undefined){
                    locals.assetify.__dynamicStore = [];
                }
                locals.assetify.__dynamicStore.push({
                    key: key,
                    src: src,
                    placement: placement
                });
            });
        });
    }

    function expose(middlewareInstance){
        middleware = middlewareInstance;
        
        register('js');
        register('css');
    }

    return {
        process: process,
        expose: expose,
    };
}

module.exports = {
    instance: instance
};