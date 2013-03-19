'use strict';

var middleware = require('../../src/middleware.js');

describe('middleware', function(){
    it('should be defined', function(){
        expect(middleware).toBeDefined();
        expect(middleware).toEqual(jasmine.any(Object));
    });

    describe('#initialize', function(){
        it('should be exposed', function(){
            expect(middleware.initialize).toBeDefined();
            expect(middleware.initialize).toEqual(jasmine.any(Function));
        });

        it('should return a function', function(){
            expect(middleware.initialize()).toBeDefined();
            expect(middleware.initialize()).toEqual(jasmine.any(Function));
        });
    });

    describe('#register', function(){
        it('should be exposed', function(){
            expect(middleware.register).toBeDefined();
            expect(middleware.register).toEqual(jasmine.any(Function));
        });
    });
});