exports.respond = respond;
exports.def = {
	get: ['/remote']
};

var path = require('path'),
	respondPage = require('./lib/respondPage').respondPage;

function respond(req, res) {
	// 根据模板生成内容返回
	respondPage('remote.kl', new Data(), req, res);
}

function Data() {
}
