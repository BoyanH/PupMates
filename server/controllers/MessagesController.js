var Discussion = require('mongoose').model('Discussion');

module.exports = {

	createDiscussion: function (message) {

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

		Discussion.find({})
    	.exec(function (err, collection) {

    		console.log(collection);
    	})

		Discussion.create(newDiscussion, function(err, discussion){
            if(err){
                console.log('Failed to add new discussion: ' + err);
                return;
            }
        });
	},
	updateDiscussion: function (message) {

		var crntBetween = message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from;

		Discussion.find({between: crntBetween})
			.exec(function (err, collection) {

				if (err) {

					console.error(err);
					this.createDiscussion(message);
				}
					else {

						var newMessage = {

							from: message.from,
							to: message.to,
							content: message.content,
							date: new Date()
						};

						collection[0].messages.push(newMessage);

						Discussion.update({between: crntBetween}, collection[0], function (err) {

							if (err) {
								console.error(err);
							}
						});
					}

			})
	}

};