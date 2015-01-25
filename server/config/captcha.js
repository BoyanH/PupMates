_getAudio = function( req, res, next ) {
    var visualCaptcha;

    // Default file type is mp3, but we need to support ogg as well
    if ( req.params.type !== 'ogg' ) {
        req.params.type = 'mp3';
    }

    // Initialize visualCaptcha
    visualCaptcha = require( 'visualcaptcha' )( req.session, req.query.namespace );

    visualCaptcha.streamAudio( res, req.params.type );
};

// Fetches and streams an image file
_getImage = function( req, res, next ) {
    var visualCaptcha,
        isRetina = false;

    // Initialize visualCaptcha
    visualCaptcha = require( 'visualcaptcha' )( req.session, req.query.namespace );

    // Default is non-retina
    if ( req.query.retina ) {
        isRetina = true;
    }

    visualCaptcha.streamImage( req.params.index, res, isRetina );
};

// Start and refresh captcha options
_startRoute = function( req, res, next ) {
    var visualCaptcha;

    // Initialize visualCaptcha
    visualCaptcha = require( 'visualcaptcha' )( req.session, req.query.namespace );

    visualCaptcha.generate( req.params.howmany );

    // We have to send the frontend data to use on POST.
    res.status( 200 ).send( visualCaptcha.getFrontendData() );
};

// Try to validate the captcha
// We need to make sure we generate new options after trying to validate, to avoid abuse
_trySubmission = function( req, res, next ) {
    var visualCaptcha,
        namespace = req.query.namespace,
        frontendData,
        queryParams = [],
        imageAnswer,
        audioAnswer,
        responseStatus,
        responseObject;

    // Initialize visualCaptcha
    visualCaptcha = require( 'visualcaptcha' )( req.session, req.query.namespace );

    frontendData = visualCaptcha.getFrontendData();

    // Add namespace to query params, if present
    if ( namespace && namespace.length !== 0 ) {
        queryParams.push( 'namespace=' + namespace );
    }

    // It's not impossible this method is called before visualCaptcha is initialized, so we have to send a 404
    if ( typeof frontendData === 'undefined' ) {
        queryParams.push( 'status=noCaptcha' );

        responseStatus = 404;
        responseObject = 'Not Found';
    } else {
        // If an image field name was submitted, try to validate it
        if ( ( imageAnswer = req.body[ frontendData.imageFieldName ] ) ) {
            if ( visualCaptcha.validateImage( imageAnswer ) ) {
                queryParams.push( 'status=validImage' );

                responseStatus = 200;
            } else {
                queryParams.push( 'status=failedImage' );

                responseStatus = 403;
            }
        } else if ( ( audioAnswer = req.body[ frontendData.audioFieldName ] ) ) {
            // We set lowercase to allow case-insensitivity, but it's actually optional
            if ( visualCaptcha.validateAudio( audioAnswer.toLowerCase() ) ) {
                queryParams.push( 'status=validAudio' );

                responseStatus = 200;
            } else {
                queryParams.push( 'status=failedAudio' );

                responseStatus = 403;
            }
        } else {
            queryParams.push( 'status=failedPost' );

            responseStatus = 500;
        }
    }

    if ( req.accepts( 'html' ) !== undefined ) {
        res.redirect( '/?' + queryParams.join( '&' ) );
    } else {
        res.status( responseStatus );

        if(responseStatus == 200) {

            res.next();
        }
    }
};

module.exports = {

	getAudio: _getAudio,
	getImage: _getImage,
	startRoute: _startRoute,
	trySubmission: _trySubmission
};