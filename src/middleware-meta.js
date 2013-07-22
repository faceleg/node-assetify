'use strict';

module.exports = function(){
    var path = require('path'),
        fs = require('fs'),
        disk = require('./disk.js'),
        data = {
            compilation: []
        };

    function serialize(bin, done){
        var file = path.join(bin, 'assetify.json');

        if (data.expires){
            data.expires = data.expires.toString();
        }

        diet(data);

        var json = JSON.stringify(data, null, 2);

        disk.write(file, json, done);
    }
    
    function diet(data){
        // these also appear in the compilation array.
        delete data.assets.js;
        delete data.assets.css;

        // non-inline scripts don't need their sources anymore
        data.compilation.forEach(function(type){
            type.items.forEach(function(item){
                if(!item.inline && !item.ext){
                    delete item.src;
                    delete item.sources;
                }
            });
        });
    }

    function deserialize(bin){        
        var file = path.join(bin, 'assetify.json'),
            json = fs.readFileSync(file, 'utf8'),
            data = JSON.parse(json);

        if (data.expires){
            data.expires = new RegExp(data.expires);
        }
        return data;
    }

    function pushAsset(key, items){
        data.compilation.push({
            key: key, items: items
        });
    }

    function set(key, value){
        data[key] = value;
    }

    return {
        pushAsset: pushAsset,
        set: set,
        serialize: serialize,
        deserialize: deserialize
    };
};