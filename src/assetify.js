var extend = require('xtend'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    disk = require('./disk.js'),
    html = require('./html.js'),
    pluginFramework = require('./plugins/framework.js'),
    defaults = {
        bundle: false,
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

function bundleAsync(items, key, cb){
    if(config.bundle === false){
        return cb(null); // leave as-is.
    }
    var profiles = profileNamesDistinct(items),
        bundles = [];

    return async.forEach(profiles, function(profile, done){
        var filename = profile + '.' + key,
            bundle = {
                profile: profile,
                local: filename,
                out: filename,
                path: path.join(config.bin, filename),
                sources: []
            };

        items.forEach(function(item){
            if(item.profile === undefined || item.profile === profile){
                if(item.ext === undefined){
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
        cb(null);
    });
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

function readBundleAndOutput(items, key, cb){
    fse.remove(config.bin, function(){
        readFilesAsync(items, function(err){
            if(err){
                throw err;
            }

            pluginFramework.raise(key, 'afterReadFile', items, config, bundle);

            function bundle(err){
                if(err){
                    throw err;
                }
                bundleAsync(items, key, function(err){
                    if(err){
                        throw err;
                    }
                    pluginFramework.raise(key, 'afterBundle', items, config, copy);
                });
            }

            function copy(err){
                if(err){
                    throw err;
                }
                outputAsync(items, function(err){
                    if(err){
                        throw err;
                    }
                    pluginFramework.raise(key, 'afterOutput', items, config, done);
                });
            }

            function done(err){
                if(err){
                    throw err;
                }
                cb(items);
            }
        });
    });
}

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

function process(items, key, tag, done){
    readBundleAndOutput(items, key, function(results){
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