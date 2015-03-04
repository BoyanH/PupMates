var mongoose = require('mongoose'),
    fs = require('fs'),

    monthInSecs = 2629743.83,
    
    pendingAchievmentSchema = mongoose.Schema({
            
            name: String,
            points: Number,
            author: {
                name: String,
                username: String,
                id: {type: mongoose.Schema.ObjectId, require: '{PATH} is required', unique: true}
            },
            dogId: mongoose.Schema.ObjectId,
            createdAt: { type: Date, expires: monthInSecs },
            video: {data: Buffer, contentType: String},
            description: String,
            suggestChange: Boolean  //If the pendingAchievment suggests a change to an existing Achievment
                                    //            e.g. change in 'points' or 'description' fields
    }),

    PendingAchievment = mongoose.model('PendingAchievment', pendingAchievmentSchema);