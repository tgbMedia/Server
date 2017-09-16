"use strict";

module.exports = function(sequelize, Sequelize) {
	var Genre = sequelize.define("genres", {
		id: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.UUIDV4,
			primaryKey: true
		},
		name: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true
		}
	});

	return Genre;
};