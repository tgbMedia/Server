const //async = require('async') 
	  path = require('path'),
	  glob = require('glob'),
	  _ = require('lodash'),
	  ptn = require('parse-torrent-name'),
	  db = require('database/db'),
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
	newFiles = _.map(newFiles.slice(0, 5), filePath => {
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

			//Save the new details
			// fileDetails = await db[mediaType].create(fileDetails);

			switch(mediaType){
				case 'movies':
					await tmdb.downloadMovieAssets(fileDetails);
					break;
			}

			//Download assets

			console.log(fileDetails);

		}
		catch(err){
			console.log(err);
		}



		callback(null, fileName);
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
	return db.MediaFile.findAll({
		where: {
			dirId: dirId
		}
	});
}

function removeMediaFiles(dirId, filesPath){
	return db.MediaFile.destroy({
		where: {
			dirId: dirId,
			path: filesPath
		}
	});
}

function createDir(dirPath, mediaType){
	return db.MediaDir.create({
		path: dirPath,
		type: mediaType
	})
}

function getDirByPath(dirPath){
	return db.MediaDir.find({ 
		where: { 
			path: dirPath 
		} 
	});
}


module.exports = {
	refreshDir: refreshDir
	//getDir: getDirByPath
};