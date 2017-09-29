process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const models = require('models'),
	  metadata = require('modules/metadata'),
	  async = require('async'),
	  config = require('config/secret.json');


models.sequelize.sync().then(() => {
	metadata.refreshDir(config.mediaDir, "movies")
		.then(result => {
			 console.log(result);
		})
		.catch(err => {
			console.log("Failed: " + err);
		});
});

