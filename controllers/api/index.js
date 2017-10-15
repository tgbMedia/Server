const express = require('express'),
      models = require('models'),
      tmdbConfig = require('config/tmdb');

const router = express.Router();

router.use((req, res, next) => {
    console.log('%s %s %s', req.method, req.url, req.path);

    let send = res.send;

    res.send = function(string) {
        //send.call(this, body);

        let response = JSON.parse(string);

        if(!response.results)
        {
            response = {
                results: response
            };
        }

        send.call(this, JSON.stringify(response));
    };

    next();
});


router.get('/movies/list', function(req, res) {
    models.utils.getMediaItems('movies')
        .then(movies => {
            res.json(movies.map(movie => {
                movie.poster_path = `/assets/${movie.id}/${tmdbConfig.posterFileName}`;
                movie.backdrop_path = `/assets/${movie.id}/${tmdbConfig.backdropFileName}`;

                delete movie.mediaFiles;

                return movie;
            }));
        })
        .catch(() => res.json([]));
});


module.exports = router;