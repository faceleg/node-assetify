var extend = require('xtend'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    async = require('async'),
    disk = require('./disk.js'),
    defaults = {
        production: false,
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

    config.concat = config.production === true; // no reason this should be overwritable.
    config.minify = config.production === true; // no reason this should be overwritable.
}

function readFilesAsync(items, cb){
    async.forEach(items, function(item, callback){
        var complex = typeof item === 'object',
            normalized = complex ? item : {
                local: item
            };

        var i = items.indexOf(item);
        items[i] = normalized;

        if(normalized.local !== undefined){ // local might not exist.
            var source = path.join(config.source, normalized.local);

            fs.readFile(source, function(err, data){
                if(err){
                    throw err;
                }
                item.src = data;
                callback(err);
            });
        }
    }, cb);
}

function bundleAsync(items, cb){
    var profiles = profileNamesDistinct(sources),
        bundles = [];

    async.forEach(profiles, function(profile, callback){
        var bundle = {
            profile: profile,
            items: [],
            sources: [],
            external: []
        };

        items.forEach(function(item){
           if(item.profile === undefined || item.profile === profile){
               if(item.ext === undefined){
                   if(item.src === undefined){
                       throw new Error('item has no source nor is an external resource');
                   }
                   bundle.sources.push(item);
               }else{
                   bundle.external.push(item);
               }
           }
        });

        bundles.push(bundle);
        callback();
    }, function(err){
        if(err){
            throw err;
        }
        cb(null, bundles);
    });
}

function endCopyTasks(err, sources, targets, extension, cb){
    if(err){
        throw err;
    }
    if(config.concat === true){
        var profiles = profileNamesDistinct(sources);
        async.forEach(profiles, function(profile, callback){
            var concat = [];
            sources.forEach(function(target){
                if(target.profile === undefined || target.profile === profile){
                    if(target.ext === undefined){
                        concat.push(target.src);
                    }else{
                        if (targets.indexOf(target) === -1){ // sanity for sources without explicit profile.
                            targets.push(target);

                            var source = path.join(config.source, target.local);
                            var local = path.join(config.bin, target.local);
                            disk.copySafe(source, local);
                        }
                    }
                }
            });
            var profileName = (profile || 'all') + '.' + extension,
                bundle = path.join(config.bin, profileName),
                code = concat.join('\n');

            targets.push({
                profile: profile,
                local: profileName
            });
            disk.write(bundle, code, callback);
        }, function(err){
            if(err){
                throw err;
            }
            cb(targets);
        });
    }else{
        cb(sources);
    }
}

function concatenateAsync(bundles){
    var physical = [];
    async.forEach(bundles, function(bundle, callback){
        if(bundle.external.length){
            physical.push(bundle); // pass-through
        }else{

        }
    });
}

function normalizeAndCopyOver(items, cb, extension){
    fse.remove(config.bin, function(){
        readFilesAsync(items, function(err){
            if(err){
                throw err;
            }
            bundleAsync(items, function(err, bundles){
                if(err){
                    throw err;
                }
                concatenateAsync(bundles);
            });
            async.parallel(tasks, function(err){
                endCopyTasks(err, sources, targets, extension, cb);
            });
        });
    });
}

function profileNamesDistinct(sources){
    var names = [undefined];
    sources.forEach(function(target){
        if (names.indexOf(target.profile) === -1){
            names.push(target.profile);
        }
    });
    if(names.length > 1){ // if using profiles, don't save a common profile.
        return names.slice(1);
    }
    return names;
}

function profile(tags){
    return function(key, includeCommon){
        var results = [];
        tags.forEach(function(tag){
            if((tag.profile === undefined && includeCommon !== false) || tag.profile === key){
                results.push(tag.html);
            }
        });
        return results.join('');
    };
}

function renderTags(targets, opts){
    var tags = [];
    targets.forEach(function(target){
        var external = target.ext !== undefined,
            href = external ? target.ext : target.local;

        if(!external && href.indexOf('/') !== 0){
            href = '/' + href;
        }

        var tag = opts.render(href);
        tags.push({ html: tag, profile: target.profile });

        (opts.then || function(){})(target, tags);
    });

    return profile(tags);
}

function scriptTags(targets){
    function then(target, tags){
        if(target.ext !== undefined && target.local !== undefined){
            if(target.test === undefined){
                throw new Error('fallback test is missing');
            }
            var code = target.test + ' || document.write(unescape("%3Cscript src=\'' + target.local + '\'%3E%3C/script%3E"))';
            var fallback = '<script>' + code +  '</script>';
            tags.push({ html: fallback, profile: target.profile });
        }
    }

    return renderTags(targets, {
        render: function(href){
            return '<script src="' + href + '"></script>'
        },
        then: then
    });
}

function styleTags(targets){
    return renderTags(targets, {
        render: function(href){
            return '<link rel="stylesheet" href="' + href + '">';
        }
    })
}

function expose(key, value){
    config.appendTo[key] = value;
}

function process(sources, tag, key){
    normalizeAndCopyOver(sources, function(results){
        var tags = tag(results);

        expose(key, tags);
    }, key);
}

var api = {
    publish: function(opts){
        configure(opts);

        process(config.js, scriptTags, 'js');
        process(config.css, styleTags, 'css');

        return config.bin;
    },
    jQuery: function(version, local){
        return {
            ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery.min.js',
            local: local,
            test: 'window.jQuery'
        }
    }
};

module.exports = api;