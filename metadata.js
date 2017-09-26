var fs = require('fs'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	_ = require('lodash'),
	async = require('async'),
	https = require('https'),
	util = require('util'),
	glob = require('glob'),
	ptn = require('parse-torrent-name'),
	db = require('./database/db.js'),
	tmdbConfig = require('./config/tmdb.json'),
	mdb = require('moviedb')(tmdbConfig.apiKey),
	config = require('./config/general.json');

const videoExtensions = [
	"3g2", "3gp", "aaf", "asf", "avi", "drc", "flv", "m2v", 
	"m4p", "wmv", "m4v", "mkv", "mng", "mov", "mp2", "mp4", 
	"mpe", "mxf", "mpg", "mpv", "nsv", "ogg", "ogv", "roq", 
	"svi", "vob", "webm", "avchd", "yuv", "qt", "rm", "rmvb", "mpeg"
].join(',');

//TMDB Limitation
const MAX_CONCURRENT_REQUESTS = 5;
const CHUNCK_INTERVAL = 1.8; //Seconds

//Erros
const NO_SEARCH_RESULTS_ERROS = 300;
const ID_IS_NAN = 301;
const UNKOWN_TMDB_ERROR = 400;

module.exports = {

	//Sequelize.ENUM('movies', 'shows', 'music', 'images'),
	getDirsByType: function(mediaType){
		return db.MediaDir
			.findAll({ where: { type: mediaType } });
	},

	addOrRefreshMediaDir: function(dirPath, mediaType, cb){

		fs.stat(dirPath, (err, stats) => {
			if(err)
				return cb(err, undefined);

			async.waterfall([
				callback => {
					db.MediaDir.find({ where: { path: dirPath } })
						.then(mediaDir => {
							if(mediaDir == null)
							{
								return db.MediaDir.create({
									path: dirPath,
									type: mediaType
								})
								.then(mediaDir => {
									this.searchMediaFiles(dirPath, mediaFiles => {
										callback(null, mediaDir, mediaFiles);
									});
								});
							}
							else if(mediaDir.type == mediaType)
							{
								this.searchMediaFiles(dirPath, mediaFiles => {
									callback(null, mediaDir, mediaFiles);
								});
							}
							else
								throw new Error('Already exists');
						});
				},
				(mediaDir, mediaFiles, completedCb) => {
					let results = [];

					//Filter files if doesn't exists in disk or already exists in DB
					async.filter(
						mediaFiles.slice(0, 5), 
						(filePath, filterCb) => {
							fs.access(path.join(mediaDir.path, filePath), function(err) {
								if(err)
									return filterCb(null, false);

					    		db.MediaFile.find({where: {dirId: mediaDir.id, path : filePath}})
					    			.then(mediaFile => {
					    				//This file exists in DB? 
					    				if(mediaFile == null)
					    					filterCb(null, true);
					    				else
					    				{
					    					filterCb(null, false);
					    				}
					    			})
						    });
						},
						(err, filesToScan) => {

							if(filesToScan.length < 1)
								return completedCb(); //Done!

							//Get metadata for the new files
							//console.log("Total files to scan: " + filesToScan.length);

							this.moviesInfo(
						    	filesToScan, 
						    	(currentMediaFilePath, movieInfo, taskCompletedCb) => {
						    		//console.log(movieInfo.original_title);

						    		db.Movie.find({where: {id: movieInfo.id}})
						    			.then(movie => {
						    				if(movie != null)
						    				{
						    					this.assignMediaFile(mediaDir.id, currentMediaFilePath, movie.id)
						    						.then(() => {
														taskCompletedCb(null, movie);
													});

						    					return;
						    				}

						    				console.log("New movie: " + movieInfo.original_title);

						    				//This movie doesn't exists in db -> Download assets...
											db.Movie.create(movieInfo)
												.then(movie => {
													this.downloadMovieAssets(movieInfo, () => {
														//console.log(movieInfo.original_title + " Is ready");
														this.assignMediaFile(mediaDir.id, currentMediaFilePath, movie.id)
															.then(() => {
																taskCompletedCb(null, movie);
															})
														
													});		
												})
						    			});
						    	}, 
						    	completedCb
						    );
							
						});

				}
			], function (err, results) {
				results.forEach(movie => {
					console.log(movie.original_title);
				})

				console.log("Completed")
			});
		})
	},

	searchMediaFiles: function(path, cb){
		glob(`**/*.{${videoExtensions}}`, {cwd: path}, (err, files) => {
			cb(err ? [] : files);
		});
	},

	assignMediaFile: function(directoryId, filePath, mediaItemId){
		return db.MediaFile.create({
			dirId: directoryId,
			path: filePath,
			mediaId: mediaItemId
		})
	},

	movieInfo: function(title, callback){
		mdb.searchMovie({ query: title }, (err, res) => {
			//Error handling
			if(err || typeof res['results'] == 'undefined')
				return callback(UNKOWN_TMDB_ERROR, null);
			else if(res['results'].length < 1)
				return callback(NO_SEARCH_RESULTS_ERROS, null);
			else if(isNaN(res['results'][0].id))
				return callback(ID_IS_NAN, null);

			mdb.movieInfo({id: res['results'][0].id}, (err, movieInfo) => {
				if(err)
					return callback(err, null);

				callback(null, movieInfo);
			})
		})
	},

	downloadMovieAssets: function(movie, taskCompletedCb){
		let movieAssetsDir = path.join(config.assetsDir, movie.id.toString());

		mkdirp(movieAssetsDir, err => {
			if (err) 
				return taskCompletedCb();

			let filesToDownload = [];

			filesToDownload.push(callback => {
				this.downloadFile(
					config.tmdbPosterUrl + movie.poster_path,
					path.join(movieAssetsDir, '0.jpg'),
					callback
				);
			});


			filesToDownload.push(callback => {
				this.downloadFile(
					config.tmdbBackdropUrl + movie.backdrop_path,
					path.join(movieAssetsDir, '1.jpg'),
					callback
				);
			});

			async.parallel(filesToDownload, taskCompletedCb);
			
		});
		
	},

	downloadFile: function(url, dest, cb){
		let file = fs.createWriteStream(dest);
		//console.log("Downloading " + url);
		
		https.get(url, function(response) {
			response.pipe(file);

			file.on('finish', function() {
				file.close(cb);  // close() is async, call cb after close completes.
			});
		})
		.on('error', function(err) { // Handle errors
			fs.unlink(dest); // Delete the file async. (But we don't check the result)
			if (cb) cb(err.message);
		});
	},

	moviesInfo: function(movies, movieInfoCb, completedCb){
		let tasks = [];
		let moviesResults = [];
		
		movies.splice(0, MAX_CONCURRENT_REQUESTS).forEach(file => {
			tasks.push(taskCb => {

				let parseFileName = ptn(path.basename(file));
				
				this.movieInfo(parseFileName['title'], (err, res) => {
					if(err || typeof res == 'undefined'){
						console.log('Failed: ' + path.basename(file) +  ", Error code: " + err);

						if(err == UNKOWN_TMDB_ERROR)
							movies.push(file);

						return taskCb();
					}

					movieInfoCb(file, res, taskCb);
				});
			})
		});

		async.parallel(tasks, (err, results) => {
			moviesResults = moviesResults.concat(results);

			if(movies.length > 0)
				return setTimeout(() => this.moviesInfo(movies, movieInfoCb, completedCb), CHUNCK_INTERVAL * 1000);

			completedCb(null, moviesResults);
		});
	}



}