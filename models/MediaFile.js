"use strict";

module.exports = function(sequelize, Sequelize) {
	var MediaFile = sequelize.define("mediaFiles", {
		dirId: {
			type: Sequelize.UUID,
			allowNull: false
		},
		path: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		mediaId: {
			type: Sequelize.INTEGER,			
			allowNull: false
		}		
	}, 
	{
		indexes:[
			{
				unique: true,
				fields: ['dirId', 'path']
			},
		]
	});

	return MediaFile;
};