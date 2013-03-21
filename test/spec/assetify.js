'use strict';

describe('api interface should be exposed', function(){
    var proxyquire = require('proxyquire').noCallThru(),
        map = {
            compile: {
                module: './compiler.js',
                mock: { compile: {} },
                get value(){ return this.mock.compile; }
            },
            middleware: {
                module: './middleware.js',
                mock: { initialize: {} },
                get value(){ return this.mock.initialize; }
            },
            use: {
                module: './plugins/framework.js',
                mock: { register: {} },
                get value(){ return this.mock.register; }
            },
            plugins: {
                module: './plugins/all.js',
                mock: {}
            },
            jQuery: {
                module: './jquery.js',
                mock: {}
            }
        },
        stubs = {}, assetify;

    function testCase(method){
        it('should expose interface method named ' + method, function(){
            var api = assetify[method],
                mapped = map[method];

            expect(api).toBeDefined();
            var result = mapped.value || mapped.mock;
            expect(api).toEqual(result);
        });
    }

    for(var mapping in map){
        stubs[map[mapping].module] = map[mapping].mock;
    }

    stubs['./dynamic.js'] = { expose: function(){} };
    assetify = proxyquire('../../src/assetify.js', stubs);

    for(var method in map){
        testCase(method);
    }
});