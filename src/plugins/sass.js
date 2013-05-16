'use strict';

var path = require('path'),
    sass = require('sass'),
    parser = require('./parser.js');

module.exports = parser.configure('css',['.sass','.scss'], function(item, config, ctx, done){
    var filename = path.join(config.source, item.local),
        includes = path.dirname(filename);

    sass.render(item.src.toString(), function (err, css) {
        if(err){
            return done(err);
        }
        item.src = css;
        done();
    }, { include_paths: [includes, process.cwd()] });
});