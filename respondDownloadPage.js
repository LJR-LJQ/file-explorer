exports.respondDownloadPage = respondDownloadPage;

var fs = require('fs'),
	pathTool = require('path');

function respondDownloadPage(reqUrl, req, res) {
	var path = reqUrl.query['path'];
	fs.open(path, 'r+', function(err, fd) {
		if (err) {
			console.log('[respondDownloadPage] ' + err.toString());
			res.statusCode = 404;
			res.end();
			return;
		}

		respondFile(fd);
	});

	function respondFile(fd) {
		var filename,
			size;

		// 获取文件的尺寸信息
		fs.fstat(fd, function(err, stat) {
			if (err) {
				console.log('[respondFile] ' + err.toString());
				res.statusCode = 404;
				res.end();
				return;
			}

			size = stat.size;
			filename = pathTool.basename(path);

			// 设定响应的 header
			res.setHeader('Content-Length', size.toString());
			res.setHeader('Content-Type', 'application/octet-stream');
			res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));

			// 开始读取并发送文件内容
			pipeFile(fd, res);
		});

		function pipeFile(fd, res) {
			var fileReadStream = fs.createReadStream(undefined, {
				flags: 'r+',
				fd: fd,
				start: 0,
				end: size - 1,
			});

			fileReadStream.once('end', closeFd);
			fileReadStream.once('error', closeFd);

			fileReadStream.pipe(res);

			function closeFd() {
				console.log('close fd');
				fs.close(fd, function() {});
			}
		}
	}
}