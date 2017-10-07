process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

const express = require('express'),
      models = require('models'),
      metadata = require('modules/metadata'),
      tasks = require('tasks'),
      emitter = require('modules/eventsManager'),
      events = require('config/events'),
      config = require('config/secret');

const app = express();
//TODO: https://jwt.io

emitter.on(events.newMedia, (file, mediaItem) => {
    console.log('New movie ' + file.path + ', ' + mediaItem.original_title);
});

app.get('/', function (req, res) {
    res.send('Hello World!')
})

models.sequelize.sync()
	.then(() => {
        console.log('Scheduled tasks ', Object.keys(tasks));
        return metadata.refreshDir(config.mediaDir, 'movies');
		//return models.utils.getMediaItems('movies');

	})
	.then(() => {
        app.listen(3000, function () {
            console.log('Running');
        })

    })
	//.then((results) => console.log(results))
	.catch((err) => console.log('Failed: ' + err));

