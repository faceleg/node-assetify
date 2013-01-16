module.exports = {
    events: [{
        eventName: 'beforeBundle',
        plugin: function(items, config, callback){
            callback();
        }
    }]
};