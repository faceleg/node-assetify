# node-assetify [![Build Status](https://travis-ci.org/bevacqua/node-assetify.png?branch=master)](https://travis-ci.org/bevacqua/node-assetify)

**node-assetify** is an open-source client-side asset manager for **Node.JS** web applications.

## Why node-assetify?

When I started developing on **Node.JS**, I didn't feel comfortable enough with any client-side asset manager, so I decided to roll my own.

## Setup

Fetch from **npm**

    npm install node-assetify

Server-side:

    var bin = __dirname + '/static/bin',
        assetify.publish({
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


Client-side **jade** template code:

    !=js()

You could also pass a _profile name_ to the client-side function:

    !=js('mystical')

If you don't want to include profile-specific scripts, you can do:

    !=js('mystical', false)

There are some built-in facilities to speed up your development, for instance, you can add jQuery's CDN version with a local fallback like this:

    assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js')