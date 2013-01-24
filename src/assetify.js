var api = {
    compile: require('./compiler.js').compile,
    middleware: require('./middleware.js').initialize,
    use: require('./plugins/framework.js').register,
    plugins: require('./plugins/all.js'),
    jQuery: function(version, local, profile, debug){
        return {
            ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery' + (debug ? '' : '.min') + '.js',
            local: local,
            test: 'window.jQuery',
            profile: profile
        }
    }
};

require('./dynamic.js').expose();

module.exports = api;