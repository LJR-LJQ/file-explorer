var fs = require('fs');

exports.deleteDir = deleteDir;

// 【功能】
// 待编写

// 【参数】
// 待编写

// 【返回值】
// 待编写

// 【备注】
// 待编写

function deleteDir(dirPathAbs, scb, fcb) {
	// 【过程】
	try {
		if(!fs.statSync(dirPathAbs).isDirectory()) {
			throw 'The path is not a directory';
		}
	} catch(err) {
		fcb(); // 目录不存在，权限问题，该路径不是有意义的目录；
		return;
	}

	process.nextTick(function(){
		doDelete(dirPathAbs, scb, fcb);
	});

	// 【函数】
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

deleteDir('d:/kankan2', function(){}, function(){});