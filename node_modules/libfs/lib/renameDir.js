var fs = require('fs');
var path = require('path');

exports.renameDir = renameDir;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function renameDir(dirPathAbs, newName, scb, fcb) {
	// 【变量】
	var baseName, dirName, newPath;

	// 【过程】
	fs.stat(dirPathAbs, function(err, stats){
		if(err || !stats.isDirectory()) {
			fcb();
			return;
		}
		baseName = path.basename(dirPathAbs);
		dirName = path.dirname(dirPathAbs);
		newPath = dirName + '/' + newName;

		fs.rename(dirPathAbs, newPath, function (err) {
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