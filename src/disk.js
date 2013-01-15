var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

function copy(source,target){
    var file = path.normalize(target);
    var dir = path.dirname(file);

    mkdirp(dir,function(){
        fs.createReadStream(source).pipe(fs.createWriteStream(file));
    });
}

var api = {
    copy: copy
};

module.exports = api;