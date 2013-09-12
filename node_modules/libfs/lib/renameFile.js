var fs = require('fs');
var path = require('path');

exports.renameFile = renameFile;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function renameFile(filePathAbs, newName, scb, fcb) {
	// 【变量】
	var baseName, dirName, newPath;

	// 【过程】
	fs.stat(filePathAbs, function(err, stats){
		if(err || !stats.isFile()) {
			fcb();
			return;
		}
		baseName = path.basename(filePathAbs);
		dirName = path.dirname(filePathAbs);
		newPath = dirName + '/' + newName;

		fs.rename(filePathAbs, newPath, function (err) {
			if (err) {
				fcb(err);
				return;
			}
			fs.stat(newPath, function (err, stats) {
				if (err) {
					fcb(err);
					return;
				}
				scb(baseName, newName);
				return;
			});
		});
	});
}