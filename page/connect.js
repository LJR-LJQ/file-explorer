exports.respond = respond;
exports.def = {
	'get': ['/connect']
};

var respondPage = require('./lib/respondPage').respondPage;

function respond(req, res) {
	// 根据模板生成内容返回
	respondPage('connect.kl', new Data(), req, res);
}

function Data() {
}