var mongoose = require('mongoose'),
    fs = require('fs'),

    discussionSchema = mongoose.Schema({
            
            between: {type: String, require: '{PATH} is required', unique: true}, //The '_id's of the 2 users, concatenated by '_'
            cryptoWord: {type: String, require: '{PATH} is required'}, //for future functionality, crypt all message with this word
            messages: [{
                from: mongoose.Schema.ObjectId,
                to: mongoose.Schema.ObjectId,
                content: {type: String, require: '{PATH} is required'},
                date: {type: Date, require: '{PATH} is required'},
                seen: {type: Boolean, require: '{PATH} is required'},
                nth: {type: Number, require: '{PATH} is required'}, //All messages are indexed for faster work
                edited: {type: Date, require: '{PATH} is required'}
            }]
    }),

    Discussion = mongoose.model('Discussion', discussionSchema);