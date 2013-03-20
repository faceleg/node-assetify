'use strict';

describe('known plugins should be exported', function(){
    var proxyquire = require('proxyquire').noCallThru(),
        plugins = ['bundle','less','sass','coffee','jsn','minifyCSS','minifyJS','forward','fingerprint'],
        stubs = {}, all;

    plugins.forEach(function(plugin){
        stubs['./' + plugin + '.js'] = {};
    });

    all = proxyquire('../../../src/plugins/all.js', stubs);

    plugins.forEach(function(plugin){
        it('should export plugin named ' + plugin, function(){
            expect(all[plugin]).toBeDefined();
        });
    });
});