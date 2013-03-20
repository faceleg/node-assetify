'use strict';

var extend = require('xtend'),
    agnostic = [];

function register(path, cb){
    if(typeof path !== 'string'){
        throw new TypeError('path must be set. e.g: "js.emit"');
    }
    if(typeof cb !== 'function'){
        throw new TypeError('you must provide a callback function');
    }

    agnostic.push({
        path: path,
        callback: cb
    });
}

function localize(req, res){
    var localized = {};

    agnostic.forEach(function(item){
        var nodes = item.path.split('.'),
            lastNode = nodes.splice(nodes.length - 1, 1),
            step = localized;

        nodes.forEach(function(node){
            if (step[node] === undefined){
                step[node] = {};
            }
            step = step[node];
        });
        step[lastNode] = item.callback(req, res);
    });

    return localized;
}

function initialize(){
    return function(req,res,next){
        res.locals.assetify = localize(req, res);
        next();
    };
}

function clear(){
    agnostic = [];
}

module.exports = {
    _clear: clear,
    get _length(){ return agnostic.length; },
    register: register,
    initialize: initialize
};