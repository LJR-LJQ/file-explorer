exports.respond = respond;

var path = require('path'),
	respondPage = require('./respondPage').respondPage;

function respond(req, res) {
	// 根据模板生成内容返回
	respondPage('index.kl', new Data(), req, res);
}

function Data() {
	return this;
}