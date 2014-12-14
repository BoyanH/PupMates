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
        db: 'mongodb://admin:fdsjfslkfdmskafvgjdsfdhbaufdhsa@ds053390.mongolab.com:53390/doggyworld', //connect to mongolab
        port: process.env.PORT || 1234
    }
}