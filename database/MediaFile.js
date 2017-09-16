"use strict";

module.exports = function(sequelize, Sequelize) {
	var MediaFile = sequelize.define("mediaFiles", {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		path: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		dirId: {
			type: Sequelize.UUID,
			allowNull: false
		}
	}, 
	{
		indexes:[
			{
				unique: true,
				fields: ['path', 'dirId']
			},
		]
	});

	return MediaFile;
};