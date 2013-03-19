'use strict';

var path = require('path'),
    coffee = require('coffee-script'),
    parser = require('./parser.js');

module.exports = parser.configure('js',['.coffee'], function(item, config, ctx, done){
    var filename = path.join(config.source, item.local),
        includes = path.dirname(filename);

    item.src = coffee.compile(item.src.toString());
    done();
});