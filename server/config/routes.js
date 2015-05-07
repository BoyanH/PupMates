//module which set all the routes in the applications

var controllers = require('../controllers');    //takes the controllers of the models for the database
    auth = require('./auth.js');                //takes the authentication module

module.exports = function (app) {
	app.all('*', function(req, res, next) {
	   res.header('Access-Control-Allow-Origin', "*");
	   res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
	   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	   next();
	});
    app.get('/api/users/:username', controllers.users.getUser);
    app.get('/api/users/names/:id', controllers.users.getUserNames);  
    app.get('/api/users', auth.isInRole('admin'),controllers.users.getAllUsers ); //returns all users if the current user is admin                 //returns only a user with username parameter
    app.get('/api/user-all-data/:username', controllers.allData.getAllDataOfUserByUserName); //returns all the data of an user with username parameter
    app.post('/api/users', controllers.captcha._trySubmission, controllers.users.createUser);   //creates a new user
    app.put('/api/users',auth.isAuthenticated, controllers.users.updateUser);               //updates an user
    app.get('/api/dynamicSearch/:searchContent/:limit?', controllers.search.dynamicSearch);  //does a search in the db for users and dogs
    app.get('/api/featured', controllers.schedule.getFeaturedProfiles);
    app.get('/partials/:partialArea/:partialName', function (req, res) {                    //returns a partial view
        res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName, {
               beautify: true,
        });
    });
    app.get('/img/:img', function(req, res){    //returns an img in the folder public/img/
        res.send('../../public/img/' + req.params.img);
    });
    app.get('/places/:id', auth.isAuthenticated, controllers.places.getPlacesOfUser);   //returns the places of a user
    app.post('/places', auth.isAuthenticated, controllers.places.createPlace);   //creates a place
    app.put('/rateplace/:placeId', auth.isAuthenticated, controllers.places.ratePlace);
    app.delete('/places', auth.isAuthenticated, controllers.places.deletePlace);  //deletes a place
    app.get('/places/allexceptofuser/:id', auth.isAuthenticated, controllers.places.getPlacesExcepUser) //get all the places except the places of user with id parameter
    app.post('/:userId/newdog', auth.isAuthenticated, controllers.dogs.createDog);      //creates a dog
    app.put('/updateDog/:userId/:dogId', auth.isAuthenticated, controllers.dogs.updateDog); //updates a dog
    app.get('/dogs/:userId', controllers.dogs.getDogsOfUser)            //returns the dogs of a user
    app.get('/dogs/username/:username', controllers.dogs.getDogsOfUserByUserName);   //returns the dogs of user with username parameter
    app.get('/dog/:id', controllers.dogs.getDogById);    //returns a dog with id
    app.post('/befriendMate', auth.isAuthenticated, controllers.users.befriend);    //makes a friend request
    app.delete('/notifications', auth.isAuthenticated, controllers.notifications.deleteNotification);   //deletes a notification
    app.put('/notifications', auth.isAuthenticated, controllers.notifications.markNotificationAsSeen); //marks a notification as seen
    app.get('/friends', auth.isAuthenticated, controllers.users.getFriends);    //returns the friends of a user
    app.get('/discussions', auth.isAuthenticated, controllers.messages.getUsersDiscussions);    //returns the discussions of a user
    app.get('/img/profPhoto/:id', controllers.users.getProfPhoto);  //returns the profile photo of a user
    app.get('/:userId/imgdog/:dogId', controllers.dogs.getDogProfPhoto);    //returns the profile photo of a dog
    app.get('/imgdog/:dogId', controllers.dogs.getDogProfPhoto);
    app.post('/login',auth.login);  //does a login
    app.post('/logout', auth.logout); //does a logout
    app.get('/api/*', function(req,res){    //if it is called smth from the api/* then returned not found if it is not returned the data till here
        res.status(404);
        res.end();
    });

    app.post('/achievments', auth.isAuthenticated, controllers.achievments.applyForAchievment); //creates an achievement 
    app.get('/achievments/aquired/:userId', auth.isAuthenticated, controllers.achievments.getAchievmentsOfUser); //returns the achievements of the current user
    app.get('/achievments/pending', auth.isAuthenticated, controllers.achievments.getOwnAchApls);
    app.get('/achievments/available', controllers.achievments.getAvailableAchievments);     //returns the available achievemtns
    app.get('/admin/achievments', auth.isInRole('admin'), controllers.achievments.queryAchievmentApplications);
    app.post('/admin/achievments', auth.isInRole('admin'), controllers.achievments.acceptAchievment);
    app.delete('/admin/achievments', auth.isInRole('admin'), controllers.achievments.deletePendingAch);
    app.get('/admin/achievments/video/:id', auth.isInRole('admin'), controllers.achievments.getApprovalVideo);

    //routes (polylines)
    app.get('/allroutes', auth.isAuthenticated, controllers.route.getAllRoutes);
    app.get('/routes/:userId', auth.isAuthenticated, controllers.route.getRoutesOfUser);
    app.post('/routes/:userId', auth.isAuthenticated, controllers.route.createRoute);
    app.get('/allroutesexceptuser/:userId', auth.isAuthenticated, controllers.route.getRoutesOfAllExceptUser);

    // visualCaptcha initialisation routes
    app.get('/captcha/start/:howmany', controllers.captcha._start );
    app.get('/captcha/audio/:type?',   controllers.captcha._getAudio );
    app.get('/captcha/image/:index',   controllers.captcha._getImage  );
    app.options('/api/users',          controllers.captcha._options );

    //end of visual captcha

    app.get('*', function (req, res) {
        res.render('index', {currentUser: req.user});
    });
};