var fs = require('fs');

exports.moveDir = moveDir;

// 【功能】
// 待编写

// 【参数】
// cpcb(srcFilePathAbs, targetFilePathAbs, currentFileSize, currentFileCount); 拷贝进度回调
// dpcb(filePathAbs, currentFileSize, currentFileCount); 删除进度回调
// scb(srcDirPathAbs, targetDirPathAbs);

// 【返回值】
// 待编写

// 【备注】
// 待编写

function moveDir(srcDirPathAbs, targetDirPathAbs, scb, cpcb, dpcb, fcb) {
	// 【过程】
	fs.stat(srcDirPathAbs, function(err, stats){
		if(err || !stats.isDirectory()) {
			fcb();
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
					}, dpcb, fcb);
				}, cpcb, fcb);
			}
		});
	});

	// 【函数】
	function doCopyDir(srcDirPathAbs, targetDirPathAbs, scb, pcb, fcb, fileQueue, currentFileSize, currentFileCount){
		// 【参数】
		var index;
		// 【过程】
		fileQueue = fileQueue || [];
		currentFileSize = currentFileSize || 0;
		currentFileCount = currentFileCount || 0;
		fs.mkdir(targetDirPathAbs, 0777, function(err){
			if(err) {
				fcb();
				return;
			}
			fs.readdir(srcDirPathAbs, function(err, files){
				if(err) {
				fcb();
					return;
				}
				for(index = 0; index < files.length; index++) {
					fileQueue.push({
						file: files[index],
						srcDirPathAbs: srcDirPathAbs,
						targetDirPathAbs: targetDirPathAbs
					});
				}
				doCopyFile(fileQueue, currentFileSize, currentFileCount, scb, pcb, fcb);
				return;
			});
		});

		
	}

	function doCopyFile(fileQueue, currentFileSize, currentFileCount, scb, pcb, fcb){
		// 【参数】
		var file, srcFilePathAbs, targetFilePathAbs, readStream, writeStream;
		// 【过程】

		file = fileQueue.shift();
		if(typeof file == 'undefined' || file == 'undefined') {
			scb(currentFileSize, currentFileCount);
			return;
		}

		srcFilePathAbs = file.srcDirPathAbs + '/' + file.file;
		targetFilePathAbs = file.targetDirPathAbs + '/' + file.file;

		fs.stat(srcFilePathAbs, function(err, stats){
			if(err) {
				fcb();
				return;
			}
			if(stats.isDirectory()) {
				doCopyDir(srcFilePathAbs, targetFilePathAbs, scb, fcb, fileQueue, currentFileSize, currentFileCount);
			} else if(stats.isFile()) {
				readStream = fs.createReadStream(srcFilePathAbs);
				writeStream = fs.createWriteStream(targetFilePathAbs);
				readStream.pipe(writeStream);
				readStream.on('end', function(chunk) {
					currentFileSize += stats.size;
					currentFileCount += 1;
					pcb(srcFilePathAbs, targetFilePathAbs, currentFileSize, currentFileCount);
					doCopyFile(fileQueue, currentFileSize, currentFileCount, scb, pcb, fcb);
				});
			}
		});
	}

	// 【函数】
	function doDelete(dirPathAbs, scb, pcb, fcb, currentFileSize, currentFileCount) {
		// 【参数】
		var index, files, file, filePathAbs, stats;
		// 【过程】
		currentFileCount = currentFileCount || 0;
		try {
			files = fs.readdirSync(dirPathAbs);
			for(index = 0; index < files.length; index++) {
				file = files[index];
				filePathAbs = dirPathAbs + '/' + file;
				stats = fs.statSync(filePathAbs);
				if(stats.isDirectory()) {
					doDelete(filePathAbs, function(){}, pcb, function(){});
				} else if(stats.isFile()) {
					fs.unlinkSync(filePathAbs);
					currentFileSize += stats.size;
					currentFileCount += 1;
					pcb(filePathAbs, currentFileSize, currentFileCount);
				}
			}
			fs.rmdirSync(dirPathAbs);
		} catch(err) {
			fcb();
			return;
		}
		
		scb(dirPathAbs, currentFileSize, currentFileCount);
		return;
	}
}