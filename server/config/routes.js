var controllers = require('../controllers');
    auth = require('./auth.js');

    controllers.users.searchDynamically();

var User = require('mongoose').model('User');
module.exports = function (app) {
    app.get('/api/users', auth.isInRole('admin'),controllers.users.getAllUsers );
    app.get('/api/users/:id', auth.isAuthenticated, controllers.users.getUser);
    app.post('/api/users', controllers.users.createUser);
    app.put('/api/users',auth.isAuthenticated, controllers.users.updateUser);
    app.get('/partials/:partialArea/:partialName', function (req, res) {
        res.render('../../public/app/' + req.params.partialArea + '/' + req.params.partialName, {
               beautify: true,
        });
    });
    app.post('/:userId/newdog', auth.isAuthenticated, controllers.users.createDog);
    app.get('/img/profPhoto/:id', controllers.users.getProfPhoto);
    app.get('/:userId/imgdog/:id', controllers.users.getDogPhoto);
    app.post('/login',auth.login);
    app.post('/logout', auth.logout);
    app.get('/api/*', function(req,res){
        res.status(404);
        res.end();
    });
    app.get('*', function (req, res) {
        res.render('index', {currentUser: req.user});
    });
};