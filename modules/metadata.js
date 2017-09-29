const //async = require('async') 
	  path = require('path'),
	  glob = require('glob'),
	  _ = require('lodash'),
	  ptn = require('parse-torrent-name'),
	  models = require('models'),
	  config = require('config/metadata'),
	  TasksManager = require('modules/tasksManager'),
	  tmdb = require('modules/tmdb'),
	  downloadsManager = require('modules/downloadsManager')
	  videoExtensions = require('config/videoFilesExtensions').join(',');

const tasksManager = new TasksManager(
	config.maxConcurrentRequests, 
	config.intervalBetweenChunck
);

async function refreshDir(dirPath, mediaType){
	let dir = await getDirByPath(dirPath);

	//Dir doesn't exists
	if(dir == undefined)
	{
		try{
			dir = await createDir(dirPath, mediaType);
		}
		catch(err){
			throw new Error(err);
		}
	}

	//Failed to create new directory?
	if(dir == null)
		throw new Error("Could not find the directory")

	//This directory type is already defined as another value?
	if(dir.type != mediaType)
		throw new Error("This directory type is already defined as: " + dir.type);

	//Load files list from the database
	let mediaFilesFromDb = await getMediaFiles(dir.id).map(mediaFile => {
		return mediaFile.path;
	});

	//Search media files in this directory
	let existsMediaFiles = await searchMediaFiles(dirPath);

	//Compare between the exists files to the list from the database
	let removedFiles = _.difference(mediaFilesFromDb, existsMediaFiles);

	//Remove deleted files from the database
	if(removedFiles.length > 0)
		await removeMediaFiles(dir.id, removedFiles);

	//Load metadata for the new files
	let newFiles = _.difference(existsMediaFiles, mediaFilesFromDb);

	//Convert files path to tasks
	newFiles = _.map(newFiles, filePath => {
		return newMediaFile(dir, filePath, mediaType);
	});
	
	//Get metadata for the new files
	await tasksManager.runTasks(newFiles);

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
			if(fileDetails == undefined)
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
			let mediaFile = await createMediaFile(dir.id, fileDetails.id, filePath);

			//console.log(fileDetails);
			console.log(fileDetails.original_title);
			callback(null, fileDetails);

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
	return new Promise((resolve, reject) => {
		glob(`**/*.{${videoExtensions}}`,  {cwd: path},  (err, files) => {
			resolve(err ? [] : files);
		});
	});
}

function getMediaFiles(dirId){
	return models.mediaFiles.findAll({
		where: {
			dirId: dirId
		}
	});
}

function removeMediaFiles(dirId, filesPath){
	return models.mediaFiles.destroy({
		where: {
			dirId: dirId,
			path: filesPath
		}
	});
}

function createDir(dirPath, mediaType){
	return models.mediaDirs.create({
		path: dirPath,
		type: mediaType
	})
}

function createMediaFile(dirId, mediaId, filePath){
	return models.mediaFiles.create({
		dirId: dirId,
		path: filePath,
		mediaId: mediaId
	})
}

function getDirByPath(dirPath){
	return models.mediaDirs.find({ 
		where: { 
			path: dirPath 
		} 
	});
}


module.exports = {
	refreshDir: refreshDir
	//getDir: getDirByPath
};