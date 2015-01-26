var controllers = require('../controllers');
    auth = require('./auth.js');

var User = require('mongoose').model('User');

module.exports = function (app) {
    app.get('/api/users', auth.isInRole('admin'),controllers.users.getAllUsers );
    app.get('/api/users/:id', controllers.users.getUser);
    app.post('/api/users', controllers.captcha._trySubmission, controllers.users.createUser);
    app.put('/api/users',auth.isAuthenticated, controllers.users.updateUser);
    app.get('/api/dynamicSearch/:searchContent/:limit?', controllers.users.dynamicSearch)
    app.get('/partials/:partialArea/:partialName', function (req, res) {
        res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName, {
               beautify: true,
        });
    });
    app.get('/img/:img', function(req, res){
        res.send('../../public/img/' + req.params.img);
    });
    app.post('/:userId/newdog', auth.isAuthenticated, controllers.users.createDog);
    app.post('/befriendMate', auth.isAuthenticated, controllers.users.befriend);
    app.get('/friends', auth.isAuthenticated, controllers.users.getFriends);
    app.get('/discussions', auth.isAuthenticated, controllers.messages.getUsersDiscussions);
    app.get('/img/profPhoto/:id', controllers.users.getProfPhoto);
    app.get('/:userId/imgdog/:id', controllers.users.getDogPhoto);
    app.post('/login',auth.login);
    app.post('/logout', auth.logout);
    app.get('/api/*', function(req,res){
        res.status(404);
        res.end();
    });
    

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