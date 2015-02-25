var mongoose = require('mongoose'),
    fs = require('fs'),

    achievmentSchema = mongoose.Schema({
            
            name: String,
            points: Number,
            author: {
                Name: String,
                username: String,
                id: mongoose.Schema.ObjectId
            },
            createdAt: Date,
            description: String
    }),

    Achievment = mongoose.model('Achievment', achievmentSchema);