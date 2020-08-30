const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();
var authenticate = require('../authenticate');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorites.find({user:req.user._id})
    .populate('user').populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user:req.user._id})
    .then((favorites) => {
        if(favorites.length == 0){
            Favorites.create({user:req.user._id, dishes:Array.from(req.body, x=> x['_id'])})
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }else{
            let dishes = Array.from(req.body, x=> x['_id']);
            dishes.forEach(dish => {
                if(favorites[0]._doc.dishes.indexOf(dish)===-1){
                    favorites[0]._doc.dishes.push(dish);
                }
            });
            favorites[0].save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user:req.user._id})
    .then((favorite) => {
        Favorites.findByIdAndRemove(favorite[0]._doc._id)
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    res.statusCode = 403;
    res.end('Get operation not supported on /favorites/'+req.params.dishId);
})
.post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user:req.user._id})
    .then((favorites) => {
        if(favorites.length == 0){
            Favorites.create({user:req.user._id, dishes:[req.params.dishId]})
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }else{
            if(favorites[0]._doc.dishes.indexOf(req.params.dishId)===-1){
                favorites[0]._doc.dishes.push(req.params.dishId);
            }
            favorites[0].save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('Get operation not supported on /favorites/'+req.params.dishId);
})
.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.find({user:req.user._id})
    .then((favorites) => {
        if(favorites.length > 0){
            favoritesFilter = favorites[0]._doc.dishes.filter(favorite => favorite !=req.params.dishId);
            favorites[0]._doc.dishes.remove();
            favorites[0]._doc.dishes=favoritesFilter;
            favorites[0].save()
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;