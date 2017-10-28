"use strict";

module.exports = function(sequelize, Sequelize) {
    var Person = sequelize.define("person", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            gender: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            profile_path: {
                type: Sequelize.STRING,
                allowNull: true
            }
        },
        {
            indexes:[
                {
                    unique: false,
                    fields: ['name']
                },
            ]
        });

    Person.associate = function(models){
        Person.belongsToMany(models.movies, {through: 'cast'});
    };

    return Person;
};