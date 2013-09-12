var fs = require('fs');
var path = require('path');

exports.retriveFileInfo = retriveFileInfo;

// 【功能】
// 获取文件信息

// 【参数】

// [filePathAbs]
// 非空字符串，用于指定要查询的文件路径

// [scb]
// 非空回调函数，查询成功后调用该函数返回结果
// 其原型为：
// scb(fileName, sizeInBytes, ctime, mtime, atime)
// 其中
// fileName 为文件名
// sizeInBytes 为以字节为单位计算的文件大小
// ctime 为创建时间（Date对象）
// mtime 为最近一次修改时间（Date对象）
// atime 为最近一次访问时间（Date对象）

// [fcb]
// 非空回调函数，查询失败后调用该函数提示调用者
// 其原型为：
// fcb()

// 【返回值】
// 本函数没有任何有意义的返回值

// 【备注】
// 待编写

function retriveFileInfo(filePathAbs, scb, fcb) {
	// 【过程】
	fs.stat(filePathAbs, function(err, stats){
		if(err || !stats.isFile()) {
			fcb();
			return;
		}
		scb(path.basename(filePathAbs), stats.size, stats.ctime, stats.mtime, stats.atime);
		return;
	});
}