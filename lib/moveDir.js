var fs = require('fs');

exports.moveDir = moveDir;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function moveDir(srcDirPathAbs, targetDirPathAbs, scb, fcb) {
	// 【过程】
	try {
		if(!fs.statSync(srcDirPathAbs).isDirectory()) {
			throw 'The path is not a directory';
		}
	} catch(err) {
		fcb(); // 目录不存在，权限问题，该路径不是有意义的目录；
		return;
	}

	fs.exists(targetDirPathAbs, function(exists){
		if (exists) {
			fcb(); // 同名文件或目录已存在
			return;
		} else {
			doCopyDir(srcDirPathAbs, targetDirPathAbs, function(){
				doDelete(srcDirPathAbs, function(){
					scb(srcDirPathAbs, targetDirPathAbs);
					return;
				}, fcb);
			}, fcb);
		}
	});

	// 【函数】
	function doCopyDir(srcDirPathAbs, targetDirPathAbs, scb, fcb, fileQueue){
		// 【参数】
		var index, files;
		// 【过程】
		fs.mkdirSync(targetDirPathAbs);
		fileQueue = fileQueue || [];
		files = fs.readdirSync(srcDirPathAbs);
		for(index = 0; index < files.length; index++) {
			fileQueue.push({
				file: files[index],
				srcDirPathAbs: srcDirPathAbs,
				targetDirPathAbs: targetDirPathAbs
			});
		}
		doCopyFile(fileQueue, scb, fcb);
		return;
	}

	function doCopyFile(fileQueue, scb, fcb){
		// 【参数】
		var file, srcFilePathAbs, targetFilePathAbs, readStream, writeStream;
		// 【过程】

		file = fileQueue.shift();
		if(typeof file == 'undefined' || file == 'undefined') {
			scb();
			return;
		}
		try {
			srcFilePathAbs = file.srcDirPathAbs + '/' + file.file;
			targetFilePathAbs = file.targetDirPathAbs + '/' + file.file;
			if(fs.statSync(srcFilePathAbs).isDirectory()) {
				doCopyDir(srcFilePathAbs, targetFilePathAbs, scb, fcb, fileQueue);
			} else {
				readStream = fs.createReadStream(srcFilePathAbs);
				writeStream = fs.createWriteStream(targetFilePathAbs);
				readStream.pipe(writeStream);
				readStream.on('end', function(chunk) {
					doCopyFile(fileQueue, scb, fcb);
				});
			}
		} catch(err) {
			fcb();
			return;
		}
	}

	function doDelete(dirPathAbs, scb, fcb) {
		// 【参数】
		var index, files, file, filePathAbs;
		// 【过程】
		var files = fs.readdirSync(dirPathAbs);
		for(index = 0; index < files.length; index++) {
			file = files[index];
			try {
				filePathAbs = dirPathAbs + '/' + file;
				if(fs.statSync(filePathAbs).isDirectory()) {
					doDelete(filePathAbs, function(){}, function(){});
				} else {
					fs.unlinkSync(filePathAbs);
				}
			} catch(err) {
				fcb();
				return;
			}
		}
		fs.rmdirSync(dirPathAbs);
		scb(dirPathAbs);
		return;
	}
}