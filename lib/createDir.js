var fs = require('fs');

exports.createDir = createDir;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function createDir(dirPathAbs, dirName, scb, fcb) {
	// 【参数】
	var newDirPathAbs;

	// 【过程】
	try {
		if(!fs.statSync(dirPathAbs).isDirectory()) {
			throw 'The path is not a directory';
		}
	} catch(err) {
		fcb(); // 目录不存在，权限问题，该路径不是有意义的目录；
		return;
	}

	newDirPathAbs = dirPathAbs + '/' + dirName;
	fs.exists(newDirPathAbs, function(exists){
		if(exists) {
			fcb();
			return;
		} else {
			fs.mkdir(newDirPathAbs, 0777, function(err){
				if(err) {
					fcb();
					return;
				}
				scb(newDirPathAbs);
				return;
			});
		}
	});
}