var usersController = require('../controllers/UsersController.js'),
	socketioController = require('../controllers/SocketioController.js'),
	messagesController = require('../controllers/MessagesController.js'),
	CaptchaController = require('../controllers/CaptchaController.js'),
	notificationsController = require('../controllers/NotificationsController.js');

module.exports = {
    users: usersController,
    socket: socketioController,
    messages: messagesController,
    notifications: notificationsController,
    captcha: CaptchaController
}