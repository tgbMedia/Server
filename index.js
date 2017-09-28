process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const db = require('database/db.js'),
	  metadata = require('modules/metadata'),
	  async = require('async'),
	  Prmoise = require('bluebird'),
	  config = require('./config/tests.json');


db.sequelize.sync().then(() => {
	metadata.refreshDir(config.mediaDir, "movies")
		.then(result => {
			 console.log(result);
		})
		.catch(err => {
			console.log(err);
		});
});



//metadata.getD();

// var db = require('./database/db.js'),
// 	metadata = require('./metadata.js')
// 	config = require('./config/tests.json');

// //TODO: https://darrenderidder.github.io/talks/ModulePatterns/#/

// db.sequelize.sync().then(() => {
// 	metadata.addOrRefreshMediaDir(config.mediaDir, 'movies', (err, result) => {
		
// 	});
// });
//


//db.MediaDir.findAll({ where: { type: 'movies' } }).then(){}


