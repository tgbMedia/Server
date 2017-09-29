"use strict";

module.exports = function(sequelize, Sequelize) {
	var Movie = sequelize.define("movies", {
		id: {
			type: Sequelize.INTEGER,
			primaryKey: true
		},
		original_title: {
			type: Sequelize.STRING,
			allowNull: false
		},
		original_language: {
			type: Sequelize.STRING,
			allowNull: true
		},
		imdb_id: {
			type: Sequelize.INTEGER,
			allowNull: true,
			unique: true
		},
		overview: {
			type: Sequelize.STRING,
			allowNull: false
		},
		runtime: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		popularity: {
			type: Sequelize.FLOAT,
			allowNull: true
		},
		release_date: {
			type: Sequelize.DATE,
			allowNull: true
		},
		vote_average: {
			type: Sequelize.FLOAT,
			allowNull: true
		}
	});

	return Movie;
};