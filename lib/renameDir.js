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
	try {
		if(!fs.statSync(dirPathAbs).isDirectory()) {
			throw 'The path is not a directory';
		}
	} catch(err) {
		console.log(err);
		fcb(); // 目录不存在，权限问题，该路径不是有意义的目录；
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
}