var path = require('path'),
    less = require('less');

function replaceAt(text, index, length, replacement) {
    return text.substr(0, index) + replacement + text.substr(index + length);
}

var api = {
    less: {
        key: 'css',
        events: [{
            eventName: 'afterReadFile',
            plugin: function(items){
                items.forEach(function(item){
                    var ext = '.less';
                    if(path.extname(item.path) === ext){
                        var i = item.path.lastIndexOf(ext);

                        item.path = replaceAt(item.path, i, ext.length, '.css');

                        less.render(item.src, function (err, css) {
                            if(err){
                                throw err;
                            }
                            item.src = css;
                            console.log(item.src);
                        });
                    }
                });
            }
        }]
    }
};

module.exports = api;