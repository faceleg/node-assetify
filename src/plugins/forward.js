var async = require('async'),
    path = require('path');

module.exports = {
    events: [{
        eventName: 'afterBundle',
        plugin: function(items, config, ctx, callback){
            if (config.__forwarded === true){
                return callback();
            }
            config.__forwarded = true;

            var walk = require('walk'),
                files = [];

            var walker  = walk.walk(config.source, { followLinks: false });

            walker.on('file', function(root, stat, next) {
                files.push({ name: stat.name, root: root });
                next();
            });

            walker.on('end', function() {
                console.log(files);
                callback();
            });
        }
    }]
};