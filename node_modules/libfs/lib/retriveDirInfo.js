var fs = require('fs');
var path = require('path');

exports.retriveDirInfo = retriveDirInfo;

// 【功能】
// 待编写

// 【参数】
// scb(path.basename(dirPathAbs), stats.ctime, stats.mtime, stats.atime); 函数成功结束后回调
// fcb(); 函数出现错误时回调

// 【返回值】
// 待编写

// 【备注】
// 待编写

function retriveDirInfo(dirPathAbs, scb, fcb) {
	// 【过程】
	fs.stat(dirPathAbs, function(err, stats){
		if(err || !stats.isDirectory()) {
			fcb();
			return;
		}
		scb(path.basename(dirPathAbs), stats.ctime, stats.mtime, stats.atime);
		return;
	});

}