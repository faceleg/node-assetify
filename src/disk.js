var fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path');

function copy(source, target, cb){
    var file = path.normalize(target);
    var dir = path.dirname(file);

    fse.mkdirs(dir,function(){
        fse.copy(source, file, cb);
    });
}

var api = {
    copySafe: copy
};


module.exports = api;