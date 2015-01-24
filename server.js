var http = require('http'),
    express = require('express'),
    env = process.env.NODE_ENV || 'development',
    config = require('./server/config/config.js')[env],
	app = express();

require('./server/config/express.js')(app, config);
require('./server/config/mongoose.js')(config);
require('./server/config/passport.js')();
require('./server/config/routes.js')(app);

var	server = http.createServer(app),
	socketio = require('socket.io'),
	io = socketio.listen(server);


require('./server/config/socketio.js')(io, app.sessionStore);

server.listen(config.port);
console.log('Server running on port ' + config.port);