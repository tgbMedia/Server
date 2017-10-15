const path = require('path'),
      config = require('config/server'),
      express = require('express'),
      downloadsManagerConfig = require('config/downloadsManager'),
      app = module.exports = express();


app.use('/api', require(path.resolve(__dirname, 'api', 'index.js')));
app.use('/assets', express.static(downloadsManagerConfig.assetsDirectory));

module.exports.start = function(onServerRunningCb){
    return app.listen(config.port, onServerRunningCb);
};



