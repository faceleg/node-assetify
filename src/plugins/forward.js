'use strict';

var async = require('async'),
    path = require('path'),
    disk = require('../disk.js');

/* if e.g: '/css/fonty/fonts.css' is an input location with a different out location,
 * then forward stuff like '/css/fonty/font.ttf' to that same output folder
 * this will prevent issues in relative paths when assets are bundled together.
 */
function fixTargetForAssetifiedFolders(relative, target, config, ctx){
    var assets = config[ctx.key];

    assets.some(function(asset){
        return asset.files.some(function(file){
            var dir = path.dirname(path.normalize(file.substr(1))),
                relativedir = path.dirname(path.normalize(relative)),
                match = dir === relativedir;

            if (match){
                var dirname = path.dirname(asset.out),
                    basename = path.basename(target);

                target = path.join(config.bin, dirname, basename);
            }
            return match;
        });
    });

    return target;
}

function forwardFile(file, config, ctx, done){
    var relative = path.relative(config.source, file),
        target = path.join(config.bin, 'assets', relative),
        fixed = fixTargetForAssetifiedFolders(relative, target, config, ctx);

    disk.copySafe(file, fixed, done);
}

function plugin(items, config, ctx, callback){
    if (config.__forwarded === true){ // sanity
        return callback();
    }
    config.__forwarded = true;

    var walk = require('walk'),
        walker  = walk.walk(config.source, { followLinks: false }),
        files = [];

    walker.on('file', function(root, stat, next) {
        var current = path.join(root, stat.name),
            extname = path.extname(current);

        if(ctx.opts.extnames.indexOf(extname) > -1){
            files.push(current);
        }
        next();
    });

    walker.on('end', function() {
        async.forEach(files, function(file, done){
            forwardFile(file, config, ctx, done);
        },function(err){
            if(err){
                throw err;
            }
            callback();
        });
    });
}

module.exports = function(opts, concatenate){
    var eventOpts = {
        extnames: ['.ico', '.png', '.gif', '.jpg', '.jpeg']
    };

    if(concatenate === true){
        eventOpts.extnames = eventOpts.extnames.concat(opts.extnames || []);
    }else if(opts !== undefined){
        eventOpts = opts;
    }

    return {
        events: [{
            eventName: 'afterBundle',
            plugin: plugin,
            opts: eventOpts
        }]
    };
};