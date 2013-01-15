var extend = require('xtend'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    disk = require('./disk.js'),
    defaults = {
        development: process.env.NODE_ENV === 'development',
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

function output(items, cb){
    fse.remove(config.bin, function(){
        var targets = [];

        items.forEach(function(item){
            var complex = typeof item === 'object',
                normalized = complex ? item : {
                    local: item
                };

            targets.push(normalized);

            if(normalized.local !== undefined){ // local might not exist.
                target = path.join(config.bin, normalized.local);
                disk.copySafe(path.join(config.source, normalized.local), target);
            }
        });

        cb(targets);
    });
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

var api = {
    publish: function(opts){
        configure(opts);

        output(config.js, function(js){
            var jsTags = scriptTags(js);

            expose('js', jsTags);
        });

        output(config.css, function(css){
            var cssTags = styleTags(css);

            expose('css', cssTags);
        });

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