var fs = require('fs');

exports.deleteFile = deleteFile;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function deleteFile(filePathAbs, scb, fcb) {

	// 【过程】
	try {
		if(!fs.statSync(filePathAbs).isFile()) {
			throw 'The path is not a file';
		}
	} catch(err) {
		fcb(); // 文件不存在，权限问题，该路径不是有意义的文件；
		return;
	}

	fs.unlink(filePathAbs, function (err) {
		if (err) {
			fcb();
			return;
		}
		scb(filePathAbs);
		return;
	});
}