var users = require('./UsersController.js'),
	dogs = require('./DogsController.js');

module.exports = {


    dynamicSearch: function (req, res) {

        if(req.params.searchContent.length < 3) {

            res.end("Must search for at least 3 characters in a name!");
        }

        users.searchUsersDynamically(req, res)
            .then(function (usersCollection) {

                dogs.searchDogsDynamically(req, res)
                    .then(function (dogsCollection) {
                    	
                        res.send({
                            people: usersCollection,
                            dogs: dogsCollection
                        });
                    });
            });
        
    }
};