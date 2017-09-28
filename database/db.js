var _ = require('lodash'),
	path = require('path'),
	Sequelize = require('sequelize'),
	config = require('../config/database.json');

var sequelize = new Sequelize(config);
// var models = ['MediaDir'];

// _.each(models, modelName => {
// 	module.exports[modelName] = sequelize.import(path.resolve(__dirname, modelName));
// })

//Define models
module.exports['MediaDir'] = sequelize.import(path.resolve(__dirname, 'MediaDir'));
module.exports['movies'] = sequelize.import(path.resolve(__dirname, 'Movie'));
module.exports['MediaFile'] = sequelize.import(path.resolve(__dirname, 'MediaFile'));


module.exports['movies'].hasMany(module.exports['MediaFile'], {foreignKey: 'mediaId', sourceKey: 'id'});
module.exports['MediaFile'].belongsTo(module.exports['movies'], {foreignKey: 'mediaId', targetKey: 'id'});

module.exports.sequelize = sequelize;