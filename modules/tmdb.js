const _ = require('lodash'),
      path = require('path'),
      Axios = require('axios'),
      downloadsManager = require('modules/downloadsManager'),
      logger = require('modules/logger'),
      secretConfig = require('config/secret'),
	  config = require('config/tmdb');

const axios = Axios.create({
    baseURL: config.apiBaseUrl,
    params: {
        api_key: secretConfig.tmdbApiKey
    }
});

function searchMovie(movieName){
	return axios.get(`search/movie?query=${movieName}`);
}

function movieInfoById(movieId){
    return axios.get(`movie/${movieId}?append_to_response=credits,images,keywords,videos`)
        .then(response => {
            return new Promise((resolve, reject) => {
                resolve(response.data);
            })
        });
}

function movieInfoByTitle(movieTitle, releaseYear){
    return searchMovie(movieTitle)
        .then(response => {
            return new Promise((resolve, reject) => {
                //Filter by release date for the best match
                let moviesAfterFilter = _.filter(response.data.results, movie => {
                   try{
                       return new Date(movie.release_date).getFullYear() == releaseYear;
                   }
                   catch(err){
                       return false;
                   }
                });

                if(moviesAfterFilter.length > 0)
                    return resolve(movieInfoById(moviesAfterFilter[0].id));

                resolve(movieInfoById(response.data.results[0].id));
            });
        });
}

function downloadMovieAssets(movie){
    let destinationDirectory = path.join("movies", movie.id.toString());

	return Promise.all([
		//Download poster
		downloadsManager.downloadAsset(
			config.posterUrl + movie.poster_path,
            destinationDirectory,
			config.posterFileName
		),

		//Download backdrop
		downloadsManager.downloadAsset(
			config.backdropUrl + movie.backdrop_path,
            destinationDirectory,
			config.backdropFileName
		)
	]);
}


module.exports = {
	getMovieInfoByTitle: movieInfoByTitle,
	downloadMovieAssets: downloadMovieAssets

	//getDir: getDirByPath
};