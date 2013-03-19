'use strict';

var fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path');

function copy(source, target, cb){
    var file = path.normalize(target);
    var dir = path.dirname(file);

    fse.mkdirs(dir,function(err){
        if(err){
            throw err;
        }
        fse.copy(source, file, cb);
    });
}

function write(filename, data, cb){
    var file = path.normalize(filename);
    var dir = path.dirname(file);

    fse.mkdirs(dir,function(err){
        if(err){
            throw err;
        }
        fs.writeFile(filename, data, cb);
    });
}

function remove(path, cb){
    fse.remove(path, function(err){
        cb();
    });
}

var api = {
    copySafe: copy,
    write: write,
    removeSafe: remove
};


module.exports = api;