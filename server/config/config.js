var path = require('path');     //takes the module path from nodejs
var rootPath = path.normalize(__dirname + '/../..'); //setting the root path of the application

module.exports = {
    development:{       //if the application is in development status connect to local database
        rootPath: rootPath,
        db: 'mongodb://localhost/doggyworld',
        port: process.env.PORT || 1234
    },
    production: {       //if the application is in production status connect to mongolab
        rootPath: rootPath,
        db: 'mongodb://admin:fdsjfslkfdmskafvgjdsfdhbaufdhsa@ds053390.mongolab.com:53390/doggyworld', //connect to mongolab
        port: process.env.PORT || 1234
    }
}