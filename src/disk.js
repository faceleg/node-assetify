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

var rback = /(\.\.[\/\\])/g;
var rexplicit = /^[a-z0-9_-]{1,8}$/i;

function parentless(relative){
    // trim ../ from relative path, avoid assets outside bin folder   
    var parentless = relative.replace(rback, '');
}

function optionExplicit(file, explicit){
    if(!explicit){
        return file;
    }
    if (explicit === true){
        explicit = 'assetify';
    }
    if(!rexplicit.test(explicit)){
        throw new Error('the explicit extension can only contain up to eight letters, numbers, and hyphens!');
    }
    var index = file.lastIndexOf('.'),
        filename = file.substr(0, index),
        extension = file.substr(index);

    return filename + '.' + explicit + extension;
}

module.exports = {
    copySafe: copy,
    write: write,
    removeSafe: remove,
    parentless: parentless
};