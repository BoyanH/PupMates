var Q = require("q"),
	Discussion = require('mongoose').model('Discussion');

module.exports = {

	//As this controller is meant to work with the Socket.io client and not using XML HTTP Request
	//every function return a promise, to which the socket.io ties some waiting code
	//so whenever this functions are executed, the socket.io system can notify the user using
	//the same open connection (Web Socket) [can't be done using normal server responses as there is no actual request]

	createDiscussion: function (message) {

		//create new discussion the way its defined in the Discussion Model
		//no need for further checks, client is escaping html on appending, server is verifying data type
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

		//create the discussion defined above
		Discussion.create(newDiscussion, function(err, discussion){
            if(err){
                console.log('Failed to add new discussion: ' + err);
                return;
            }
        });
	},
	updateDiscussion: function (message) {

		//Concatenate the '_id's of both user the same way its done on Discussion creation, 
		//sorted alphabetically, concatenated with '_'

		var crntBetween = message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from,
			deffered = Q.defer();

		//Find the common discussion by the concatenated string from the '_id's
		Discussion.findOne({between: crntBetween}, function (err, discussion) {

			if (err || !discussion) {
					
				if(!discussion) {

					//If no discussion is found, this message is the 1 one, a new discussion must be created
					module.exports.createDiscussion(message);
				}
			}
				else {

					discussion = discussion.toObject();

					//declare the message the way it should be according to the Discussion.js Model
					var newMessage = {

						from: message.from,
						to: message.to,
						content: message.content,
						date: new Date(),
						seen: false,
						nth: discussion.messages.length
					};

					//push it in the messages of the found discussion
					discussion.messages.push(newMessage);


					//save all changes to the found Discussion
					Discussion.update({between: crntBetween}, discussion, function (err, discussion) {

						if (err) {
							console.error('Error updating discussion: ' + err);

							deffered.reject(err);
						}

						Discussion.findOne({between: crntBetween}, function (err, discussion) {

							//the message is sent back to the SocketioController and there sent to the
							//recipient together with the very important message.id, which is only assigned after save
							deffered.resolve(discussion.messages[discussion.messages.length - 1]);
						});

					});
				}
		});

		return deffered.promise; //return the promise to the SocketIoController
	},
	getMessages: function (request) {

		//Find the discussion in a similar to the above manner

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
						
						//As we are getting only part of the Discussion we cannot make a request to Mongo
						//with 'limit' and 'after', therefore we manually push the preferred amount to a separate
						//array, which will then be sent back to the user

						returnedMessages.push(messages[i]); 
					};

					//As on push the order is reversed, we reverse the array to get back the chronological order
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

			if( isNaN(message.nth) ) {

				res.status(403).end();
				return;
			}

			//Find the discussion in a similar manner
			Discussion.findOne({between: crntBetween}, function (err, discussion) {

				if (err || !discussion) {

					deffered.resolve({
						err: err,
						message: message
					});
				}
				else if(discussion.messages.length <= message.nth) {

					res.status(403).end();
				}
					else {

						discussion = discussion.toObject();

						//If the requested message exists [messages in the Discussion Schema are indexed (the nth property)]
						if(discussion.messages[message.nth]) {
							if (discussion.messages[message.nth]._id == message._id) {

								success = true;	//the message is found
								discussion.messages[message.nth].seen = true; //mark it as seen
							}
						}

						//if message is found (^declared above)
						if (success) {

							//save changes to the discussion
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
								
								//notify user that the message is not found
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

		//Works similary to the above function, only changes the messages content instead of seen property
		// and also adds the current date to the edited property so the user knows when a message was edited


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

						discussion = discussion.toObject();

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
	},
	getUsersDiscussions: function(req, res) {

		//Find a Discussion by user _id property
		//Works in a same manner like the other functions, but here the arguments are
		//request and resolve, because this function is called from a normal XML HTTP Request and not
		//via the Web Socket system

		function whereFunction(userID) {

			return this.between.split('_').indexOf(userID) > -1
		}

		var stringifiedWhere = whereFunction + '',
            addPos = stringifiedWhere.indexOf('() {') + 5,
            addElement = 'var userID = ' + req.user._id + ';';

        stringifiedWhere = [stringifiedWhere.slice(0, addPos), addElement, stringifiedWhere.slice(addPos)].join('');

		Discussion.find({where: stringifiedWhere}, function (err, collection) {

			if (err || !collection) {

				console.log('No discussions found!');
				return;
			}

			res.send(collection);
		})
	}

};