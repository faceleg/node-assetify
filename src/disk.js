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
var rexplicit = /^[a-z0-9_\-]{1,8}$/i;

// trim ../ from relative path, avoid assets outside bin folder
function parentless(relative){
    return relative.replace(rback, '');
}

var binComponent = null;

/**
 * Calculate difference between source and bin paths, prepend difference to file path.
 *
 * @param {String} file Public path to asset.
 * @param {String} source Source directory for core assets.
 * @param {String} bin Compile path for all assets.
 * @return {String} The modified public asset path.
 */
function binPath(file, source, bin) {
  if (source === bin) {
    return file;
  }
  if (binComponent == null) {
      var i = 0;
      while(source.charAt(i) === bin.charAt(i)){
        i++;
      }
      binComponent = bin.substring(i);
  }
  if (binComponent) {
    file = binComponent + file;
  }
  return file;
}

function optionExplicit(file, explicit){
    if(!file || !explicit){
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
    parentless: parentless,
    binPath: binPath,
    optionExplicit: optionExplicit
};
