"use strict";

module.exports = function(sequelize, Sequelize) {
	var MediaDir = sequelize.define("mediaDirectories", {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		path: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true
		},
		lastModified: {
			type: Sequelize.DATE,
			defaultValue: null
		},
		type: {
			type: Sequelize.ENUM,
			values: ['movies', 'shows', 'music', 'images'],
			allowNull: false
		}
	});

	return MediaDir;
};