'use strict';

var async = require('async'),
    cleanCss = require('clean-css');

module.exports = {
    key: 'css',
    events: [{
        eventName: 'afterBundle',
        plugin: function(items, config, ctx, callback){
            async.forEach(items, function(item, done){
                var source = item.src;
                item.src = cleanCss.process(source);
                done();
            }, callback);
        }
    }]
};