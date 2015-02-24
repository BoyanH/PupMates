var mongoose = require('mongoose'),
    fs = require('fs'),

    monthInSecs = 2629743.83,
    
    pendingAchievmentSchema = mongoose.Schema({
            
            name: String,
            points: Number,
            author: {
                Name: String,
                username: String,
                id: mongoose.Schema.ObjectId
            },
            createdAt: { type: Date, expires: monthInSecs },
            video: {data: Buffer, contentType: String}
    }),

    PendingAchievment = mongoose.model('PendingAchievment', pendingAchievmentSchema);