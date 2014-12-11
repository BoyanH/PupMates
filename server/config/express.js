var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    session = require( 'express-session' ),
    passport = require('passport'),
    methodOverride = require('method-override');

module.exports = function ( app, config, sessionStore,  myCookieParser) {
    app.set( 'view engine', 'jade' );
    app.set( 'views', config.rootPath + '/server/views' );
    app.use( myCookieParser );
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use( session(
        {
            store: sessionStore,
            secret: 'grannysbushes',
            resave: true,
            saveUninitialized: true,
            key: 'express.sid'
        }
        ) );
    app.use(passport.initialize());
    app.use(methodOverride());
    app.use(passport.session());
    app.use( express.static( config.rootPath + '/public' ) );
}