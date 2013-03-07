var extend = require('xtend'),
    sync = require('sync'),
    agnostic = [];

function register(key, prop, cb){
    agnostic.push({
        key: key,
        prop: prop,
        callback: cb
    });
}

function localize(req, res){
    var localized = {};

    agnostic.forEach(function(item){
        if (localized[item.key] === undefined){
            localized[item.key] = {};
        }
        localized[item.key][item.prop] = item.callback.sync(null, req, res);
    });

    return localized;
}

function initialize(){
    return function(req,res,next){
        sync(function(){
            return localize(req, res);
        },function(err, localized){
            res.locals.assetify = localized;
            next();
        });
    }
}

module.exports = {
    register: register,
    initialize: initialize
};