var mongoose = require('mongoose'),
    fs = require('fs'),

    userAchievmentsSchema = mongoose.Schema({
            
            userId: mongoose.Schema.ObjectId,
            achievments: [{
                achievmentId: mongoose.Schema.ObjectId,
                dogId: mongoose.Schema.ObjectId,
                createdAt: Date
            }]
    }),

    UserAchievments = mongoose.model('UserAchievments', userAchievmentsSchema);