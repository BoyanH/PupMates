// var controllers = require('../controllers');
//     auth = require('../config/auth.js'),
//     Discussion = require('mongoose').model('Discussion');

// module.exports = {

// 	createDiscussion: function (message) {

// 		if (auth.isAuthenticated) {

// 			var newDiscussion = {

// 				between: message.from > message.to ? message.from + '_' + message.to : message.to + '_' + message.from,
// 				cryptoWord: '',
// 				messages: [
// 					{
// 						from: message.from,
// 						to: message.to,
// 						content: message.content,
// 						date: new Date()
// 					}
// 				]
// 			};

// 			Discussion.create(newDiscussion, function(err, discussion){
// 	            if(err){
// 	                console.log('Fell to add new discussion: ' + err);
// 	                return;
// 	            }
// 	        });
// 		}
// 	}

// };