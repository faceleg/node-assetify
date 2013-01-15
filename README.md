# node-assetify [![Build Status](https://travis-ci.org/bevacqua/node-assetify.png?branch=master)](https://travis-ci.org/bevacqua/node-assetify)

**node-assetify** is an open-source client-side asset manager for **Node.JS** web applications.

## Why node-assetify?

When I started developing on **Node.JS**, I didn't feel comfortable enough with any client-side asset manager, so I decided to roll my own. This is the result of that endeavor.

Installation:

    npm install node-assetify

Server-side:

    var assets = assetify.publish({
        in: __dirname + '/static',
        out: __dirname + '/static/out'
        js: [
            '/js/file.js',
            { profile: 'mystical', local: '/js/admin.js' }
        ],
        appendTo: app.locals
    });

    app.use(connect.static(assets)); // assets == opts.out

Client-side:

    !=js()

You could also pass a profile to the client-side function:

    !=js('mystical')

If you don't want to include profile-less scripts, you can do:

    !=js('mystical', false)