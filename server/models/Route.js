var mongoose = require('mongoose');		//takes the module mongoose from nodejs
var User = mongoose.model('User');		//takes the model user from mongoose
var	Q = require('q');					//library for promises

var routeSchema = mongoose.Schema({		//creating a schema for what a place will be
	creator: mongoose.Schema.ObjectId,
	people: [mongoose.Schema.ObjectId],
	dogs: [mongoose.Schema.ObjectId],
	coords:[{
		lat: Number,
		lng: Number,
	}],
	name: String,
	description: String,
	rate: Number,
	distance: Number,
	private: Boolean,
});

var Route = mongoose.model("Route", routeSchema);
