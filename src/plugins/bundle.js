var async = require('async'),
    path = require('path');

function profileNamesDistinct(items){
    var names = [undefined];
    items.forEach(function(item){
        if (names.indexOf(item.profile) === -1){
            names.push(item.profile);
        }
    });
    if(names.length > 1){ // if using profiles, don't save a common profile.
        return names.slice(1);
    }
    return names;
}

module.exports = {
    events: [{
        eventName: 'beforeBundle',
        plugin: function(items, config, ctx, callback){
            var profiles = profileNamesDistinct(items),
                bundles = [];

            return async.forEach(profiles, function(profile, done){
                var filename = ctx.key + '/' + profile + '.' + ctx.key,
                    bundle = {
                        profile: profile,
                        out: filename,
                        path: path.join(config.bin, filename),
                        sources: []
                    };

                items.forEach(function(item){
                    if(item.profile === undefined || item.profile === profile){
                        if(item.ext === undefined && item.inline !== true){
                            if(item.src === undefined){
                                throw new Error('item has no source nor is an external resource');
                            }
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