var async = require('async'),
    path = require('path');

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
        async.forEach(files, forwardFile,function(err){
            if(err){
                throw err;
            }
            console.log(files);
            // TODO: actually forward these to the out folder, exact same place.
            // TODO: what happens when bundling, how to figure out target path?
            // TODO maybe: look up in locals arrays.
            callback();
        });
    });
}

function forwardFile(file, done){
    done();
}

module.exports = {
    events: [{
        eventName: 'afterBundle',
        plugin: plugin,
        opts: { // TODO: become a function to allow custom opts.
            extnames: ['.png', '.gif', '.jpg', '.jpeg']
        }
    }]
};