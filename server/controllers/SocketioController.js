var clientsList = {};

module.exports = {

	askForIdentification: function (socket) {

		socket.emit('who are you');
	},
	addUserConnection: function (socket, incoming) {

        clientsList[incoming.userId] = socket;
        
        socket.emit('registered');
	},
	sendMessage: function (socket, data) {

		clientsList[data.to].emit('new message', {

			from: data.from,
			message: data.message
		})
	}
}