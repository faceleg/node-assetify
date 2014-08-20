'use strict';

var path = require('path'),
    jsn = require('jsn'),
    parser = require('assetify-parser');

module.exports = parser.configure('js',['.jsn'], function(item, config, ctx, done){
    jsn.parse(item.src, item.context, function (err, js) {
        if(err){
            return done(err);
        }
        item.src = js;
        done();
    });
});
