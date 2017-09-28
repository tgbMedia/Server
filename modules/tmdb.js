const config = require('config/tmdb'),
	  mdb = require('moviedb')(config.apiKey),
	  downloadsManager = require('modules/downloadsManager');

function searchMovie(title){
	return new Promise((resolve, reject) => {

		mdb.searchMovie({ query: title }, (err, res) => {
			if(err)
				return reject(err);

			try{
				return resolve(res['results'][0]);
			}
			catch(exception){
				return reject(exception);
			}
		}); //mdb.searchMovie

	}); //new Promise
}

function movieInfoById(movieId){
	return new Promise((resolve, reject) => {

		mdb.movieInfo({id: movieId}, (err, movieInfo) => {
			if(err)
				return reject(err);

			resolve(movieInfo);
		});//mdb.movieInfo

	}); //new Promise
}

function movieInfoByTitle(movieTitle){
	return searchMovie(movieTitle)
		.then(
			(movieDetails) => {
				return new Promise((resolve, reject) => {
					resolve(movieInfoById(movieDetails.id));
				})
			}
		);
}

function downloadMovieAssets(movie){
	return Promise.all([
		//Download poster
		downloadsManager.downloadAsset(
			config.posterUrl + movie.poster_path,
			movie.id.toString(),
			config.posterFileName
		),

		//Download backdrop
		downloadsManager.downloadAsset(
			config.backdropUrl + movie.backdrop_path,
			movie.id.toString(),
			config.backdropFileName
		)
	]);
}


module.exports = {
	getMovieInfoByTitle: movieInfoByTitle,
	downloadMovieAssets: downloadMovieAssets

	//getDir: getDirByPath
};