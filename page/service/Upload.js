// [导出]
exports.serviceName = 'Upload';
exports.uploadFile = uploadFile;

// [模块]
var rpc = require('./lib/rpc').rpc;
var fs = require('fs'),
	path = require('path'),
	http = require('http');

// [变量]
var uploadToUrlBase = 'http://127.0.0.1/upload';
//var uploadToUrlBase = 'http://miaodeli.com/upload';

// [函数]
function uploadFile(args, callback) {
	var filePathAbs,
		tunnelId,
		fileName,
		fileSize;

	tunnelId = args.tunnelId;
	filePathAbs = args.filePathAbs;

	if (typeof tunnelId !== 'string' || tunnelId === '') {
		callback({error: 'tunnelId must be string and not empty'});
		return;
	}

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

		// 开始发送文件
		uploadFile();
	});

	function uploadFile() {
		var uploadToUrl,
			req;

		// 构造出请求地址
		uploadToUrl = uploadToUrlBase + '?tunnelId=' + tunnelId;

		console.log('upload file to: ' + uploadToUrl);

		// 创建 HTTP 请求
		req = http.request(uploadToUrl);
		req.method = 'PUT';
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
			console.log('file upload server respond: ' + res.statusCode);
		}
	}
}

function convertPath(path) {
	if (!path) return path;
	return path.replace(/^(\/([a-zA-Z]))(\/|$)/, "$2:/");
}