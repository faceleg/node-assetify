# node-assetify [![Build Status](https://travis-ci.org/bevacqua/node-assetify.png?branch=master)](https://travis-ci.org/bevacqua/node-assetify)

**node-assetify** is an open-source client-side asset manager for **Node.JS** web applications.

## Why node-assetify?

When I started developing on **Node.JS**, I didn't feel comfortable enough with any client-side asset manager, so I decided to roll my own.

## Setup

Fetch from **npm**

    npm install node-assetify

Server-side:

```javascript
    var bin = __dirname + '/static/bin',
        assetify.compile({
            source: __dirname + '/static',
            bin: bin,
            js: [
                '/js/file.js',
                { profile: 'mystical', local: '/js/admin.js' }
            ],
            appendTo: app.locals
        }, function(err){
            if(err){
                throw err;
            }
            app.use(connect.static(bin));
        });
```

"Client-side" **jade** template code:

```jade
    !=js()
```

You could also pass it a _profile name_, to restrict the output to the client:

```jade
    !=js('mystical')
```

If you don't want to include non-profile-specific scripts, you can do:

```jade
    !=js('mystical', false)
```

There are some built-in facilities to speed up your development, for instance, you can add jQuery's CDN version with a local fallback like this:

```javascript
    assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js')
```

## Configuration

 - **source**: the folder where your static assets are during development.
 - **bin**: the folder where the assets processed by assetify should be placed. this is the folder that should be exposed to the public.
 - **production**: whether assetify should concatenate sources, bundling them to a single physical file. defaults to `false`. common configuration: `process.env.NODE_ENV`.
 - **appendTo**: an object where the HTML tag generation functions are appended to. defaults to `global`. common configuration: `app.locals`.
 - **js/css**: expects an array of asset configurations.

### Asset Configurations

You could provide a string, telling assetify where the file is (relative to **source**), for example `/css/ie6-hacks.css`.
Another option is to provide an object, here you can specify `local` (which is what plain strings convert to), and `profile`, which is the name of the profile you want this file to be included in. `profile` defaults to `undefined`, which means that this asset is used by every profile.

Here is an example configuration module, extracted from [**NBrut**](https://github.com/bevacqua/NBrut "NBrut Node.JS Blogging Engine").

```javascript
    var base = __dirname + '/static',
        assetify = require('node-assetify'),
        assets = {
            production: config.env.production,
            source: base,
            bin: base + '/bin',
            css: [
                '/css/defaults/reset.css',
                '/css/defaults/elements.css',
                '/css/defaults/controls.css',
                '/css/defaults/layout.css',
                '/css/defaults/design.css',
                '/css/libs/markdown.css',
                '/css/libs/prettify.css',
                '/css/libs/pikaday.css',
                { profile: 'author', local: '/css/layouts/author.css' },
                '/css/views/main/entries.css',
                { profile: 'anon', local: '/css/views/user/register.css' },
                { profile: 'anon', local: '/css/views/user/login.css' },
                { profile: 'author', local: '/css/views/author/editor.css' },
                { profile: 'author', local: '/css/views/author/review.css' }
            ],
            js: [
                assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js'),
                '/js/libs/moment.min.js',
                '/js/libs/mustache.js',
                '/js/libs/jquery.textarearesizer.min.js',
                '/js/libs/Markdown.Converter.js',
                '/js/libs/Markdown.Sanitizer.js',
                '/js/libs/Markdown.Editor.js',
                '/js/libs/prettify.js',
                '/js/libs/jquery.pikaday.js',
                '/js/ext/prettify.extensions.js',
                '/js/nbrut/nbrut.extensions.js',
                '/js/nbrut/nbrut.core.js',
                '/js/nbrut/nbrut.md.js',
                '/js/nbrut/nbrut.ui.js',
                '/js/nbrut/nbrut.templates.js',
                '/js/nbrut/nbrut.thin.js',
                '/js/nbrut/nbrut.init.js',
                '/js/views/thin.hooks.js',
                '/js/views/templates.js',
                { profile: 'anon', local: '/js/views/templates.anon.js' },
                { profile: 'author', local: '/js/views/templates.author.js'},
                '/js/views/main/entries.js',
                '/js/views/main/entry.js',
                { profile: 'author', local: '/js/views/author/editor.js' },
                { profile: 'author', local: '/js/views/author/review.js' }
            ]
        };

    module.exports = assets;
```

## Plugins

You can hook into node-assetify through plugins. There are a few events that are raised during the assetify process.

- **afterReadFile**: Raised after, you guessed it, all files have been read from disk into memory. Useful for _pre-processing_ like **LESS** parsing.
- **afterBundle**: Raised after files are bundled together into profiles. Useful for _minification_.
- **afterOutput**: Raised after files are copied to the final destinations. Useful for _post-processing_, like licensing comments.

To configure a plugin, you must add it **before** calling `assetify.compile`. These can be added in two ways. The simpler way is:

```javascript
    assetify.use(key,eventName,plugin)
```

Another option is using an _object initializer_:

```javascript
    assetify.use({
        key: 'css',
        events: [{
            eventName: 'afterReadFile',
            plugin: function(items,config,callback){
                // items is the list of assets being processed by assetify
                // config is the configuration passed to assetify.compile
                // callback is a function to execute after the plugin completes its job
            }
        }]
    });
```

node-assetify comes with a LESS parsing plugin out of the box, which you can configure by invoking:

```javascript
    assetify.use(assetify.plugins.less);
```