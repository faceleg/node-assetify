var fs = require('fs');

function copy(source,target){
    fs.createReadStream(source).pipe(fs.createWriteStream(target));
}

var api = {
    copy: copy
};

module.exports = api;