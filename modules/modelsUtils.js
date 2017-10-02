const _ = require('lodash');
	  models = require('models');

async function getDirectoriesByType(mediaType){
	try{
		let dirs = await models.mediaDirs.findAll({
			type: mediaType
		});

		return dirs;
	}
	catch(err){}

	return [];
}

function getMediaFilesByDir(directoryId){
	return models.mediaFiles.findAll({
		where: {
			dirId: directoryId
		}
	});
}

async function getMediaItemsByType(mediaType){
	let items = [];

	try{
		//Get all directories with the required type
		let dirs = await getDirectoriesByType(mediaType);

		//Get all media files
		let mediaFiles = await Promise.all(_.map(dirs, dir => {
			return getMediaFilesByDir(dir.id);
		}));

		//merge results, Promise.all returns array of resolved promises, each Promise is column
		mediaFiles = [].concat.apply([], mediaFiles);
		mediaFiles = _.groupBy(mediaFiles, 'mediaId');

		let tasks = [];

		_.forOwn(mediaFiles, function(mediaFiles, mediaItemId){

			//Load media item from the database and associate to him a media files 
			let promise = models[mediaType].find({

				where: {
					id: mediaItemId
				}

			}).then(mediaItem => {
				mediaItem.dataValues.mediaFiles = mediaFiles;
				items.push(mediaItem.dataValues);
			})
			.catch(reason => {
				console.log(mediaItemId + ", error: " + reason);
			});

			//Waiting for tassks... 
			tasks.push(promise); 

		}); //_.forOwn

		//Waiting for all tasks 
		await Promise.all(tasks);
		console.log('Completed');

	}
	catch(err){
		console.log(err)
	}

	return items;
}

module.exports = {
	getDirs: getDirectoriesByType,
	getMediaItems: getMediaItemsByType
}