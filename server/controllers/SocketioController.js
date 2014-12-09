var clientsList = {};

module.exports = {

	askForIdentification: function (socket) {

		socket.emit('who are you');
	},
	addUserConnection: function (socket, incoming) {

        clientsList[incoming.userId] = socket;
        
        socket.emit('registered');
	},
	sendMessage: function (socket, message) {

		clientsList[data.to].emit('new message', {

			from: message.from,
			content: message.content,
			to: message.to
		})
	}
}