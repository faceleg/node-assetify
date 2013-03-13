var extend = require('xtend'),
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
        localized[item.key][item.prop] = item.callback(req, res);
    });

    return localized;
}

function initialize(){
    return function(req,res,next){
        res.locals.assetify = localize(req, res);
        next();
    };
}

module.exports = {
    register: register,
    initialize: initialize
};