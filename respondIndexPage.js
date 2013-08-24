exports.respond = respond;

var path = require('path');
var respondPage = require('./respondPage').respondPage;
var queryDir = require('./lib/queryDir').queryDir;
var isWindows = require('./isWindows').isWindows;

function respond(req, res) {
	var reqUrl = require('url').parse(req.url, true);
	console.log(reqUrl.query['path']);

	var dirPathAbs = reqUrl.query['path'];

	if (!dirPathAbs) {
		dirPathAbs = 'c:/';
	}

	// 构造数据
	queryDir(dirPathAbs, onQueryDirSuccess, notFound);

	function onQueryDirSuccess(dirList, fileList) {
		// [变量]
		var dirDescList = [],
			fileDescList = [],
			pathDescList = [],
			data;

		// [过程]
		makePathDescList();
		makeDirDescList();
		makeFileDescList();

		// 创建 Data 对象
		data = new Data(pathDescList, dirDescList, fileDescList);

		// 根据模板生成页面内容返回
		respondPage('index.kl', data, req, res);

		// [函数]
		function makePathDescList() {
			var tmp = dirPathAbs;

			while (true) {
				if (path.basename(tmp)) {
					pathDescList.unshift({
						name: path.basename(tmp),
						path: tmp
					});
					// 往上回退一层
					tmp = path.dirname(tmp);
				} else {
					// 注意这里的处理在不同的系统下是不同的
					if (isWindows()) {
						// 剩下的是 C:\ 这样子的
						// 但是 name 部分只要 C
						// 而路径部分则要保持完整
						pathDescList.unshift({
							name: tmp[0],
							path: tmp
						})
					} else {
						// 对于非 windows 系统，剩下的是 /
						// 不需要添加进列表，略过
					}

					// 终止循环
					break;
				}
			}
		}

		function makeDirDescList() {
			dirList = sort(dirList);
			for (var i = 0, len = dirList.length; i < len; ++i) {
				dirDescList.push(descIt(dirList[i]));
			}
		}

		function makeFileDescList() {
			fileList = sort(fileList);

			for (var i = 0, len = fileList.length; i < len; ++i) {
				fileDescList.push(descIt(fileList[i]));
			}
		}

		function descIt(item) {
			return {name: item, path: path.resolve(dirPathAbs, item)};
		}
	}

	function notFound() {
		res.statusCode = 404;
		res.end();
	}
}

function Data(pathDescList, dirDescList, fileDescList) {
	this.pathDescList = pathDescList;
	this.dirDescList = dirDescList;
	this.fileDescList = fileDescList;
	return this;
}

Data.prototype.produceDirList = function(parentNode, node) {
	var dirDescList = this.dirDescList,
		newChildren = [];

	node.name = undefined;

	for (var i = 0, len = dirDescList.length; i < len; ++i) {
		var copied = copy(node.children);
		copied[0].children[0].text = dirDescList[i].name;
		setAttr(copied[0].children[0], 'href', '?path=' + encodeURIComponent(dirDescList[i].path));
		
		while(copied.length > 0) {
			newChildren.push(copied.shift());
		}
	}

	// 把模板节点的内容替换掉
	node.children = newChildren;
}

Data.prototype.produceFileList = function(parentNode, node) {
	var fileDescList = this.fileDescList,
		newChildren = [];

	node.name = undefined;

	for (var i = 0, len = fileDescList.length; i < len; ++i) {
		var copied = copy(node.children);
		copied[0].children[0].text = fileDescList[i].name;
		setAttr(copied[0].children[0], 'href', 'file?path=' + encodeURIComponent(fileDescList[i].path));
		
		while(copied.length > 0) {
			newChildren.push(copied.shift());
		}
	}

	// 把模板节点的内容替换掉
	node.children = newChildren;
}

Data.prototype.producePath = function(parentNode, node) {
	var pathDescList = this.pathDescList,
		newChildren = [];

	node.name = undefined;

	for (var i = 0, len = pathDescList.length - 1; i < len; ++i) {
		var copied = copy(node.children);
		copied[0].children[0].text = pathDescList[i].name;
		setAttr(copied[0].children[0], 'href', '?path=' + encodeURIComponent(pathDescList[i].path));
		
		while(copied.length > 0) {
			newChildren.push(copied.shift());
		}
	}

	node.children = newChildren;
}

Data.prototype.produceLastPath = function(parentNode, node) {
	var pathDescList = this.pathDescList;

	node.name = undefined;

	if (pathDescList.length < 1) {
		node.children = [];
		return;
	}

	node.children[0].text = pathDescList[pathDescList.length-1].name;
}

function copy(e) {
	return JSON.parse(JSON.stringify(e));
}

// 注意两点：
// 1、属性名的匹配是大小写不敏感的
// 2、所有同名属性的值都会被更新，而不止第一个
function setAttr(node, attrName, attrValue) {
	if (!node || !node.attrList) return;

	if (typeof attrName === 'string') {
		var attrNameLo;
		attrNameLo = attrName.toLowerCase();
		node.attrList.forEach(function(attr) {
			if (typeof attr.name !== 'string') return;
			if (attr.name.toLowerCase() === attrNameLo) {
				attr.value = attrValue;
			}
		});
	} else {
		node.attrList.forEach(function(attr) {
			if (attr.name === attrName) {
				attr.value = attrValue;
			}
		});
	}
}

function sort(strList) {
	return strList.sort(function(a, b) {
		var lo_a = a.toLowerCase(),
			lo_b = b.toLowerCase();

		if (lo_a === lo_b) return 0;
		else if (lo_a < lo_b) return -1;
		else return 1;
	});
}