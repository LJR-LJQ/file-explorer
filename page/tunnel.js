// [导出]
exports.respond = respond;
exports.def = {
	get: ['/download'],
	put: ['/upload']
};

// [模块]
var url = require('url'),
	fs = require('fs'),
	path = require('path');

var IdTable = require('./service/lib/id-table');

// [变量]
var tunnelTable = IdTable.create();

// [函数]
function respond(req, res) {
	var reqUrl;

	reqUrl = url.parse(req.url, true);

	if (req.method === 'GET') {
		downloadFile();
	} else if (req.method === 'PUT') {
		uploadFile();
	} else {
		// 不应当出现这种情况
		// Method Not Allowed
		res.statusCode = 405;
		res.end();
	}

	function downloadFile() {
		var hostId,
			token,
			filePathAbs,
			tunnelId,
			serviceObj;

		// hostId, token, filePathAbs 这三个参数必须给出
		hostId = reqUrl.query['hostId'];
		token = reqUrl.query['token'];
		filePathAbs = reqUrl.query['filePathAbs'];

		if (!hostId || !token || !filePathAbs) {
			res.statusCode = 404;
			res.end();
		}

		// 先将本条请求记录到表中
		var tunnelId = tunnelTable.add({
			res: res,
			fileName: path.basename(filePathAbs)
		});

		// 请求客户端上传文件
		serviceObj = Between_sendRequest(hostId, Authorization_dispatch(token, Upload_uploadFile(filePathAbs, tunnelId.toString())));
		serviceManager.dispatch(serviceObj, sendRequestSuccess, sendRequestFailure);

		function sendRequestSuccess() {
			// 什么也不做
		}

		function sendRequestFailure(err) {
			// 返回 404
			res.statusCode = 404;
			res.end();
		}
	}

	function uploadFile() {
		var tunnelId,
			tunnel,
			contentLength;

		tunnelId = reqUrl.query['tunnelId'];

		// tunnelId 必须提供
		if (!tunnelId) {
			// Bad Request
			res.statusCode = 400;
			res.end();
			return;
		}

		// 根据 tunnelId 进行查询
		tunnel = tunnelTable.get(tunnelId);
		if (!tunnel) {
			// Bad Request
			res.statusCode = 400;
			res.end();
			return;
		}

		// Content-Length 必须提供
		contentLength = req.headers['content-length'];
		if (!contentLength) {
			// Length Required
			res.statusCode = 411;
			res.end();
			return;
		}

		contentLength = parseInt(contentLength);

		// 在开始转发之前，首先先把 HTTP 头部字段返回
		tunnel.res.statusCode = 200;
		tunnel.res.setHeader('Content-Type', 'application/octet-stream');
		tunnel.res.setHeader('Content-Length', contentLength);
		tunnel.res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(tunnel.fileName));

		// 注意处理浏览器突然断开这种情况
		tunnel.res.once('close', onBrowserTunnelClose);

		// 开始转发
		req.pipe(tunnel.res);

		function onBrowserTunnelClose() {
			// 既然浏览器断开了，那么也断开和计算机的连接
			// Gateway timeout
			res.statusCode = 504;
			res.end();
		}
	}
}

function Between_sendRequest(hostId, req) {
	return {
		funcName: 'Between.sendRequest',
		args: {
			hostId: hostId,
			req: req
		}
	}
}

function Authorization_dispatch(token, req) {
	return {
		funcName: 'Authorization.dispatch',
		args: {
			token: token,
			req: req
		}
	}
}

function Upload_uploadFile(filePathAbs, tunnelId) {
	return {
		funcName: 'Upload.uploadFile',
		args: {
			filePathAbs: filePathAbs,
			tunnelId: tunnelId
		}
	}
}