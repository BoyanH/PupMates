var controllers = require('../controllers');
    auth = require('./auth.js'),
    captcha = require('./captcha.js');

var User = require('mongoose').model('User');
module.exports = function (app) {
    app.get('/api/users', auth.isInRole('admin'),controllers.users.getAllUsers );
    app.get('/api/users/:id', controllers.users.getUser);
    app.post('/api/users', captcha.trySubmission, controllers.users.createUser);
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


    //Visual Captcha routes

    // @param type is optional and defaults to 'mp3', but can also be 'ogg'
    app.get( '/audio', captcha.getAudio );
    app.get( '/audio/:type', captcha.getAudio );

    // @param index is required, the index of the image you wish to get
    app.get( '/image/:index', captcha.getImage );

    // @param howmany is required, the number of images to generate
    app.get( '/start/:howmany', captcha.startRoute );

    //End of Visual Catpcha routes

    
    app.get('*', function (req, res) {
        res.render('index', {currentUser: req.user});
    });
};