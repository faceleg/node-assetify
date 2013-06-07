'use strict';

var proxyquire = require('proxyquire').noCallThru(),
    jquery = proxyquire('../../src/jquery.js', {});

describe('jquery', function(){
    it('should be a function', function(){
        expect(jquery).toBeDefined();
        expect(jquery).toEqual(jasmine.any(Function));
    });

    it('should return an object', function(){
        var result = jquery();
        expect(result).toBeDefined();
        expect(result).toEqual(jasmine.any(Object));
    });

    describe('test cases', function(){
        var result, file, profile;

        beforeEach(function(){
            file = '/js/lib/jquery.js';
            profile = 'foo';
            result = jquery('1.9', true, file, profile);
        });

        it('should return an object with the file property', function(){
            expect(result.file).toBeDefined();
            expect(result.file).toEqual(file);
        });

        it('should return an object with the profile property', function(){
            expect(result.profile).toBeDefined();
            expect(result.profile).toEqual(profile);
        });

        it('should return an object with the test target property', function(){
            expect(result.test).toBeDefined();
            expect(result.test).toEqual('window.jQuery');
        });

        it('should return an object with the external resource uri', function(){
            expect(result.ext).toBeDefined();
        });
    });
});