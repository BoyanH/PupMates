var Discussion = require('mongoose').model('Discussion'),
	Q = require("q");

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
					date: new Date(),
					seen: false
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
							date: new Date(),
							seen: false
						};

						collection[0].messages.push(newMessage);

						Discussion.update({between: crntBetween}, collection[0], function (err) {

							if (err) {
								console.error(err);
							}
						});
					}

			})
	},
	getMessages: function (request) {

		var crntBetween = request.from > request.to ? request.from + '_' + request.to : request.to + '_' + request.from,
			deffered = Q.defer();

		Discussion.find({between: crntBetween})
			.exec(function (err, collection) {

				if (err) {

					console.error(err);
					deffered.resolve({

						messages: [],
						err: err

					});
				}
					else {

						var messages = collection[0].messages,
							returnedMessages = [];

						if (!request.before) {

							request.before = 0;
						}

						if (!request.count) {

							request.count = 30;
						}

						if (messages.length - 1 - request.before < 0) {

							deffered.resolve({

								messages: [],
								err: err

							});

							return false;
						}

						for (var i = messages.length - 1 - request.before;
								 i > messages.length -1 - request.before - request.count; i--) {

							if (i < 0) {

								break;
							}
							
							returnedMessages.push(messages[i]); 
						};

						returnedMessages = returnedMessages.reverse();

						deffered.resolve({
							
							messages: returnedMessages,
							err: false

						});
					}

			});

		return deffered.promise;
	},
	markMessageAsSeen: function (message) {

		var crntBetween = message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from,
			deffered = Q.defer(),
			success = false;

			Discussion.find({between: crntBetween})
			.exec(function (err, collection) {

				if (err) {

					deffered.resolve({
						err: err,
						message: message
					});
				}
					else {

						var messages = collection[0].messages;

						for (var i = 0; i < messages.length; i++) {
							
							//MARK AS SEEN, SUCESSS
							if (messages[i]._id == message._id) {

								collection[0].messages[i].seen = true;
								success = true;

								break;
							}
						};

						if (success) {
							Discussion.update({between: crntBetween}, collection[0], function (err) {

								if (err) {
									
									deffered.resolve({
										err: err,
										message: collection[0].messages[i]
									});
								}
									else {

										deffered.resolve({
											err: false,
											message: collection[0].messages[i]
										});
									}
							});
						}
							else {
								
								deffered.resolve({
									err: 'NOT FOUND!',
									message: message
								});
								
							}
					}

			});

			return deffered.promise;
	}

};