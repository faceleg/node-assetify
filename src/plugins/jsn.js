var path = require('path'),
    parser = require('./parser.js');

module.exports = parser.configure('js',['.jsn'], function(item, config, ctx, done){
    parser.parse(item.src.toString(), function (err, tree) {
        if(err){
            throw err;
        }
        item.src = tree.toCSS();
        done();
    });
});