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

function renderTags(items, opts){
    var tags = [];
    items.forEach(function(item){
        var external = item.ext !== undefined,
            href = external ? item.ext : item.local;

        if(!external && href.indexOf('/') !== 0){
            href = '/' + href;
        }

        var tag = opts.render(href);
        tags.push({ html: tag, profile: item.profile });

        (opts.then || function(){})(item, tags);
    });

    return profile(tags);
}

function scriptTags(items){
    function then(item, tags){
        if(item.ext !== undefined && item.local !== undefined){
            if(item.test === undefined){
                throw new Error('fallback test is missing');
            }
            var code = item.test + ' || document.write(unescape("%3Cscript src=\'' + item.local + '\'%3E%3C/script%3E"))';
            var fallback = '<script>' + code +  '</script>';
            tags.push({ html: fallback, profile: item.profile });
        }
    }

    return renderTags(items, {
        render: function(href){
            return '<script src="' + href + '"></script>'
        },
        then: then
    });
}

function styleTags(items){
    return renderTags(items, {
        render: function(href){
            return '<link rel="stylesheet" href="' + href + '">';
        }
    })
}

var api = {
    styleTags: styleTags,
    scriptTags: scriptTags
};

module.exports = api;