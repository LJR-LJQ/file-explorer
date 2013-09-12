var fs = require('fs');

exports.deleteDir = deleteDir;

// 【功能】
// 待编写

// 【参数】
// pcb(filePathAbs, currentFileSize, currentFileCount);
// scb(dirPathAbs, currentFileSize, currentFileCount);

// 【返回值】
// 待编写

// 【备注】
// 待编写

function deleteDir(dirPathAbs, scb, pcb, fcb) {
	// 【过程】
	fs.stat(dirPathAbs, function(err, stats){
		if(err || !stats.isDirectory()) {
			fcb();
			return;
		}
		doDelete(dirPathAbs, scb, pcb, fcb);
	});

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