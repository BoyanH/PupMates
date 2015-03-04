var users = require('./UsersController.js'),
	dogs = require('./DogsController.js');

module.exports = {


    dynamicSearch: function (req, res) {

        //searchContent available in request parameters is the whole uncut string typed in the search bar
        if(req.params.searchContent.length < 3) {

            res.end("Must search for at least 3 characters in a name!");
        }

        //Combine the 2 search functions in each controller and send the merged data as search results
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