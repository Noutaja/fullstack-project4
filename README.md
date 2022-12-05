# fullstack-project4
 

![movie search frontend screenshot](/images/screenshot.png)
 A movie API and frontend. Done using NodeJS, React and MongoDB. A school project

 ## Setup
 Add a MongoDB database uri as an environment variable: URI=(db uri). Run npm start in client and server directory.

 ## Features
 * Search movies either by id (Not supported by the frontend), or search parameters
 * Add movie (Not supported by the frontend)
 * Change movie information
   * Title
   * Year
   * Poster url
 * Delete movie
 
 ## API routes
 All parameters, besides in GET requests (query parameters), are read from request body parameters.
 * id
 * title
 * year
 * poster
 * limit

 ### /api/getall
 The basic search. Supports searching for a title and release year. Number of search results can be limited via a parameter. If not limited, all matching results are returned (The WHOLE DATABASE if no other search parameters provided). In the frontend the results are limited to 20 by default.

 ### /api/:id
 Search by id. Not supported by the frontend

 ### /api/add
 Adds a movie with the title, release year and poster url provided as parameters. Title and release year are required. If poster url is left blank, a placeholder is provided. Not supported by the frontend.

 ### /api/update/:id
 Updates a movie by id. Updated information provided as body parameters. Body parameters cannot be empty.

 ### /api/delete/:id
 Deletes a movie by id.

 ## Issues
 * Fix React errors regarding state hooks

 ## To-do
 * Refactor frontend states into objects.
 * Split App.js into multiple smaller files.
