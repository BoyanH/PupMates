var usersController = require('../controllers/UsersController.js'),
	socketioController = require('../controllers/SocketioController.js');

module.exports = {
    users: usersController,
    socket: socketioController
}