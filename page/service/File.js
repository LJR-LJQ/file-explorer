// [导出]
exports.serviceName = 'File';
exports.queryFileInfo = queryFileInfo;

// [模块]
var fs = require('fs');

// [函数]
function queryFileInfo(args, callback) {
	var filePathAbs;

	filePathAbs = args.filePathAbs;
	if (typeof filePathAbs !== 'string' || filePathAbs === '') {
		callback({error: 'filePathAbs must be string and not empty'});
		return;
	}

	filePathAbs = convertPath(filePathAbs);

	fs.lstat(filePathAbs, function(err, stats) {
		if (err) {
			callback({error: err.toString()});
			return;
		}

		var result = {
			size: stats.size,
			atime: stats.atime.toISOString(),
			mtime: stats.mtime.toISOString(),
			ctime: stats.ctime.toISOString()
		};

		callback(result);
	});

	function convertPath(path) {
		if (!path) return path;
		return path.replace(/^(\/([a-zA-Z]))(\/|$)/, "$2:/");
	}
}