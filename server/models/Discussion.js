var mongoose = require('mongoose'),
    fs = require('fs'),

    discussionSchema = mongoose.Schema({
            
            between: {type: String, require: '{PATH} is required', unique: true},
            cryptoWord: {type: String, require: '{PATH} is required'},
            messages: [{
                from: {type: String, require: '{PATH} is required'},
                to: {type: String, require: '{PATH} is required'},
                content: type: String, require: '{PATH} is required',
                date: type: Date, require: '{PATH} is required'
            }]
    }),
    
    Discussion = mongoose.model('Discussion', discussionSchema);