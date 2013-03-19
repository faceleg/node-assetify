'use strict';

var async = require('async'),
    path = require('path');

module.exports = {
    events: [{
        eventName: 'beforeBundle',
        plugin: function(items, config, ctx, callback){
            if (config.profiles === undefined){
                config.profiles = ['all'];
            }
            var bundles = [];

            return async.forEach(config.profiles, function(profile, done){
                var filename = '/' + ctx.key + '/' + profile + '.' + ctx.key,
                    bundle = {
                        profile: [profile],
                        out: filename,
                        path: path.join(config.bin, filename),
                        locals: [],
                        sources: []
                    };

                items.forEach(function(item){
                    if(item.profile === undefined || item.profile.indexOf(profile) !== -1 || profile === 'all'){
                        if(item.ext === undefined && item.inline !== true){
                            if(item.src === undefined){
                                throw new Error('item has no source nor is an external resource');
                            }
                            bundle.locals.push(item.local);
                            bundle.sources.push(item.src);
                        }else{
                            if (bundles.indexOf(item) === -1){
                                bundles.push(item); // keep external resources unaltered.
                            }
                        }
                    }
                });

                bundle.src = bundle.sources.join('\n');
                bundles.push(bundle);
                return done();
            }, function(err){
                if(err){
                    throw err;
                }
                items.splice(0, items.length);
                bundles.forEach(function(bundle){
                    items.push(bundle);
                });
                callback();
            });
        }
    }]
};