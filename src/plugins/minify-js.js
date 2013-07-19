'use strict';

var async = require('async'),
    uglifyjs = require('uglify-js');

module.exports = {
    key: 'js',
    events: [{
        eventName: 'afterBundle',
        plugin: function(items, config, ctx, callback){
            async.forEach(items, function(item, done){
                var source = item.src,
                    result = uglifyjs.minify(source, {
                        fromString: true
                    });

                item.src = result.code;
                done();
            }, callback);
        }
    }]
};