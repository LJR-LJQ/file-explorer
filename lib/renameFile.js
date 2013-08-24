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
	try {
		if(!fs.statSync(filePathAbs).isFile()) {
			throw 'The path is not a file';
		}
	} catch(err) {
		fcb(); // 文件不存在，权限问题，该路径不是有意义的文件；
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
}