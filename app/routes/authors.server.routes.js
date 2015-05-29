'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	authors = require('../../app/controllers/authors.server.controller');

module.exports = function(app) {
	// Article Routes
	app.route('/authors')
		.get(authors.list)
		.post(users.requiresLogin, authors.create);

	app.route('/authors/:authorId')
		.get(authors.read)
		.put(users.requiresLogin, authors.hasAuthorization, authors.update)
		.delete(users.requiresLogin, authors.hasAuthorization, authors.delete);

	// Finish by binding the author middleware
	app.param('authorId', authors.authorByID);
};
