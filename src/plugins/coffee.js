'use strict';

var path = require('path'),
    coffee = require('coffee-script'),
    parser = require('./parser.js');

module.exports = parser.configure('js',['.coffee'], function(item, config, ctx, done){
    item.src = coffee.compile(item.src);
    done();
});