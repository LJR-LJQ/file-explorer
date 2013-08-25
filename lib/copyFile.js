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
	try {
		if(!fs.statSync(srcFilePathAbs).isFile()) {
			throw 'The path is not a File';
		}
	} catch(err) {
		fcb(); // 文件不存在，权限问题，该路径不是有意义的文件；
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
			});

			return;
		}
	});
}