var async = require('async'),
    path = require('path');

module.exports = {
    events: [{
        eventName: 'beforeRender',
        plugin: function(items, config, ctx, callback){
            (items || []).forEach(function(item){
                item.out = ctx.http.req.assetFingerprint(item.out);
            });
            callback();
        }
    }]
};