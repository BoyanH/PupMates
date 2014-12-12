var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    cookieParser = require( 'cookie-parser' ),
    session = require( 'express-session' ),
    passport = require('passport');

module.exports = function ( app, config) {
    app.set( 'view engine', 'jade' );
    app.set( 'views', config.rootPath + '/server/views' );
    app.use( cookieParser('grannysbushes') );
    app.sessionStore = new session.MemoryStore()
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use( session(
        {
            store: app.sessionStore,
            secret: 'grannysbushes',
            resave: true,
            saveUninitialized: true,
            key: 'express.sid'
        }
        ) );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use( express.static( config.rootPath + '/public' ) );
}