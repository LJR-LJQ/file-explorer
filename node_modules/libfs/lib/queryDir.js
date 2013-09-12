var fs = require('fs');

exports.queryDir = queryDir;

// 【功能】
// 列举出指定目录下的子目录和文件

// 【参数】

// [dirPathAbs]
// 非空字符串，用于指定要查询的目录路径

// [scb]
// 非空回调函数，查询成功后调用该函数返回结果
// 其原型为：
// scb(dirList, fileList)
// 其中的 dirList 和 fileList 都是数组类型
// 注意如果某个目录下没有子目录，或者没有文件，

// [fcb]
// 非空回调函数，查询失败后调用该函数提示调用者
// 其原型为：
// fcb()

// 【返回值】
// 本函数没有任何有意义的返回值

// 【备注】
// 如果要查询的目录不存在，那么通过 fcb() 通知调用者
// 如果要查询的目录存在，但是在获取子目录或文件的过程中遇到错误（例如权限问题）
// 则容忍该错误，只返回能够获取到的子目录和文件列表
// 例如，目录 x 下有 d1 d2 d3 三个子目录，但是 d2 由于权限原因，我们无法访问
// 那么最终我们通过 scb([d1, d3], [...]) 只返回能访问到的 d1 和 d3 即可

function queryDir(dirPathAbs, scb, fcb) {
	// 【变量】
	var index;
	var file;
	var dirList, fileList;


	// 【过程】
	dirList = [];
	fileList = [];
	fs.readdir(dirPathAbs, function(err, files){
		if(err) {
			fcb();
			return;
		}
		for(index = 0; index < files.length; index++) {
			file = files[index];
			try {
				if(fs.statSync(dirPathAbs + '/' + file).isDirectory()) {
					dirList.push(file);
				} else {
					fileList.push(file);
				}
			} catch(err) {

			}
		}
		scb(dirList, fileList);
		return;
	});
	
}