'use strict';

var all = require('../../../src/plugins/all.js');

describe('known plugins should be exported', function(){
    var plugins = ['bundle','less','sass','coffee','jsn','minifyCSS','minifyJS','forward','fingerprint'];

    plugins.forEach(function(plugin){
        it('should export plugin named ' + plugin, function(){
            expect(all[plugin]).toBeDefined();
        });
    });
});