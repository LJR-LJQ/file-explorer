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
	fs.stat(filePathAbs, function(err, stats){
		if(err || !stats.isFile()) {
			fcb();
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
	});
}