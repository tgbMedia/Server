process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const models = require('models'),
	  metadata = require('modules/metadata'),
	  async = require('async'),
	  config = require('config/secret'),
	  modelsUtils = require('modules/modelsUtils'),
	  Transcoder = require('modules/transcoder');

var transcoder = new Transcoder();

transcoder.transcode(config.mkvForTests)
	.then(() => {
		console.log('Running');
	})
	.catch(reason => {
		console.err('Failed ' + reason);
	});


//TODO: https://github.com/kelektiv/node-cron
//TODO: https://jwt.io



// models.sequelize.sync()
// 	.then(() => {
// 		return modelsUtils.getMediaItems('movies');
// 		//return metadata.refreshDir(config.mediaDir, 'movies')
// 	})
// 	//.then(() => console.log('Completed'))
// 	.then((results) => console.log(results))
// 	.catch((err) => console.log('Failed: ' + err));

