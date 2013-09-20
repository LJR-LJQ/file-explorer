// [导出]
exports.serviceName = 'Download';
exports.downloadFile = downloadFile;

// [模块]
var rpc = require('./lib/rpc').rpc;
var fs = require('fs'),
	path = require('path'),
	http = require('http');

// [变量]
// var serverUrl = 'http://www.miaodeli.com/service',
// 	tunnelUrlBase = 'http://www.miaodeli.com/tunnel';
var serverUrl = 'http://127.0.0.1/service',
	tunnelUrlBase = 'http://127.0.0.1/tunnel';

// [函数]
function downloadFile(args, callback) {
	var filePathAbs,
		fileName,
		fileSize;

	filePathAbs = args.filePathAbs;

	if (typeof filePathAbs !== 'string' || filePathAbs === '') {
		callback({error: 'filePathAbs must be string and not empty'});
		return;
	}

	filePathAbs = convertPath(filePathAbs);

	if (!fs.existsSync(filePathAbs)) {
		callback({error: 'file not exists, filePathAbs=' + filePathAbs});
		return;
	}

	// 获取文件名以及文件大小
	fs.lstat(filePathAbs, function(err, stat) {
		if (err) {
			callback({error: 'lstat failed'});
			return;
		}

		fileName = path.basename(filePathAbs);
		fileSize = stat.size;

		// 在发送文件前，需要先向服务器申请一个隧道
		rpc(serverUrl, 'Tunnel.register', {
			fileName: fileName,
			fileSize: fileSize
		}, registerTunnelSuccess, registerTunnelFailure);
	});

	function registerTunnelSuccess(result) {
		var tunnelUrl,
			req;

		// 将隧道信息返回给客户端
		callback(result);

		// 开始上传
		tunnelUrl = tunnelUrlBase + '?id=' + encodeURIComponent(result.tunnelId);

		// 创建 HTTP 请求
		req = http.request(tunnelUrl);
		req.method = 'PUT';debugger;
		req.setHeader('Content-Length', fileSize);
		req.setHeader('Content-Type', 'application/octet-stream');
		req.on('response', onResponse);
		req.on('error', onError);

		// 写入数据
		var stream = fs.createReadStream(filePathAbs);
		stream.on('error', onError);
		stream.pipe(req);

		function onError(err) {
			console.log('upload file failed: ' + err.toString());
		}

		function onResponse(res) {
			console.log('file uploaded.');
		}
	}

	function registerTunnelFailure(err) {
		callback({error: 'register tunnel failed'});
	}
}

function convertPath(path) {
	if (!path) return path;
	return path.replace(/^(\/([a-zA-Z]))(\/|$)/, "$2:/");
}