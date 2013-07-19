'use strict';

module.exports = {
    instance: function(){
        var middleware = require('./middleware.js').instance(),
            pluginFramework = require('./plugins/framework.js').instance(),
            dynamics = require('./dynamic.js').instance(middleware),
            api = {
                compile: require('./compiler.js').instance(middleware, pluginFramework, dynamics),
                use: pluginFramework.register,
                plugins: require('./plugins/all.js'),
                jQuery: require('./jquery.js')
            },
            fn = middleware.instance;

        for(var key in api){
            fn[key] = api[key];
        }

        dynamics.expose();

        return fn;
    }
};