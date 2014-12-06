var path = require('path');
var rootPath = path.normalize(__dirname + '/../..')

module.exports = {
    development:{
        rootPath: rootPath,
        db: 'mongodb://localhost/doggyworld',
        port: process.env.PORT || 1234
    },
    production: {
        rootPath: rootPath,
        db: 'още не съм я създал в mongodb',
        port: process.env.PORT || 1234
    }
}