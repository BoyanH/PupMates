var googleapis = require('googleapis'),
    OAuth2Client = googleapis.auth.OAuth2;

var client = '630439673059-80a629fmhbrp1nd6t8erk2t45ld5af1v.apps.googleusercontent.com',
    secret = 'JyyPvZqTWWQBxSeeHMnfF2xF',
    redirect = 'https://www.example.com/oauth2callback',
    oauth2Client = new OAuth2Client(client, secret, redirect);


var Q = require('q');

module.exports = {

	postVideo: function (videoURI) {

		var deferred = Q.defer();

		googleapis.discover('youtube', 'v3').execute(function(err, client) {

			var metadata = {
			    snippet: { title:'title', description: 'description'}, 
			    status: { privacyStatus: 'private' }
			};

			client
			    .youtube.videos.insert({ part: 'snippet,status'}, metadata)
			    .withMedia('video/mp4', fs.readFileSync('user.flv'))
			    .withAuthClient(auth)
			    .execute(function(err, result) {
			        if (err) {

			        	deferred.reject(err);
			        };
			        
			        deferred.resolve(result);
			    });
		});
	}
}