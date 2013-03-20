'use strict';

var middleware = require('../../src/middleware.js');

describe('middleware', function(){
    beforeEach(function(){
        middleware._clear();
    });

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
            var mw = middleware.initialize();

            expect(mw).toBeDefined();
            expect(mw).toEqual(jasmine.any(Function));
            expect(mw.length).toEqual(3); // req,res,next
        });

        it('should set up a assetify locals object', function(){
            var done = jasmine.createSpy('done'),
                res = { locals: {} },
                mw = middleware.initialize();

            mw({}, res, done);
            expect(res.locals.assetify).toBeDefined();
            expect(res.locals.assetify).toEqual(jasmine.any(Object));
            expect(done).toHaveBeenCalled();
        });
    });

    describe('#register', function(){
        it('should be exposed', function(){
            expect(middleware.register).toBeDefined();
            expect(middleware.register).toEqual(jasmine.any(Function));
        });

        it('should throw with guard clauses', function(){
            expect(function(){
                middleware.register();
            }).toThrow();

            expect(function(){
                middleware.register('path.to.method');
            }).toThrow();

            expect(function(){
                middleware.register('path.to.method', function(){});
            }).not.toThrow();
        });

        it('should be able to register hooks', function(){
            expect(middleware._length).toEqual(0);
            middleware.register('path.to.method', function(){});
            expect(middleware._length).toEqual(1);
        });
    });

    describe('as a whole', function(){
        it('should invoke registered callbacks with request parameters', function(){
            var spy = jasmine.createSpy('spy'),
                req = {},
                res = { locals: {} },
                mw = middleware.initialize();

            middleware.register('path.to.method', spy);
            mw(req, res, function(){
                expect(spy).toHaveBeenCalledWith(req, res);
            });
        });
    });
});