'use strict';

module.exports = {
    instance: function(){
        var pluginFramework = require('./plugins/framework.js').instance(),
            dynamics = require('./dynamic.js').instance(),
            middleware = require('./middleware.js').instance(pluginFramework, dynamics),
            api = {
                compile: require('./compiler.js').instance(middleware, pluginFramework, dynamics),
                use: pluginFramework.register,
                middleware: middleware.expose,
                plugins: require('./plugins/all.js'),
                jQuery: require('./jquery.js')
            },
            configure = middleware.configure;

        for(var key in api){
            configure[key] = api[key];
        }

        dynamics.expose(middleware);

        return configure;
    }
};