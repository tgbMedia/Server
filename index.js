process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const models = require('models'),
      tasks = require('tasks');

//TODO: https://jwt.io

models.sequelize.sync()
	.then(() => {
		//return models.utils.getMediaItems('movies');
        console.log('Scheduled tasks ', Object.keys(tasks));
	})
	.then(() => console.log('Running'))
	//.then((results) => console.log(results))
	.catch((err) => console.log('Failed: ' + err));

