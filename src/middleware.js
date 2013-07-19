'use strict';

var path = require('path');

function middleware(pluginFramework, dynamics){
    var meta = require('./middleware-meta.js')(),
        agnostic = [],
        html = require('./html.js');

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

    function expiresHeader(data){
        return function(req,res,next){
            var favicon = data.assets.favicon && req.url === '/favicon.ico';
            if (favicon || data.expires.test(req.url)){
                res.setHeader('Cache-Control', 'public, max-age=31535650');
                res.setHeader('Expires', new Date(Date.now() + 31535650000).toUTCString());
            }

            next();
        };
    }

    function configure(server, connect, bin){
        var data = meta.deserialize(bin),
            assets = path.join(bin, 'assets'),
            roots = data.assets.roots || [];

        process.stdout.write('Registering assets with middleware...');

        unwrap(data);

        if(data.compress){
            server.use(connect.compress());
        }

        if(data.expires){
            server.use(expiresHeader(data));
        }        

        if(data.assets.favicon){
            server.use(connect.favicon(data.assets.favicon));    
        }
        
        roots.unshift(assets);
        roots.forEach(function(root){
            if(data.fingerprint){
                server.use(require('static-asset')(root));
            }
            server.use(connect.static(root));
        });

        server.use(function(req,res,next){
            res.locals.assetify = localize(req, res);
            next();
        });

        process.stdout.write('done\n');
    }

    function unwrap(data){
        // TODO re-register plugins. ALL? just fingerprint? just beforeRender plugins? how?..

        data.compilation.forEach(function(hash){
            register(hash.key + '.emit', function(req, res){
                var ctx = {
                    http: { req: req, res: res }
                };

                // NOTE: beforeRender plugins _must_ be synchronous
                // in order to make an impact on the request object
                pluginFramework.raise(hash.key, 'beforeRender', hash.items, data, ctx, function(){});

                return function(profile, includeCommon){
                    var dyn = dynamics.process(hash.key, req, res),
                        all = dyn.before.concat(hash.items).concat(dyn.after),
                        internal = html[hash.key](all, data.assets.host);

                    return internal(profile, includeCommon);
                };
            });
        });
    }

    return {
        _clear: clear,
        get _length(){ return agnostic.length; },
        register: register,
        configure: configure,
        meta: meta
    };
}

module.exports = {
    instance: middleware
};