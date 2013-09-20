// [导出]
exports.respond = respond;
exports.def = {
	get: ['/tunnel'],
	put: ['/tunnel']
};

// [模块]
var url = require('url'),
	fs = require('fs'),
	path = require('path');

function respond(req, res) {
	var reqUrl,
		id;

	// id 参数必须给出
	reqUrl = url.parse(req.url, true);

	id = reqUrl.query['id'];
	if (id === undefined || id === null) {
		res.statusCode = 404;
		res.end();
	}

	// 查询 id 对应的信息
	queryTunnelInfo(id, queryTunnelInfoSuccess, queryTunnelInfoFailure);

	function queryTunnelInfoSuccess(info) {
		// 查询成功，根据客户端请求不同
		// 接收文件或者发送文件
		if (req.method === 'GET') {
			respondFile();
		} else if (req.method === 'PUT') {
			receiveFile();
		}

		function respondFile() {
			console.log('respond file');
			res.end('respond file. todo');
		}

		function receiveFile() {
			console.log('receive file');
			var fileName = id + ' ' + info.fileName + ' ' + info.fileSize;
			fileName = path.resolve(__dirname, '../tmp/', fileName);
			debugger;
			var wstream = fs.createWriteStream(fileName);
			req.pipe(wstream);
		}

	}

	function queryTunnelInfoFailure(err) {
		// 没有找到 id 对应的信息
		res.statusCode = 404;
		res.end();
	}
}

function queryTunnelInfo(id, scb, fcb) {
	serviceManager.dispatch({
		funcName: 'Tunnel.query',
		args: {
			id: id
		}
	}, scb, fcb);
}