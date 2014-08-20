'use strict';

var path = require('path'),
    coffee = require('coffee-script'),
    parser = require('assetify-parser');

module.exports = parser.configure('js',['.coffee'], function(item, config, ctx, done){
    item.src = coffee.compile(item.src);
    done();
});
