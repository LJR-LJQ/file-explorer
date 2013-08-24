exports.respond = respond;

var path = require('path');
var respondPage = require('./respondPage').respondPage;
var queryDir = require('./lib/queryDir').queryDir;

function respond(req, res) {
	var reqUrl = require('url').parse(req.url, true);
	console.log(reqUrl.query['path']);debugger;

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
			data;

		// [过程]
		// 整理数据格式
		dirList = sort(dirList);
		fileList = sort(fileList);

		for (var i = 0, len = dirList.length; i < len; ++i) {
			dirDescList.push(descIt(dirList[i]));
		}

		for (var i = 0, len = fileList.length; i < len; ++i) {
			fileDescList.push(descIt(fileList[i]));
		}

		// 创建 Data 对象
		data = new Data(dirDescList, fileDescList);

		// 根据模板生成页面内容返回
		respondPage('index.kl', data, req, res);

		// [函数]
		function descIt(item) {
			return {name: item, path: path.resolve(dirPathAbs, item)};
		}
	}

	function notFound() {
		res.statusCode = 404;
		res.end();
	}
}

function Data(dirDescList, fileDescList) {
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

Data.prototype.produceFileList = function(parentNode, node) {debugger;
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