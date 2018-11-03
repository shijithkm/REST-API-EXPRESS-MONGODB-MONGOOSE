const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());


favoriteRouter.route('/')
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({
                user: req.user._id
            })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.findOne({
            user: req.user._id
        }).then((fav) => {

            // Check fav is already exits 
            if (fav !== null) {
                let favDishes;
                req.body.forEach(dish => {
                    if (fav.dishes.indexOf(dish._id) == -1) {
                        fav.dishes.push(dish);
                    }
                });
                fav.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);

                    }, (err) => next(err))
                    .catch((err) => next(err));

            } else {

                let fav = {
                    "user": req.user._id,
                    "dishes": req.body
                }
                Favorites.create(fav)
                    .then((favorites) => {
                        console.log('Favorites Created ', favorites);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }

        }, (err) => (next(err))).catch((err) => next(err));

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({
                user: req.user._id
            })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /favorites');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Favorites.findOne({
            user: req.user._id
        }).then((fav) => {

            if (fav !== null) {

                if (fav.dishes.indexOf(req.params.dishId) == -1) {
                    fav.dishes.push(req.params.dishId);
                }
                fav.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);

                    }, (err) => next(err))
                    .catch((err) => next(err));

            } else {

                let fav = {
                    "user": req.user._id,
                    "dishes": [req.params.dishId]
                }
                Favorites.create(fav)
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    }, (err) => next(err))
                    .catch((err) => next(err));

            }

        }, (err) => (next(err))).catch((err) => next(err));

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/' +
            req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
            user: req.user._id
        }).then((fav) => {

            if (fav !== null) {

                if (fav.dishes.indexOf(req.params.dishId) != -1) {
                    fav.dishes.remove(req.params.dishId);
                }
                fav.save()
                    .then((fav) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fav);

                    }, (err) => next(err))
                    .catch((err) => next(err));
            }

        }, (err) => (next(err))).catch((err) => next(err));
    })

module.exports = favoriteRouter;