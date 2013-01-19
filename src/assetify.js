var api = {
    compile: require('./compiler.js').compile,
    middleware: require('./middleware.js').initialize,
    use: require('./plugins/framework.js').register,
    plugins: require('./plugins/all.js'),
    jQuery: function(version, local, profile){
        return {
            ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery.min.js',
            local: local,
            test: 'window.jQuery',
            profile: profile
        }
    }
};

module.exports = api;