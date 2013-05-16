# [assetify](https://npmjs.org/package/assetify "assetify on npmjs") [![Build Status](https://travis-ci.org/bevacqua/node-assetify.png?branch=master)](https://travis-ci.org/bevacqua/node-assetify "Build Status")

**assetify** is an open-source client-side asset manager for **Node.JS** web applications.

## Why assetify?

When I started developing on **Node.JS**, I didn't feel comfortable enough with any client-side asset manager, so I decided to roll my own.

## Setup

Fetch from **npm**

    npm install assetify

Server-side:

```javascript
var bin = __dirname + '/static/bin',
    instance = assetify(),
    instance.compile({
        source: __dirname + '/static',
        bin: bin,
        js: [
            '/js/file.js',
            { profile: 'mystical', local: '/js/admin.js' }
        ]
    }, function(err){
        if(err){
            throw err;
        }
        app.use(connect.static(bin));
        app.use(instance.middleware());
    });
```

Alternatively, assetify supports Grunt. [Check out the plugin here!](https://github.com/bevacqua/grunt-assetify "grunt-assetify plugin")

Using the middleware allows **assetify** to do two things:

- Firstly, it allows **assetify** to expose the _emitter_ functions to your views. Allowing you to emit the `<script>` and `<link>` tags _without repeating yourself_.
- Second, and most importantly, it grants **assetify** access to the web server _request_ objects, letting it manage **dynamic, request-based** inclusion of assets.

"Client-side" **jade** template code:

```jade
!=assetify.js.emit()
```

You could also pass it a _profile name_ (or an array of profile names), to restrict the output to the client:

```jade
!=assetify.css.emit('mystical')
```

If you don't want to include non-profile-specific scripts, you can do:

```jade
!=assetify.css.emit('mystical', false)
```

There are some built-in facilities to speed up your development, for instance, you can add jQuery's CDN version with a local fallback like this:

```javascript
assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js')
```

## Configuration

 - **source**: the folder where your static assets are during development.
 - **bin**: the folder where the assets processed by assetify should be placed. this is the folder that should be exposed to the public.
 - **js/css**: expects an array of asset configurations.
 - **profiles**: an array of profiles to output when bundling. defaults to ['all']
 - **host**: allows you to pick a host for an absolute uri, this is prepended to asset urls.

### Asset Configurations

You could provide a string, telling assetify where the file is (relative to **source**), for example `/css/ie6-hacks.css`.
Another option is to provide an object, here you can specify `local` (which is what plain strings convert to), and `profile`, which is the name (or names, in an array) of the profile(s) you want this file to be included in. `profile` defaults to `undefined`, which means that this asset is used by every profile.

You could also just specify the raw source code, instead of giving assetify a file to look at. **Look, ma!**

    { src: 'alert("look ma, no files!");' }

Assetify will still compile this into a file, if you don't want this, or if you want a file to be inlined for some awkward reason, you can use the `inline: true` option. Note that **this will prevent bundling from happening on that asset**, so you might _prefer_ to set `inline: true` only if you're running on the _development_ environment.

Here is an example configuration module, extracted from [**NBrut**](https://github.com/bevacqua/NBrut "NBrut Node.JS Blogging Engine").

```javascript
var base = __dirname + '/static',
    assetify = require('assetify'),
    assets = {
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

You can hook into assetify through plugins. There are a few events that are raised during the assetify process.

- **afterReadFile**: Raised after, you guessed it, all files have been read from disk into memory. Useful for _pre-processing_ like **LESS** parsing.
- **beforeBundle**: Raised before files are bundled together into profiles. Useful for _actually bundling_ (which is a plugin in itself).
- **afterBundle**: Raised after files are bundled together into profiles. Useful for _minification_.
- **afterOutput**: Raised after files are copied to the final destinations. Useful for _post-processing_, like licensing comments.
- **beforeRender**: Raised on every request, before the assets are included in the locals object. Useful for hashing and fingerprinting. `ctx` will contain `http` with both the `req` and `res` objects.

To configure a plugin, you must add it **before** calling `assetify.compile`. These can be added in two ways. The simpler way is:

```javascript
assetify.use(key,eventName,plugin)
```

Another option is using an _object initializer_:

```javascript
assetify.use({
    key: 'css', // css or js
    events: [{
        eventName: 'afterReadFile',
        plugin: function(items,config,ctx,callback){
            // items is the list of assets being processed by assetify
            // config is the configuration passed to assetify.compile
            // ctx is the context of the raised plugin, currently it just contains a key indicating whether the process loop is css or js
            // callback is a function to execute after the plugin completes its job
        }
    }]
});
```

**NOTICE:** Your **beforeRender** plugins _must_ be synchronous, otherwise they won't work at all.



### Out of the box

As mentioned earlier, a `bundle` plugin is available to allow you to concatenate output for each profile, just use:

```javascript
assetify.use(assetify.plugins.bundle);
```

assetify comes with a **LESS** parsing plugin out of the box, which you can configure by invoking:

```javascript
assetify.use(assetify.plugins.less);
```

There's also a CSS minifier, wrapping around [Clean-CSS](https://github.com/GoalSmashers/clean-css "clean-css") that should prove very useful:

```javascript
assetify.use(assetify.plugins.minifyCSS);
```

Similarly, there's a JS minifier you can use (which is actually just a wrapper around [UglifyJS](https://github.com/mishoo/UglifyJS2 "UglifyJS v2")):

```javascript
assetify.use(assetify.plugins.minifyJS);
```

A typical configuration might be:

```javascript
assetify.use(assetify.plugins.less);

if (config.env.production){
    assetify.use(assetify.plugins.bundle);
    assetify.use(assetify.plugins.minifyCSS);
    assetify.use(assetify.plugins.minifyJS);
}

assetify.compile(assets, configureServer);

app.use(assetify.middleware());
```

## Dynamics

You can also dynamically emit styles or javascript directly in your views, through:

```jade
!=assetify.css.add('.test { color:#f00; }')
!=assetify.js.add('alert("foo!");')
```

Note _you can do this in server-side code as well_, by accessing `res.locals.assetify`.

These methods will register those snippets of code _on the request that invoked it_. The added benefit you get from adding scripts this way, is that assetify will act as what is commonly known as an **script manager**, which is to say: you can add these snippets anywhere on your views or before returning from a controller, but the code will still be emitted _only once_ and only when you invoke the **asset emitter**.

### Dynamics disclaimer

Keep in mind these are processed well _after static assets have been compiled_.
In order to keep it simple, only **inline assets** are allowed.
Plugins won't run on dynamic assets.

Please report any [issues](https://github.com/bevacqua/node-assetify/issues "Issue Tracker") you might find.

You can read my [**introduction to node assetify**](http://blog.ponyfoo.com/2013/01/18/asset-management-in-node "Introducing node-assetify") on my blog.