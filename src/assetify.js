var extend = require('xtend'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    disk = require('./disk.js'),
    defaults = {
        development: process.env.NODE_ENV === 'development',
        appendTo: global,
        js: []
    },
    config; // module configuration options

function configure(opts){
    if(config !== undefined){
        throw new Error('assetify can only be configured once.');
    }

    config = extend(defaults, opts);

    if(config.in === undefined){
        throw new Error("opts.in must be defined as the folder where your assets are");
    }
    if(config.out === undefined){
        throw new Error("opts.out must be defined as the folder where processed assets will be stored");
    }
    if(config.in === config.out){
        throw new Error("opts.in can't be the same as opts.out");
    }
}

function output(items, cb){
    fse.remove(config.out, function(){
        var targets = [];

        items.forEach(function(item){
            var complex = typeof item === 'object',
                source = complex ? item.local : item;

            targets.push(item);

            if(source !== undefined){ // local might not exist.
                target = path.join(config.out, source);
                disk.copySafe(path.join(config.in, source), target);
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

function scriptTags(targets){
    var tags = [];
    targets.forEach(function(target){
        var complex = typeof target === 'object',
            source = complex ? target.ext : target;

        if(!complex && source.indexOf('/') !== 0){
            source = '/' + source;
        }

        var tag = '<script src="' + source + '"></script>';
        tags.push({ html: tag, profile: target.profile });

        if(complex && target.local !== undefined){
            if(target.test === undefined){
                throw new Error('fallback test is missing');
            }
            var code = target.test + ' || document.write(unescape("%3Cscript src=\'' + target.local + '\'%3E%3C/script%3E"))';
            var fallback = '<script>' + code +  '</script>';
            tags.push({ html: fallback, profile: target.profile });
        }
    });

    return profile(tags);
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

        return config.out;
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