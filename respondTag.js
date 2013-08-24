exports.respondTag = respondTag;

var url = require('url');

var tags = {};
var clientList = {};

function respondTag(req, res) {
	console.log(req.url);
	var reqUrl = url.parse(req.url, true);
	
	var action = reqUrl.query['action'];
	var pathname = reqUrl.query['pathname'];

	if (pathname === undefined) {
		badRequest();
		return;
	}

	if (action === 'get') {
		get();
	} else if (action === 'set') {
		set();
	} else {
		badRequest();
	}

	function badRequest() {
		res.statusCode = 400;
		res.end();
	}

	function get() {
		var value = reqUrl.query['value'];
		var currentValue = tags[pathname] || '';

		if (value === undefined) {
			// 立即返回当前值
			respond(currentValue, res);
		} else {
			// 可能需要延迟返回
			if (value === currentValue) {
				// 值相同，暂不返回
				// 记录下客户端请求，放入列表
				addClient(pathname, res);
			} else {
				// 值不同，立即返回，不放入队列
				respond(currentValue, res);
			}
		}
	}

	function set() {
		var value = reqUrl.query['value'];

		if (value === undefined) {
			badRequest();
			return;
		}

		var oldValue = tags[pathname] || '';
		if (oldValue !== value) {
			tags[pathname] = value;
			// 通知队列里的客户端 tag 值已经发生了变化
			releaseClients(pathname);
		}

		// 返回当前值
		respond(oldValue, res);
	}
}

function addClient(pathname, res) {
	if (clientList[pathname] === undefined) {
		clientList[pathname] = [];
	}

	clientList[pathname].push(res);
}

function releaseClients(pathname) {
	var resList = clientList[pathname];
	var value = tags[pathname];
	if (resList) {
		while (resList.length > 0) {
			var res = resList.pop();
			respond(value, res);
		}
	}
}

function respond(tagValue, res) {
	try {
		res.setHeader('Content-Type', 'text/plain;charset=UTF-8');
		res.setHeader('Content-Length', Buffer.byteLength(tagValue));
		res.end(tagValue);
	} catch(err) {
		console.log('[respond] ' + err.toString());
	}
}