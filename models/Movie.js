module.exports = function(sequelize, Sequelize) {
    let Movie = sequelize.define("movies", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        adult: Sequelize.BOOLEAN,
        backdrop_path: Sequelize.STRING,
        budget: Sequelize.INTEGER,
        genres: Sequelize.STRING,
        homepage: Sequelize.STRING,
        imdb_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            unique: true
        },
        original_language: Sequelize.STRING,
        original_title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        overview: Sequelize.STRING,
        popularity: Sequelize.FLOAT,
        poster_path: Sequelize.STRING,
        release_date: Sequelize.DATE,
        revenue: Sequelize.INTEGER,
        runtime: Sequelize.INTEGER,
        tagline: Sequelize.STRING,
        title: Sequelize.STRING,
        video: Sequelize.BOOLEAN,
        vote_average: Sequelize.FLOAT,
        vote_count: Sequelize.INTEGER
    });

    Movie.associate = function(models){
        Movie.belongsToMany(models.person, {through: 'cast'});
    };

    return Movie;
};