const fs = require('fs'),
	  path = require('path'),
	  mkdirp = require('mkdirp'),
	  https = require('https'),
	  config = require('config/downloadsManager');

function downloadToAssets(src, dest, fileName){
	return download(
		src, 
		path.join(config.assetsDirectory, dest),
		fileName
	);	
}

function download(src, dest, fileName){
	return new Promise((resolve, reject) => {
		//Create new folder if doens't exists
		mkdirp(dest, err => {
			if(err)
				return reject(err);

			//Create stream to file
			let file = fs.createWriteStream(
				path.join(dest, fileName)
			);

			//Download file
			https.get(src, function(response) {
				response.pipe(file);

				file.on('finish', function() {
					//Successfully download
					file.close(() => resolve());  
				});
			})
			.on('error', function(err) { 
				fs.unlink(path.join(dest, fileName)); //Delete current file
				reject(err.message);
			});

		}); //mkdirp

	}); //new Promise
}

module.exports = {
	downloadAsset: downloadToAssets
}