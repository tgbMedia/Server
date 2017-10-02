process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const models = require('models'),
	  metadata = require('modules/metadata'),
	  async = require('async'),
	  config = require('config/secret.json'),
	  modelsUtils = require('modules/modelsUtils');

models.sequelize.sync()
	.then(() => {
		return modelsUtils.getMediaItems('movies');
		//return metadata.refreshDir(config.mediaDir, 'movies')
	})
	//.then(() => console.log('Completed'))
	.then((results) => console.log(results))
	.catch((err) => console.log('Failed: ' + err));

