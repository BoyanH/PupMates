var mongoose = require('mongoose'),
    fs = require('fs'),

    discussionSchema = mongoose.Schema({
            
            between: {type: String, require: '{PATH} is required', unique: true},
            cryptoWord: {type: String, require: '{PATH} is required'},
            messages: [{
                from: mongoose.Schema.ObjectId,
                to: mongoose.Schema.ObjectId,
                content: {type: String, require: '{PATH} is required'},
                date: {type: Date, require: '{PATH} is required'},
                seen: {type: Boolean, require: '{PATH} is required'},
                nth: {type: Number, require: '{PATH} is required'},
                edited: {type: Date, require: '{PATH} is required'}
            }]
    }),

    Discussion = mongoose.model('Discussion', discussionSchema);