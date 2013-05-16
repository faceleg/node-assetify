'use strict';

module.exports = {
    instance: function(){
        var middleware = require('./middleware.js').instance(),
            pluginFramework = require('./plugins/framework.js').instance(),
            dynamics = require('./dynamic.js').instance(middleware),
            api = {
                compile: require('./compiler.js').instance(middleware, pluginFramework, dynamics),
                middleware: middleware.initialize,
                use: pluginFramework.register,
                plugins: require('./plugins/all.js'),
                jQuery: require('./jquery.js')
            };

        dynamics.expose();

        return api;
    }
};