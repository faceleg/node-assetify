var api = {
    less: {
        key: 'css',
        events: [{
            eventName: 'afterReadFile',
            plugin: function(items){
                items.forEach(function(item){
                    if(path.extname(item.local) === '.less'){
                        console.log(item);
                    }
                });
            }
        }]
    }
};

module.exports = api;