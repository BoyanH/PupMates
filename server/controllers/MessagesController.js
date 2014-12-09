var controllers = require('../controllers');
    auth = require('./auth.js');

module.exports = {

	createDiscussion: function (message) {

		if (auth.isAuthenticated) {

			var newDiscussion = {

				between: message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from,
				cryptoWord: '',
				messages: [
					{
						from: message.from,
						to: message.to,
						content: message.content,
						date: new Date()
					}
				]
			};
		}
	}

};