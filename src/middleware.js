'use strict';

function middleware(){
    var agnostic = [];

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

    function clear(){
        agnostic = [];
    }

    function expiresHeader(opts){
        return function(req,res,next){
            if (req.url === '/favicon.ico' || (opts.expires && opts.expires.test(req.url))) {
                res.setHeader('Cache-Control', 'public, max-age=31535650');
                res.setHeader('Expires', new Date(Date.now() + 31535650000).toUTCString());
            }
            return next();
        };
    }

    function instance(server, connect, opts){
        if(opts.compress){
            server.use(connect.compress());
        }

        server.use(expiresHeader(opts));

        if(opts.assets.favicon){
            server.use(connect.favicon(opts.assets.favicon));    
        }
        
        var roots = opts.assets.roots || [];
        roots.unshift(opts.assets.bin);
        roots.forEach(function(root){
            if(opts.fingerprint){
                server.use(require('static-asset')(root));
            }
            server.use(connect.static(root));
        });

        server.use(function(req,res,next){
            res.locals.assetify = localize(req, res);
            next();
        });
    }

    return {
        _clear: clear,
        get _length(){ return agnostic.length; },
        register: register,
        instance: instance
    };
}

module.exports = {
    instance: middleware
};