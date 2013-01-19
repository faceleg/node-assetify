var extend = require('xtend'),
    agnostic = [];

function register(key, cb){
    agnostic.push({
        key: key,
        callback: cb
    });
}

function localize(req){
    var locals = {};

    agnostic.forEach(function(item){
        locals[item.key] = item.callback(req);
    });
    return locals;
}

function initialize(){
    return function(req,res,next){
        res.locals.assetify = localize(req);
        next();
    }
}

module.exports = {
    register: register,
    initialize: initialize
};