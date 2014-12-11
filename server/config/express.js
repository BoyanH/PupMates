var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    session = require( 'express-session' ),
    passport = require('passport'),
    methodOverride = require('method-override');

module.exports = function ( app, config) {
    app.set( 'view engine', 'jade' );
    app.set( 'views', config.rootPath + '/server/views' );
    app.use( express.cookieParser('grannysbushes') );
    app.sessionStore = new express.session.MemoryStore()
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
    app.use(methodOverride());
    app.use(passport.session());
    app.use( express.static( config.rootPath + '/public' ) );
}