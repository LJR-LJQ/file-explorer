exports.respond = respond;
exports.def = {
	'get': ['/', '/index']
};

var path = require('path'),
	respondPage = require('./lib/respondPage').respondPage;

function respond(req, res) {
	// 根据模板生成内容返回
	respondPage('index.kl', new Data(), req, res);
}

function redirectToIndex(req, res) {
	res.statusCode = 301;
	res.setHeader('Location', '/index');
	res.end();
}

function Data() {
}