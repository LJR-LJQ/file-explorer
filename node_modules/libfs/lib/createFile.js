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
	fs.stat(dirPathAbs, function(err, stats){
		if(err || !stats.isDirectory()) {
			fcb();
			return;
		}
		filePathAbs = dirPathAbs + '/' + fileName;
		fs.exists(filePathAbs, function(exists){
			if (exists) {
				fcb(); // 文件已存在
				return;
			} else {
				fs.createWriteStream(filePathAbs).end();
				scb(filePathAbs);
				return;
			}
		});
	});
}