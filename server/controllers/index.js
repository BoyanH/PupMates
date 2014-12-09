var usersController = require('../controllers/UsersController.js'),
	socketioController = require('../controllers/SocketioController.js'),
	messagesController = require('../controllers/MessagesController.js');

module.exports = {
    users: usersController,
    socket: socketioController,
    messages: messagesController
}