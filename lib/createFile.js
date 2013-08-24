var fs = require('fs');

exports.createFile = createFile;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function createFile(dirPathAbs, fileName, scb, fcb) {
	// 【参数】
	var filePathAbs;

	// 【过程】
	try {
		if(!fs.statSync(dirPathAbs).isDirectory()) {
			throw 'The path is not a directory';
		}
	} catch(err) {
		fcb(); // 目录不存在，权限问题，该路径不是有意义的目录；
		return;
	}

	filePathAbs = dirPathAbs + '/' + fileName;
	fs.exists(filePathAbs, function(exists){
		if (exists) {
			fcb(); // 文件已存在
			return;
		} else {
			fs.createWriteStream(filePathAbs);
			scb(filePathAbs);
			return;
		}
	});
}