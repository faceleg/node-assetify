'use strict';

var api = {
    compile: require('./compiler.js').compile,
    middleware: require('./middleware.js').initialize,
    use: require('./plugins/framework.js').register,
    plugins: require('./plugins/all.js'),
    jQuery: require('./jquery.js')
};

require('./dynamic.js').expose();

module.exports = api;