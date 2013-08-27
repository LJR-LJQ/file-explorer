exports.respond = respond;

var path = require('path');
var respondPage = require('./respondPage').respondPage;

function respond(req, res) {
	var reqUrl = require('url').parse(req.url, true);
	respondPage('dir-manage.kl', new Data(), req, res);
}

function Data() {
	return this;
}