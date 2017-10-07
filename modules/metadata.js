const util = require('util'),
	  path = require('path'),
	  fs = require('fs'),
      _ = require('lodash'),
	  glob = require('glob'),
	  ptn = require('parse-torrent-name'),
	  models = require('models'),
	  config = require('config/metadata'),
	  TasksManager = require('modules/tasksManager'),
      emitter = require('modules/eventsManager'),
	  tmdb = require('modules/tmdb'),
      events = require('config/events'),
	  videoExtensions = require('config/videoFilesExtensions').join(',');

const fsStat = util.promisify(fs.stat);

const tasksManager = new TasksManager(
	config.maxConcurrentRequests, 
	config.intervalBetweenChunck
);

async function refreshDir(dirPath, mediaType){
	let dir = await models.utils.getDirByPath(dirPath);

	//Dir doesn't exists
	if(!dir)
	{
		try{
			dir = await models.utils.createDir(dirPath, mediaType);
		}
		catch(err){
			throw new Error(err);
		}
	}

	//Failed to create new directory?
	if(!dir)
		throw new Error("Could not find the directory");

	//This directory type is already defined as another value?
	if(dir.type.toUpperCase() !== mediaType.toUpperCase())
		throw new Error("This directory type is already defined as: " + dir.type);

	//Load files list from the database
	let mediaFilesFromDb = await models.utils.getMediaFilesByDir(dir.id).map(mediaFile => {
		return mediaFile.path;
	});

	//Search media files in this directory
	let existsMediaFiles = await searchMediaFiles(dirPath);

	//Compare between the exists files to the list from the database
	let removedFiles = _.difference(mediaFilesFromDb, existsMediaFiles);

	//Remove deleted files from the database
	if(removedFiles.length > 0)
		await models.utils.removeMediaFiles(dir.id, removedFiles);

	//Load metadata for the new files
	let newFiles = _.difference(existsMediaFiles, mediaFilesFromDb);

	//Convert files path to tasks
	newFiles = _.map(newFiles, filePath => {
		return newMediaFile(dir, filePath, mediaType);
	});
	
	//Get metadata for the new files
	await tasksManager.runTasks(newFiles);

	//Update last modified
    let stat = await fsStat(dirPath);

    models.mediaDirs.update(
        {
            lastModified: stat.mtime
        },
        {
            where: {id: dir.id}
        }
    );

	return true;
}

function newMediaFile(dir, filePath, mediaType){
	let run = async(callback) => {
		let fileName = ptn(path.basename(filePath));

		try{
			if(typeof fileName.title === 'undefined')
				return callback('Failed to parse filename', null);

			//Get file details from TMDB or another service by the media type
			let fileDetails = undefined;

			switch(mediaType){
				case 'movies':
					fileDetails = await tmdb.getMovieInfoByTitle(fileName.title);
					break;
			}

			//No file details?
			if(!fileDetails)
				return callback('No file details', null);

			//Create or update item in the database
			await models[mediaType].upsert(fileDetails);

			//Download assets
			switch(mediaType){
				case 'movies':
					await tmdb.downloadMovieAssets(fileDetails);
					break;
			}

			//Create new media file
			let mediaFile = await models.utils.createMediaFile(dir.id, fileDetails.id, filePath);
            emitter.emit(events.newMedia, mediaFile, fileDetails);

			//console.log(fileDetails);
			// console.log(fileDetails.original_title);
			callback(null, mediaFile, fileDetails);

		}
		catch(err){
			console.log(filePath + ", " + err);
			//Return null if failed... 
			callback(err, null);
		}
		
	};

	return callback => run(callback);
}


function searchMediaFiles(path){
	return new Promise((resolve) => {
		glob(`**/*.{${videoExtensions}}`,  {cwd: path},  (err, files) => {
			resolve(err ? [] : files);
		});
	});
}

module.exports = {
	refreshDir: refreshDir
	//getDir: getDirByPath
};