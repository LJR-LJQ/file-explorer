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
	fs.stat(dirPathAbs, function(err, stats){
		if(err || !stats.isDirectory()) {
			fcb();
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
	});
}