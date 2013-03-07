var async = require('async'),
    path = require('path');

module.exports = {
    events: [{
        eventName: 'beforeRender',
        plugin: function(items, config, ctx, done){
            if(!ctx.http.req.assetFingerprint){
                throw new Error('You forgot to add the static-asset middleware to your application, it is necessary for this plugin to work.');
            }
            (items || []).forEach(function(item){
                if (item.out){ // sanity
                    item.out = ctx.http.req.assetFingerprint(item.out);
                }
            });
            done();
        }
    }]
};