var path = require('path'),
    less = require('less'),
    parser = require('./parser');

module.exports = parser.configure('css',['.less'], function(item, config, ctx, done){
    var filename = path.join(config.source, item.local),
        includes = path.dirname(filename),
        parser = new(less.Parser)({
            paths: [includes],
            filename: path.basename(filename)
        });

    parser.parse(item.src.toString(), function (err, tree) {
        if(err){
            throw err;
        }
        item.src = tree.toCSS();
        done();
    });
});