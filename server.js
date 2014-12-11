var http = require('http'),
    express = require('express'),
    cookieParser = require( 'cookie-parser' ),
    env = process.env.NODE_ENV || 'development',
    config = require('./server/config/config.js')[env],
	app = express(),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore();

require('./server/config/express.js')(app, config, sessionStore, cookieParser('grannysbushes'));
require('./server/config/mongoose.js')(config);
require('./server/config/passport.js')();
require('./server/config/routes.js')(app);

var	server = http.createServer(app),
	socketio = require('socket.io'),
	io = socketio.listen(server);


require('./server/config/socketio.js')(io, sessionStore);

server.listen(config.port);
console.log('Server running on port ' + config.port);