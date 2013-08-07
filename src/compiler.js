'use strict';

function compiler(middleware, pluginFramework, collector){
    var extend = require('xtend'),
        fs = require('fs'),
        path = require('path'),
        async = require('async'),
        disk = require('./disk.js'),
        defaults = {
            js: [],
            css: [],
            host: ''
        },
        snippets = 0,
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
        if(config.source === config.bin && !config.explicit){
            throw new Error("opts.source can't be the same as opts.bin unless opts.explicit is enabled");
        }

        config.js = config.js.concat(collector.assets.js);
        config.css = config.css.concat(collector.assets.css);

        config.binAssets = config.explicit ? config.bin : path.join(config.bin, 'assets');
    }

    function anonymousSnippet(key){
        return '/snippet_' + (++snippets) + '.' + key;
    }

    function readFilesAsync(items, key, done){
        async.forEach(items, function(source, callback){
            var complex = typeof source === 'object',
                item = complex ? source : {
                    file: source
                };

            item.files = item.file ? [item.file] : [];

            if(typeof item.profile === 'string'){
                item.profile = [item.profile];
            }

            if (item.profile !== undefined){
                item.profile = Array.prototype.concat.apply([], item.profile); // copy it
            }

            var i = items.indexOf(source);
            items[i] = item;

            if (item.inline !== true && (item.file || !item.ext)){
                item.out = item.file || anonymousSnippet(key);
            }

            if(item.file !== undefined && item.src === undefined){ // file might not exist.
                var file = path.join(config.source, item.file);

                var readFile = function(filePath, callback) {
                    fs.readFile(filePath, 'utf8', function(err, data){
                        if(err){
                            return callback(err);
                        }
                        item.src = data;
                        callback();
                    });
                };
                fs.exists(file, function(exists) {
                  if (exists) {
                    readFile(file, callback);
                  } else {
                    fs.exists(item.file, function(exists) {
                        if (!exists) {
                            return callback(new Error('File does not exist at either "' + file + '" or "' + item.file + '"'));
                        }
                        readFile(item.file, callback);
                    });
                  }
                });
            }else{
                if (item.src === undefined){
                    item.src = ''; // sanity
                }
                callback();
            }
        }, done);
    }

    function outputAsync(items, complete){
        async.forEach(items, function(item, done){
            var file;

            if(item.inline !== true && (item.file || !item.ext)){ // don't write files for inline scripts
                item.out = disk.parentless(item.out);
                item.out = disk.optionExplicit(item.out, config.explicit);
                item.out = disk.binPath(item.out, config.source, config.bin);
                file = path.join(config.binAssets, item.out);
                disk.write(file, item.src, done);
            }else{
                done();
            }
        }, complete);
    }

    function processLoop(items, key, complete){
        var ctx = { key: key };

        async.series([
            async.apply(readFilesAsync, items, key),
            async.apply(pluginFramework.raise, key, 'afterReadFile', items, config, ctx),
            async.apply(pluginFramework.raise, key, 'beforeBundle', items, config, ctx),
            async.apply(pluginFramework.raise, key, 'afterBundle', items, config, ctx),
            async.apply(outputAsync, items),
            async.apply(pluginFramework.raise, key, 'afterOutput', items, config, ctx)
        ], function (err){
            complete(err, items, ctx);
        });
    }

    function compileInternal(items, key, complete){
        if(items === undefined){
            process.nextTick(complete);
            return;
        }

        processLoop(items, key, function(err, results, ctx){
            if(err){
                return complete(err);
            }

            middleware.meta.pushAsset(key, items);

            complete();
        });
    }

    return function(opts, complete){
        configure(opts.assets);

        function compile(){
            async.parallel([
                async.apply(compileInternal, config.js, 'js'),
                async.apply(compileInternal, config.css, 'css')
            ], function(err){
                if(err){
                    console.log(err);
                    throw err.stack || err;
                }

                middleware.meta.set('assets', opts.assets);
                middleware.meta.set('expires', opts.expires);
                middleware.meta.set('explicit', opts.explicit);
                middleware.meta.set('compress', opts.compress);
                middleware.meta.set('serve', opts.serve);
                middleware.meta.set('fingerprint', opts.fingerprint);
                middleware.meta.set('binAssets', config.binAssets);
                middleware.meta.serialize(config.bin, complete);
            });
        }

        if(!config.explicit){
            disk.removeSafe(config.bin, compile);
        }else{
            compile();
        }
    };
}

module.exports = {
    instance: compiler
};
