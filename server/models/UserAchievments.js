var mongoose = require('mongoose'),
    fs = require('fs'),

    userAchievmentsSchema = mongoose.Schema({
            
            userId: {type: mongoose.Schema.ObjectId, require: '{PATH} is required', unique: true}, //_id from User.js Model
            achievments: [{
                achievmentId: {type: mongoose.Schema.ObjectId, require: '{PATH} is required'}, //_id from Achievment.js Model
                dogId: {type: mongoose.Schema.ObjectId, require: '{PATH} is required'},       //_id from Dog.js Model
                createdAt: {type: Date, require: '{PATH} is required'}
            }]
    }),

    UserAchievments = mongoose.model('UserAchievments', userAchievmentsSchema);