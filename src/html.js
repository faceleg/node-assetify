function profile(tags){
    return function(key, includeCommon){
        var results = [];
        tags.forEach(function(tag){
            if((tag.profile === undefined && includeCommon !== false) || 
               (tag.profile !== undefined && tag.profile.indexOf(key) !== -1)){
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
            href = external ? item.ext : item.out;

        if(item.inline === true){
            href = undefined;
        }

        if(href !== undefined && !external && href.indexOf('/') !== 0){
            href = '/' + href;
        }

        var tag = opts.render(href, item.src);
        tags.push({ html: tag, profile: item.profile });

        (opts.then || function(){})(item, tags);
    });

    return profile(tags);
}

function scriptTags(items){
    function then(item, tags){
        if(item.ext !== undefined && item.out !== undefined){
            if(item.test === undefined){
                throw new Error('fallback test is missing');
            }
            var code = item.test + ' || document.write(unescape("%3Cscript src=\'' + item.out + '\'%3E%3C/script%3E"))';
            var fallback = '<script>' + code +  '</script>';
            tags.push({ html: fallback, profile: item.profile });
        }
    }

    return renderTags(items, {
        render: function(href, src){
            if(href !== undefined){
                return '<script src="' + href + '"></script>';
            }else if(src !== undefined){
                return '<script>' + src + '</script>';
            }else{
                console.log('WARN: inline script with undefined source omitted.');
                return '';
            }
        },
        then: then
    });
}

function styleTags(items){
    return renderTags(items, {
        render: function(href, src){
            if(href !== undefined){
                return '<link rel="stylesheet" href="' + href + '"/>';
            }else if(src !== undefined){
                return '<style>' + src + '</style>';
            }else{
                console.log('WARN: inline style with undefined source omitted.');
                return '';
            }
        }
    })
}

var api = {
    styleTags: styleTags,
    scriptTags: scriptTags
};

module.exports = api;