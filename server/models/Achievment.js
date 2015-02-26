var mongoose = require('mongoose'),
    fs = require('fs'),

    achievmentSchema = mongoose.Schema({
            
            name: String,
            points: Number,
            author: {             //The first user, who aquired it
                Name: String,
                username: String,
                id: mongoose.Schema.ObjectId
            },
            dogId: mongoose.Schema.ObjectId,  //the first dog, who learned the command
            createdAt: Date,
            description: String
    }),

    Achievment = mongoose.model('Achievment', achievmentSchema);