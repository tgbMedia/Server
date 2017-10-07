const fs = require("fs"),
	  Sequelize = require('sequelize'),
	  config = require('config/database.json'),
      modelsUtils = require('modules/modelsUtils');

const sequelize = new Sequelize(config);

//Define models
fs.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf(".") !== 0) && (file !== "index.js");
	})
	.forEach(file => {
		let model = sequelize.import(file);
		module.exports[model.name] = model;
	});

Object.keys(module.exports).forEach(modelName => {
    let model = module.exports[modelName];

    if("associate" in model)
        model.associate(module.exports);
});

module.exports.utils = modelsUtils;
module.exports.sequelize = sequelize;