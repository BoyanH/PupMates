var usersController = require('../controllers/UsersController.js'),
	socketioController = require('../controllers/SocketioController.js'),
	dogsController = require("../controllers/DogsController.js"),
    placesController = require("../controllers/PlacesController.js"),
	messagesController = require('../controllers/MessagesController.js'),
	CaptchaController = require('../controllers/CaptchaController.js'),
	notificationsController = require('../controllers/NotificationsController.js'),
    searchController = require('../controllers/SearchController.js'),
    achievmentsController = require('../controllers/AchievmentsController.js'),
    allDataController = require('../controllers/AllData.js');

module.exports = {
    users: usersController,
    socket: socketioController,
    messages: messagesController,
    notifications: notificationsController,
    captcha: CaptchaController,
    places: placesController,
    dogs: dogsController,
    search: searchController,
    achievments: achievmentsController,
    allData: allDataController
}