process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const _ = require('lodash'),
      logger = require('modules/logger'),
      express = require('controllers'),
      models = require('models'),
      metadata = require('modules/metadata'),
      tasks = require('tasks'),
      emitter = require('modules/eventsManager'),
      events = require('config/events'),
      config = require('config/secret');

//TODO: https://jwt.io

emitter.on(events.newMedia, (file, mediaItem) => {
    logger.silly(`New media ${file.path}, ${mediaItem.original_title}`);
});

models.sequelize.sync()
	.then(() => {
        console.log('Scheduled tasks ', Object.keys(tasks));

        let server = express.start(() => {
            logger.info(`Server is running http://127.0.0.1:${server.address().port}`);
        });

        return metadata.refreshDir(config.mediaDir, 'movies');
		//return models.utils.getMediaItems('movies');

	})
	.catch((reason) => {
        logger.error({
            message: `Failed to start the server: ${reason}`,
            extra: {
                reason: reason
            }
        });
    });

