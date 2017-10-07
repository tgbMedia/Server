process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const models = require('models'),
      metadata = require('modules/metadata'),
      //tasks = require('tasks'),
      emitter = require('modules/eventsManager'),
      events = require('config/events'),
      config = require('config/secret');

//TODO: https://jwt.io

emitter.on(events.newMedia, (file, mediaItem) => {
    console.log('New movie ' + file.path + ', ' + mediaItem.original_title);
});

models.sequelize.sync()
	.then(() => {
        //console.log('Scheduled tasks ', Object.keys(tasks));
        return metadata.refreshDir(config.mediaDir, 'movies');
		//return models.utils.getMediaItems('movies');

	})
	.then(() => console.log('Running'))
	//.then((results) => console.log(results))
	.catch((err) => console.log('Failed: ' + err));

