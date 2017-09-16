var db = require('./database/db.js'),
	metadata = require('./metadata.js')
	config = require('./config/tests.json');

db.sequelize.sync().then(() => {
	metadata.addMediaDir(config.mediaDir, 'movies', (err, result) => {
		
	});
});
//


//db.MediaDir.findAll({ where: { type: 'movies' } }).then(){}


