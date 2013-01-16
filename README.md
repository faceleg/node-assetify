# node-assetify [![Build Status](https://travis-ci.org/bevacqua/node-assetify.png?branch=master)](https://travis-ci.org/bevacqua/node-assetify)

**node-assetify** is an open-source client-side asset manager for **Node.JS** web applications.

## Why node-assetify?

When I started developing on **Node.JS**, I didn't feel comfortable enough with any client-side asset manager, so I decided to roll my own.

## Setup

Fetch from **npm**

    npm install node-assetify

Server-side:

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


"Client-side" **jade** template code:

    !=js()

You could also pass it a _profile name_, to restrict the output to the client:

    !=js('mystical')

If you don't want to include non-profile-specific scripts, you can do:

    !=js('mystical', false)

There are some built-in facilities to speed up your development, for instance, you can add jQuery's CDN version with a local fallback like this:

    assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js')

## Configuration

 - **source**: the folder where your static assets are during development.
 - **bin**: the folder where the assets processed by assetify should be placed. this is the folder that should be exposed to the public.
 - **production**: whether assetify should concatenate sources, bundling them to a single physical file. defaults to `false`. common configuration: `process.env.NODE_ENV`.
 - **appendTo**: an object where the HTML tag generation functions are appended to. defaults to `global`. common configuration: `app.locals`.
 - **js/css**: expects an array of asset configurations.

### Asset Configurations

You could provide a string, telling assetify where the file is (relative to **source**), for example `/css/ie6-hacks.css`.
Another option is to provide an object, here you can specify `local` (which is what plain strings convert to), and `profile`, which is the name of the profile you want this file to be included in. `profile` defaults to `undefined`, which means that this asset is used by every profile.

## Plugins

TODO