exports.checkLogin = checkLogin;

var crypto = require('crypto');

function checkLogin(reqUrl, req, res) {
	// 开发过程里暂时不启用此功能
	return true;

	var auth = req.headers['authorization'];
	var match;

	match = /^Basic ([^$]+)$/g.exec(auth);
	if (!match || !match[1]) {
		return false;
	}

	auth = decodeBase64(match[1]);
	console.log(auth);
	return auth === 'miaodeli:';
}

function decodeBase64(text) {
	var b = new Buffer(text, 'base64');
	return b.toString('utf8');
}