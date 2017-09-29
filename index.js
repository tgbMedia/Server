process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const models = require('models'),
	  metadata = require('modules/metadata'),
	  async = require('async'),
	  config = require('config/secret.json');

models.sequelize.sync()
	.then(() => {
		return metadata.refreshDir(config.mediaDir, 'movies')
	})
	.then(() => console.log('Completed'))
	.catch((err) => console.log('Failed: ' + err));

