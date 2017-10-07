"use strict";

module.exports = function(sequelize, Sequelize) {
	let MediaDir = sequelize.define("mediaDirs", {
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
		type: {
			type: Sequelize.ENUM,
			values: ['movies', 'shows', 'music', 'images'],
			allowNull: false
		},
        lastModified: {
            type: Sequelize.DATE,
            defaultValue: null
        },
	});

	return MediaDir;
};