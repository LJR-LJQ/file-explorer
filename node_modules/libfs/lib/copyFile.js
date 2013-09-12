var fs = require('fs');

exports.copyFile = copyFile;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function copyFile(srcFilePathAbs, targetFilePathAbs, scb, fcb) {
	// 【参数】
	var readStream, writeStream;

	// 【过程】
	fs.stat(srcFilePathAbs, function(err, stats){
		if(err || !stats.isFile()) {
			fcb();
			return;
		}
		fs.exists(targetFilePathAbs, function(exists){
			if (exists) {
				fcb(); // 文件已存在
				return;
			} else {
				readStream = fs.createReadStream(srcFilePathAbs);
				writeStream = fs.createWriteStream(targetFilePathAbs);
				readStream.pipe(writeStream);
				readStream.on('end', function(chunk) {
					scb(srcFilePathAbs, targetFilePathAbs);
					return;
				});
			}
		});
	});
}