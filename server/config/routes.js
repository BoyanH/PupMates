var controllers = require('../controllers');
    auth = require('./auth.js');

var User = require('mongoose').model('User');

module.exports = function (app) {
    app.get('/api/users', auth.isInRole('admin'),controllers.users.getAllUsers );
    app.get('/api/users/:username', controllers.users.getUser);
    app.get('/api/user-all-data/:username', controllers.allData.getAllDataOfUserByUserName)
    app.post('/api/users', controllers.captcha._trySubmission, controllers.users.createUser);
    app.put('/api/users',auth.isAuthenticated, controllers.users.updateUser);
    app.get('/api/dynamicSearch/:searchContent/:limit?', controllers.search.dynamicSearch)
    app.get('/partials/:partialArea/:partialName', function (req, res) {
        res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName, {
               beautify: true,
        });
    });
    app.get('/img/:img', function(req, res){
        res.send('../../public/img/' + req.params.img);
    });
    app.get('/places/:id', auth.isAuthenticated, controllers.places.getPlacesOfUser);
    app.post('/places/create/:id', auth.isAuthenticated, controllers.places.createPlace);
    app.delete('/places/delete/:id', auth.isAuthenticated, controllers.places.deletePlace)
    app.get('/places/allexceptofuser/:id', auth.isAuthenticated, controllers.places.getPlacesExcepUser)
    app.post('/:userId/newdog', auth.isAuthenticated, controllers.dogs.createDog);
    app.put('/updateDog/:userId/:dogId', auth.isAuthenticated, controllers.dogs.updateDog);
    app.get('/dogs/:userId', controllers.dogs.getDogsOfUser)
    app.get('/dogs/username/:username', controllers.dogs.getDogsOfUserByUserName)
    app.get('/dog/:id', controllers.dogs.getDogById)
    app.post('/befriendMate', auth.isAuthenticated, controllers.users.befriend);
    app.delete('/notifications', auth.isAuthenticated, controllers.notifications.deleteNotification);
    app.put('/notifications', auth.isAuthenticated, controllers.notifications.markNotificationAsSeen);
    app.get('/friends', auth.isAuthenticated, controllers.users.getFriends);
    app.get('/discussions', auth.isAuthenticated, controllers.messages.getUsersDiscussions);
    app.get('/img/profPhoto/:id', controllers.users.getProfPhoto);
    app.get('/:userId/imgdog/:dogId', controllers.dogs.getDogProfPhoto);
    app.post('/login',auth.login);
    app.post('/logout', auth.logout);
    app.get('/api/*', function(req,res){
        res.status(404);
        res.end();
    });

    app.post('/achievments', auth.isAuthenticated, controllers.achievments.applyForAchievment);
    app.get('/achievments', auth.isAuthenticated, controllers.achievments.getOwnAchievments);
    app.get('/achievments/pending', auth.isAuthenticated, controllers.achievments.getOwnAchApls);
    app.get('/achievments/available', auth.isAuthenticated, controllers.achievments.getAvailableAchievments);
    app.get('/admin/achievments', auth.isInRole('admin'), controllers.achievments.queryAchievmentApplications);
    app.post('/admin/achievments', auth.isInRole('admin'), controllers.achievments.acceptAchievment);
    app.delete('/admin/achievments', auth.isInRole('admin'), controllers.achievments.deletePendingAch);
    app.get('/admin/achievments/video/:id', auth.isInRole('admin'), controllers.achievments.getApprovalVideo);
    

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