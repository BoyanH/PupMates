var Q = require("q"),
	Discussion = require('mongoose').model('Discussion');

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
					seen: false,
					nth: 0
				}
			]
		};

		Discussion.create(newDiscussion, function(err, discussion){
            if(err){
                console.log('Failed to add new discussion: ' + err);
                return;
            }
        });
	},
	updateDiscussion: function (message) {

		var crntBetween = message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from,
			deffered = Q.defer();

		Discussion.findOne({between: crntBetween}, function (err, discussion) {

			if (err || !discussion) {
					
				if(!discussion) {
					module.exports.createDiscussion(message);
				}
			}
				else {

					var newMessage = {

						from: message.from,
						to: message.to,
						content: message.content,
						date: new Date(),
						seen: false,
						nth: discussion.messages.length
					};

					discussion.messages.push(newMessage);

					Discussion.update({between: crntBetween}, discussion, function (err, discussion) {

						if (err) {
							console.error('Error updating discussion: ' + err);

							deffered.reject(err);
						}

						Discussion.findOne({between: crntBetween}, function (err, discussion) {

							deffered.resolve(discussion.messages[discussion.messages.length - 1]);
						});

					});
				}
		});

		return deffered.promise;
	},
	getMessages: function (request) {

		var crntBetween = request.from > request.to ? request.from + '_' + request.to : request.to + '_' + request.from,
			deffered = Q.defer();

		Discussion.findOne({between: crntBetween}, function (err, discussion) {

			if (err || !discussion) {

				deffered.resolve({

					messages: [],
					err: 'NO MESSAGES'

				});
			}
				else {

					var messages = discussion.messages,
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
							err: 'NO MORE MESSAGES'

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

			Discussion.findOne({between: crntBetween}, function (err, discussion) {

				if (err || !discussion) {

					deffered.resolve({
						err: err,
						message: message
					});
				}
					else {

						if(discussion.messages[message.nth]) {
							if (discussion.messages[message.nth]._id == message._id) {

								success = true;
								discussion.messages[message.nth].seen = true;
							}
						}

						if (success) {
							Discussion.update({between: crntBetween}, discussion, function (err) {

								if (err) {
									
									deffered.resolve({
										err: err,
										message: discussion.messages[message.nth]
									});
								}
									else {

										deffered.resolve({
											err: false,
											message: discussion.messages[message.nth]
										});
									}
							});
						}
							else {
								
								deffered.resolve({
									err: 'NOT FOUND OR CORRUPTED!',
									message: message
								});

							}
					}

			});

			return deffered.promise;
	},
	editMessage: function (message) {

		var crntBetween = message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from,
			deffered = Q.defer(),
			success = false;

			Discussion.findOne({between: crntBetween}, function (err, discussion) {

				if (err || !discussion) {

					deffered.resolve({
						err: err,
						message: message
					});
				}
					else {

						if (discussion.messages[message.nth]._id == message._id) {

							success = true;
							discussion.messages[message.nth].content = message.content;
							discussion.messages[message.nth].edited = new Date();
						}

						if (success) {
							Discussion.update({between: crntBetween}, discussion, function (err) {

								if (err) {
									
									deffered.resolve({
										err: err,
										message: discussion.messages[message.nth]
									});
								}
									else {

										deffered.resolve({
											err: false,
											message: discussion.messages[message.nth]
										});
									}
							});
						}
							else {
								
								deffered.resolve({
									err: 'NOT FOUND OR CORRUPTED!',
									message: message
								});

							}
					}
			});

			return deffered.promise;
	}

};