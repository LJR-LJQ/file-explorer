exports.respond = respond;
exports.def = {
	post: ['/service']
};

var serviceManager = require('./lib/service-manager.js');

// 让 serviceManager 随处可用
global.serviceManager = serviceManager;

function respond(req, res) {
	var jsonReqObj = req.body;
	if (!jsonReqObj) {
		res.statusCode = 400;
		res.end();
		return;
	}

	serviceManager.dispatch(jsonReqObj, cb, req, res);

	function cb(jsonResObj) {
		var text = JSON.stringify(jsonResObj);
		// console.log('# respond');
		// console.log(text);
		// console.log('');
		var length = Buffer.byteLength(text, 'utf8');
		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.setHeader('Content-Length', length);
		res.end(text);
	}
}