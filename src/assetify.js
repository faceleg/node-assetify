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
}

function normalizeAndCopyOver(items, cb, extension){
    fse.remove(config.bin, function(){
        var tasks = [],
            sources = [],
            targets = [];

        items.forEach(function(item){
            var complex = typeof item === 'object',
                normalized = complex ? item : {
                    local: item
                };

            sources.push(normalized);

            if(normalized.local !== undefined){ // local might not exist.
                var source = source = path.join(config.source, normalized.local);

                if(config.concat === true){
                    if(config.ext === undefined){
                        tasks.push(function(callback){
                            fs.readFile(source, function(err, data){
                                if(err){
                                    throw err;
                                }
                                normalized.src = data;
                                callback(err, normalized);
                            });
                        });
                    }else{
                        targets.push(normalized);
                    }
                }else{
                    var target = path.join(config.bin, normalized.local);
                    tasks.push(function(callback){
                        disk.copySafe(source, target, callback);
                    });
                }
            }else{
                targets.push(normalized);
            }
        });

        async.parallel(tasks, function(err, results){
            if(err){
                throw err;
            }
            if(config.concat === true){
                var profiles = profileNamesDistinct(sources);
                async.forEach(profiles, function(profile, callback){
                    var concat = [];
                    sources.forEach(function(target){
                        if(target.profile === undefined || target.profile === profile){
                            concat.push(target.src);
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