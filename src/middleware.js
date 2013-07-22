'use strict';

var async = require('async'),
    path = require('path');

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

    function localize(req, res, done){
        var localized = {};

        async.forEach(agnostic, function(item, next){
            var nodes = item.path.split('.'),
                lastNode = nodes.splice(nodes.length - 1, 1),
                step = localized;

            nodes.forEach(function(node){
                if(!step[node]){
                    step[node] = {};
                }
                step = step[node];
            });
            
            item.callback(req, res, function(err, result){
                if(err){
                    return next(err);
                }
                step[lastNode] = result;
                next();
            });
        }, function(err){
            done(err, localized);
        });
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
        
        if(data.serve !== false){
            if(data.fingerprint){
                var fingerprint = require('./plugins/fingerprint.js');
                pluginFramework.register(fingerprint);
            }

            roots.unshift(data.binAssets);
            roots.forEach(function(root){
                if(data.fingerprint){
                    server.use(require('static-asset')(root));
                }
                server.use(connect.static(root));
            });
        }

        server.use(function(req,res,next){
            localize(req, res, function(err, localized){
                if(err){
                    return next(err);
                }
                
                res.locals.assetify = localized;
                next();
            });
        });

        process.stdout.write('done\n');
    }

    function unwrap(data){
        data.compilation.forEach(function(hash){
            register(hash.key + '.emit', function(req, res, done){
                var ctx = {
                    key: hash.key,
                    http: { req: req, res: res }
                };

                pluginFramework.raise(hash.key, 'beforeRender', hash.items, data, ctx, function(err){
                    done(err, function(profile, includeCommon){
                        var dyn = dynamics.process(hash.key, req, res),
                            all = dyn.before.concat(hash.items).concat(dyn.after),
                            internal = html[hash.key](all, data.assets.host);

                        return internal(profile, includeCommon);
                    });
                });
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