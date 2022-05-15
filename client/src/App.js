import './App.css';
import React, { useState } from "react";



function App() {
	//Search states
	const [title, setTitle] = useState("");
	const [year, setYear] = useState(0);
	const [limit, setLimit] = useState(20);
	/* const [search, setSearch] = useState({
		title: "",
		year: 0,
		limit: 20
	}); */

	//Edit states, in arrays as the list may have multiple entries
	const [editTitle, setEditTitle] = useState([]);
	const [editYear, setEditYear] = useState([]);
	const [editPoster, setEditPoster] = useState([]);
	const [editVisible, setEditVisible] = useState([]);

	//Search results
	const [results, setResults] = useState([]);


	//Basic search function
	function DBSearch(searchParams) {
		//Creating the search url with parameters
		var url = "/api/getall/?";
		if (searchParams.title) url += "title=" + searchParams.title;
		if (searchParams.year) url += "&year=" + searchParams.year;
		url += "&limit=" + searchParams.limit;

		fetch(url)
			.then((results) => {
				return results.json();
			})
			.then((data) => {
				var temp = new Array(data.length).fill(false);
				//reset list form inputs and visibility
				setEditVisible(temp);
				setEditTitle([]);
				setEditYear([]);
				setEditPoster([]);

				//set result state from the search results
				setResults(data);
			})
			.catch(error => {
				setResults("No movies found!");
			});
	}

	//Delete a movie by id
	function DBDelete(id) {
		var url = "/api/delete/:" + id;
		fetch(url, { method: "delete" })
			.then((res) => res.json())
			.catch((error) => { console.log(error) });

	}

	//Update movie details
	function DBUpdate(id, params) {
		//create the url with id
		var url = "api/update/:";
		if (id) url += id;

		//create the request body with urlencoded content type
		var data = {};
		if(params.title) data.title = params.title;
		if(params.year) data.year = params.year;
		if(params.poster) data.poster = params.poster;

		var reqBody = [];
		for (var i in data) {
			var key = encodeURIComponent(i);
			var value = encodeURIComponent(data[i]);
			reqBody.push(key + "=" + value);
		}
		reqBody = reqBody.join("&");

		fetch(url, {
			method: "PUT",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
			},
			body: reqBody
		})
			.then((res) => res.json())
			.catch((error) => { console.log(error) });
	}

	//Event handlers
	function handleSubmit(event) {
		event.preventDefault();
		DBSearch({ title: title, year: year, limit: limit });
	}

	function handleEditSubmit(event) {
		event.preventDefault();
		var id = event.target[3].getAttribute("movieid"); //Hacky way to get the db id and index in the list from the button pressed
		var index = event.target[3].getAttribute("index");
		DBUpdate(id, { title: editTitle[index], year: editYear[index], poster: editPoster[index] });
	}

	function handleDelete(event) {
		event.preventDefault();
		var id = event.target.getAttribute("movieid");
		DBDelete(id);
	}

	//Couldn't get the functionality to work as an anonymous function, so I made it a named function
	function changeAtIndex(array, index, value) {
		var temp = [...array];
		temp[index] = value;
		return temp;
	}

	//Format and return an imdb url with the provided id
	function imdbUrl(id){
		var url = "https://www.imdb.com/title/tt";
		id = id.toString().padStart(7, "0");
		url += id;
		return url;
	}
	//Creates the movieList
	function MovieList(props) {
		var { data } = props;
		if (data === "No movies found!") data = [];
		return (
			<ul className="list-group">
				{(data.length) > 0 ? data.map((item, index) => (
					<li key={item._id} className="list-group-item movie-list-item">
						<img src={item.poster} className="img-fluid poster-image" alt="Movie poster" />
						<ul className="list-group movie-details">
							<li key={item._id + 2} className="movie-title">{item.title}</li>
							<li key={item._id + 3}>{item.year}</li>
							{(item.imdb) ? <li key={item._id + 4}><a href={imdbUrl(item.imdb.id)}>IMDB link</a></li> : null}
							<li key={item._id + 5} className="movie-buttons">
								<button
									type="button"
									className="btn btn-primary"
									movieid={item._id}
									onClick={handleDelete}>
									Delete
								</button>

								<button
									type="button"
									className="btn btn-primary"
									movieid={item._id}
									onClick={() => setEditVisible(changeAtIndex(editVisible, index, !editVisible[index]))}>
									Edit
								</button>
							</li>
							{editVisible[index] ? EditForm(index, item._id) : null}
						</ul>
					</li>
				))
					: null}
			</ul>
		)
	}

	//Creates the edit form in MovieList entries
	function EditForm(index, id) {
		return (
			<div className="edit-inputs">
				<form onSubmit={handleEditSubmit}>
					<div className="form-group">
						<input name="edit-title"
							value={editTitle[index]}
							onChange={(event) => setEditTitle(changeAtIndex(editTitle, index, event.target.value))}
							type="text"
							className="form-control"
							id="edit-title-input"
							placeholder="New title" />
					</div>
					<div className="form-group">
						<input name="edit-year"
							value={editYear[index]}
							onChange={(event) => setEditYear(changeAtIndex(editYear, index, event.target.value))}
							type="number"
							className="form-control"
							id="edit-year-input"
							placeholder="New year of release" />
					</div>
					<div className="form-group">
						<input name="edit-poster"
							value={editPoster[index]}
							onChange={(event) => setEditPoster(changeAtIndex(editPoster, index, event.target.value))}
							type="text"
							className="form-control"
							id="edit-poster-input"
							placeholder="New poster url" />
					</div>
					<button type="submit" className="btn btn-primary" movieid={id} index={index}>Submit changes</button>
				</form>
			</div>
		)
	}

	//Creates the search form
	function SearchForm() {
		return (
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="title-input">Movie title</label>
					<input name="title"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						type="text"
						className="form-control"
						id="title-input"
						placeholder="Movie title"
						required />
				</div>
				<div className="form-group">
					<label htmlFor="year-input">Year of release</label>
					<input name="year"
						value={year}
						onChange={(event) => setYear(event.target.value)}
						type="number"
						className="form-control"
						id="year-input"
						placeholder="Year of release" />
				</div>
				<div className="form-group">
					<label htmlFor="limit-input">Number of results</label>
					<input name="limit"
						value={limit}
						onChange={(event) => setLimit(event.target.value)}
						type="number"
						className="form-control"
						id="limit-input"
						placeholder="20" />
				</div>
				<button type="submit" className="btn btn-primary">Search</button>
			</form>
		);
	}

	return (
		<div className="App">
			<div className="row">
				<div className="col-sm">
					<div className="title">Movie Search</div>
				</div>
			</div>
			<div className="row">
				<div className="col-sm">
					{SearchForm()}
				</div>
				<div className="col-sm">
					{MovieList({ data: results })}
				</div>
			</div>

		</div>
	);
}

export default App;
