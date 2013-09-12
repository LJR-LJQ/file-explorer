exports.respond = respond;
exports.def = {
	get: ['/dir-manage']
};

var path = require('path');
var respondPage = require('./lib/respondPage').respondPage;

function respond(req, res) {
	var reqUrl = require('url').parse(req.url, true);
	respondPage('dir-manage.kl', new Data(), req, res);
}

function Data() {
	return this;
}