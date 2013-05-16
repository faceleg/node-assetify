'use strict';

var path = require('path'),
    less = require('less'),
    parser = require('./parser.js');

module.exports = parser.configure('css', ['.less'], function(item, config, ctx, done){
    var filename = path.join(config.source, item.local),
        includes = path.dirname(filename),
        compiler = new(less.Parser)({
            paths: [includes, process.cwd()],
            filename: path.basename(filename)
        });

    compiler.parse(item.src.toString(), function (err, tree) {
        if(err){
            return done(err);
        }
        try{
            item.src = tree.toCSS();
        }catch(e){
            return done(e);
        }
        done();
    });
});