var googleapis = require('googleapis'),
    OAuth2Client = googleapis.auth.OAuth2;

var client = '630439673059-80a629fmhbrp1nd6t8erk2t45ld5af1v.apps.googleusercontent.com',
    secret = 'JyyPvZqTWWQBxSeeHMnfF2xF',
    redirect = 'https://www.example.com/oauth2callback',
    oauth2Client = new OAuth2Client(client, secret, redirect);


var Q = require('q');

module.exports = {

    postVideo: function(videoURI, tokens) {

        var deferred = Q.defer();
        
        var google = require('googleapis');

        var jwtClient = new google.auth.JWT(
			'630439673059-n9nm4d057vohm0f57mf8l84fd9jtkr3t@developer.gserviceaccount.com',
			'./server/googleToken/key.pem',
			null,
			['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.upload'],
			null
		);

		jwtClient.authorize(function(err, tokens) {
			if (err) {
				console.log(err);
				return;
			}

			google.youtube({version: 'v3', auth: jwtClient }).videos.insert({
				part: 'status,snippet',
				resource: {
				    snippet: {
				        title: 'title',
				        description: 'description'
				    },
				    status: { 
				        privacyStatus: 'private' //if you want the video to be private
				    }
				},
				media: {
					mimeType: 'video/mp4',
				    body: videoURI
				}
				}, function(error, data){
				if(error){
				    
				    deferred.reject(error);
				} else {
					deferred.resolve(data);
				}
			});
		});

        return deferred.promise;
    }
}