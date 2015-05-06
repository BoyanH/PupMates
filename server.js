var http = require('http'),						//takes installed modules from nodejs - http server
    express = require('express'),				//express module is for single-paged applications
    env = process.env.NODE_ENV || 'development',//the app has two states - development and production. When deploying the app from the console the variable is set production
    config = require('./server/config/config.js')[env], //file which configures the server according the states(production, development)
	app = express();							

require('./server/config/express.js')(app, config); //file which consists of configuration for express
require('./server/config/mongoose.js')(config);		//file which consists of the database (mongoose)
require('./server/config/passport.js')();			//calling the passport configuration which process the user data
require('./server/config/routes.js')(app);			//file which consists of all the routes of the application
//require('./server/config/restartables.js')();

var	server = http.createServer(app),				//creating http server
	socketio = require('socket.io'),				//takes the module socket.io from nodejs
	io = socketio.listen(server);					//set the server for the web sockets


require('./server/config/socketio.js')(io, app.sessionStore); //configuration for the sockets

server.listen(config.port);										//set the listenning port for the application
console.log('Server running on port ' + config.port);