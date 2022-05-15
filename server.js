"use strict";

//ENVIRONMENT VARIABLES, FRAMEWORKS AND TOOLS
require('dotenv').config();

var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors"); //project 4 addition


var app = express();
app.use(cors());

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var PORT = process.env.PORT || 8081;
var uri = process.env.URI;

//Connect to the database. Log error into console
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.catch((err) => console.log(err));

//Create the schema and model for database use
//project 4 addition: id
var movieSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	year: {
		type: Number,
		required: true
	},
	poster: {
		type: String
	},
	id: {
		type: String
	}
});
const Movie = mongoose.model("Movie", movieSchema, "movies");

//Basic search. Returns ALL matching entries if no limit is given
app.get("/api/getall/", (req, res) => {
	
	var search = bodyParameters(req);
	search.title = new RegExp(search.title); //Convert basic search into regex for partial matching
	delete search.poster; //Disallow searching for poster urls

	var limitResults = { limit: search.limit }; //Limit the number results

	Movie.find(search, null, limitResults, (err, results) => {
		if (err) {
			res.status(500).json("Internal error!");
		} else if (results.length === 0) {
			res.status(204).json("No movies found!");
		} else {
			res.status(200).json(results);
		}
	})
});

//Search by id
app.get("/api/:id", (req, res) => {
	var id = req.params.id.slice(1); //for some reason req.params.id leaves : to the beginning...

	Movie.findById(id, (err, results) => {
		if (err) {
			res.status(500).json("Internal error!");
		} else if (!results) {
			res.status(204).json("Movie not found!");
		} else {
			res.status(200).json(results);
		}
	})
});

//Add a new movie into the database
app.post("/api/add", (req, res) => {
	var details = bodyParameters(req);

	//add a placeholder image if one wasn't given
	if (!details.poster) {
		details.poster = "https://vectorified.com/images/image-placeholder-icon-7.png"
	}

	var newMovie = new Movie(details)
	newMovie.save()
		.then(() => { res.status(201).json("Added " + details.title + " (" + details.year + ")") })
		.catch((err) => {
			res.status(400).json("Missing movie details!");
		})
});

//Change movie details.
app.put("/api/update/:id", (req, res) => {
	var id = req.params.id.slice(1); //for some reason req.params.id leaves : to the beginning...
	var edits = bodyParameters(req);

	//Abort if edits are empty
	if (!edits.title && !edits.year && !edits.poster) {
		res.status(400).json("Missing editing details!");
		return;
	}

	Movie.findByIdAndUpdate(id, edits, (err, results) => {
		if (err) {
			console.log(err);
			res.status(500).json("Internal error!");
		} else if (!results) {
			res.status(204).json("Movie not found!");
		} else {
			res.status(200).json("Records changed successfully.");
		}
	})
});

//Delete movie by id
app.delete("/api/delete/:id", (req, res) => {
	var id = req.params.id.slice(1); //for some reason req.params.id leaves : to the beginning...

	Movie.findByIdAndDelete(id, (err, results) => {
		if (err) {
			res.status(500).json("Internal error!");
		} else if (!results) {
			res.status(204).json("Movie not found!")
		} else {
			res.status(200).json("Movie record deleted successfully.")
		}
	})
});

app.listen(PORT, () => { console.log("it werks " + PORT); });

//Helper function used to wrap body parameters into a schema-compatible object
//project 4 additions: also check body.query for parameters, include search limit
function bodyParameters(req) {
	var movieTitle = req.body.title;
	if(req.query.title) movieTitle = req.query.title;

	var movieYear = req.body.year;
	if(req.query.year) movieYear = req.query.year;

	var moviePoster = req.body.poster;
	if(req.query.poster) moviePoster = req.query.poster;

	var searchLimit = req.body.limit;
	if(req.query.limit) searchLimit = req.query.limit;

	var temp = {};
	if (movieTitle) temp.title = movieTitle;
	if (movieYear) temp.year = movieYear;
	if (moviePoster) temp.poster = moviePoster;
	if (searchLimit) temp.limit = searchLimit;

	return temp;
}