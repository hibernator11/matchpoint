'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Author = mongoose.model('Author'),
    _ = require('lodash');

require('mongoose-query-paginate');

/**
 * Create a author
 */
exports.create = function(req, res) {
    var author = new Author(req.body);
    author.user = req.user;

    author.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(author);
        }
    });
};

/**
 * Show the current author
 */
exports.read = function(req, res) {
    res.json(req.author);
};

/**
 * Update a author
 */
exports.update = function(req, res) {
    var author = req.author;
    author.user = req.user;
    
    author = _.extend(author, req.body);

    author.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(author);
        }
    });
};

/**
 * Delete an author
 */
exports.delete = function(req, res) {
    var author = req.author;

    author.remove(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(author);
        }
    });
};

/**
 * List of Authors
 */
exports.list = function(req, res) {

    var options = {
        perPage: 10,
        delta  : 3,
        page   : req.query.p
    };

    var query = Author.find();

    if(req.query.state)
        query = query.and({state: req.query.state});

    if(req.query.text && req.query.text !== '')
        query = query.and({prefered: new RegExp(req.query.text, 'i')});
    
    if(req.query.order && req.query.order !== '')
        query.sort(req.query.order);

    query.paginate(options, function(err, authors) {
        console.log(authors); // => authors = {
        //  options: options,               // paginate options
        //  results: [Document, ...],       // mongoose results
        //  current: 5,                     // current page number
        //  last: 12,                       // last page number
        //  prev: 4,                        // prev number or null
        //  next: 6,                        // next number or null
        //  pages: [ 2, 3, 4, 5, 6, 7, 8 ], // page numbers
        //  count: 125                      // document count
    //};

    if (err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
    });
    } else {

        res.writeHead(200, {'Content-Type': 'application/json'});
        var json = JSON.stringify([{ 
            results: authors.results,
            current: authors.current,
            last: authors.last,
            prev: authors.prev,
            next: authors.next,
            count: authors.count
        }]);
        console.log(json);
        res.end(json);
    }
});
};

/**
 * Author middleware
 */
exports.authorByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            message: 'Author is invalid'
        });
    }

    Author.findById(id).populate('user', 'displayName').exec(function(err, author) {
        if (err) return next(err);
        if (!author) {
            return res.status(404).send({
                message: 'Author not found'
            });
        }
        req.author = author;
        next();
    });
};

/**
 * Author authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
    /*if (req.author.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }*/
    next();
};
