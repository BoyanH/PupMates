var crypto = require('crypto');		//takes the module crypto from nodejs
module.exports = {
    generateSalt: function () {		//function which generate salt - a random 128 long string
        return crypto.randomBytes( 128 ).toString( 'base64' );
    },
    generateHashedPassword: function ( salt, pwd ) {	//function which generates the password
        var hmac = crypto.createHmac( 'sha1', salt );	//forms the password so that SHA-1 process the real password with the salt
        return hmac.update( pwd ).digest( 'hex' );
    }
}