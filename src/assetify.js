var extend = require('xtend'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    disk = require('./disk.js'),
    html = require('./html.js'),
    pluginFramework = require('./plugins/framework.js'),
    defaults = {
        appendTo: global,
        js: [],
        css: []
    },
    config; // module configuration options

function configure(opts){
    if(config !== undefined){
        throw new Error('assetify can only be configured once.');
    }

    config = extend(defaults, opts);

    if(config.source === undefined){
        throw new Error("opts.source must be defined as the folder where your assets are");
    }
    if(config.bin === undefined){
        throw new Error("opts.bin must be defined as the folder where processed assets will be stored");
    }
    if(config.source === config.bin){
        throw new Error("opts.source can't be the same as opts.bin");
    }
}

function readFilesAsync(items, cb){
    async.forEach(items, function(source, callback){
        var complex = typeof source === 'object',
            item = complex ? source : {
                local: source
            };

        var i = items.indexOf(source);
        items[i] = item;

        if(item.local !== undefined){ // local might not exist.
            var file = path.join(config.source, item.local);

            fs.readFile(file, function(err, data){
                if(err){
                    throw err;
                }
                item.src = data;
                item.path = path.join(config.bin, item.local);
                item.out = item.local; // relative path in the output directory
                callback(err);
            });
        }
    }, cb);
}

function outputAsync(items, cb){
    async.forEach(items, function(item, callback){
        disk.write(item.path, item.src, callback);
    },function(err){
        if(err){
            throw err;
        }
        cb(null);
    });
}

function processLoop(items, key, cb){
    var ctx = { key: key };

    async.series([
        async.apply(fse.remove, config.bin),
        async.apply(readFilesAsync, items),
        async.apply(pluginFramework.raise, key, 'afterReadFile', items, config, ctx),
        async.apply(pluginFramework.raise, key, 'beforeBundle', items, config, ctx),
        async.apply(pluginFramework.raise, key, 'afterBundle', items, config, ctx),
        async.apply(outputAsync, items),
        async.apply(pluginFramework.raise, key, 'afterOutput', items, config, ctx)
    ],function (err){
        if(err){
            throw err;
        }
        cb(items);
    });
}

function process(items, key, tag, done){
    processLoop(items, key, function(results){
        config.appendTo[key] = tag(results);
        return done();
    });
}

var api = {
    compile: function(opts, cb){
        configure(opts);

        async.parallel([
            async.apply(process, config.js, 'js', html.scriptTags),
            async.apply(process, config.css, 'css', html.styleTags)
        ], cb);

        return config.bin;
    },
    use: pluginFramework.register,
    jQuery: function(version, local, profile){
        return {
            ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery.min.js',
            local: local,
            test: 'window.jQuery',
            profile: profile
        }
    },
    plugins: require('./plugins/all.js')
};

module.exports = api;