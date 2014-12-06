var http = require('http'),
    express = require('express'),
    env = process.env.NODE_ENV || 'development',
    config = require('./server/config/config.js')[env];
var app = express();
require('./server/config/express.js')(app, config);
require('./server/config/mongoose.js')(config);
require('./server/config/passport.js')();
require('./server/config/routes.js')(app);

app.listen(config.port);
console.log('Server running on port ' + config.port);