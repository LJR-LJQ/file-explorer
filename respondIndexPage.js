exports.respondIndexPage = respondIndexPage;

var fs = require('fs');

var loadKetchupFile = require('./loadKetchupFile.js').loadKetchupFile,
	toHtml5Text = require('toHtml5Text').toHtml5Text,
	fillTemplate = require('fillTemplate').fillTemplate;

var pathTool = require('path');

var obj = {
	currentPath: undefined,
	parentPath: undefined,
	dirList: undefined,
	fileList: undefined,
	produceGoBack: function(parentNode, node) {
		node.name = undefined;

		node.children[0].attrList[0].value = 'index?path=' + encodeURIComponent(this.parentPath);
	},
	produceCurrentPos: function(parentNode, node) {
		node.name = undefined;

		node.children[0].text += this.currentPath;
	},
	produceDirList: function(parentNode, node) {
		node.name = undefined;

		node.children = [];
		if (this.dirList) {
			// 排序一下
			var dirList = sort(this.dirList);

			dirList.forEach(function(dirItem) {
				node.children.push(createDirNode(dirItem.name, dirItem.path));
				node.children.push(createBrNode());
			});
		}

		function createDirNode(dirName, path) {
			// 注意这里没有处理 dirName 的转义问题
			var o = {
				name: 'a',
				attrList: [],
				text: dirName
			};
			o.attrList.push({
				name: 'href',
				value: 'index?path=' + encodeURIComponent(path)
			});
			return o;
		}

		function createBrNode() {
			var o = {
				name: 'br',
				attrList: undefined,
				text: undefined
			}
			return o ;
		}
	},
	produceFileList: function(parentNode, node) {
		node.name = undefined;

		node.children = [];
		if (this.fileList) {
			// 排序一下
			var fileList = sort(this.fileList);

			fileList.forEach(function(fileItem) {
				node.children.push(createFileNode(fileItem.name, fileItem.path));
				node.children.push(createBrNode());
			});
		}

		function createFileNode(fileName, path) {
			// 注意这里没有处理 fileName 的转义问题
			var o = {
				name: 'a',
				attrList: [],
				text: fileName
			};
			o.attrList.push({
				name: 'href',
				value: 'file?path=' + encodeURIComponent(path)
			});
			return o;
		}

		function createBrNode() {
			var o = {
				name: 'br',
				attrList: undefined,
				text: undefined
			}
			return o ;
		}
	}
}

function respondIndexPage(reqUrl, req, res) {
	// 根据请求地址，准备好数据
	var path = reqUrl.query['path'] || '';
	console.log(path);
	if (path === '') {
		path = 'C:/';
	}
	obj.currentPath = path;
	obj.parentPath = pathTool.dirname(path);

	doIt(path, obj, doItScb, doItFcb);

	function doItScb() {
		// 加载模板，然后填写模板并输出为 html5 字串
		var templateRoot = loadKetchupFile('template/index.ketchup');
		fillTemplate(templateRoot, obj);
		var contentRoot = templateRoot;
		var content = toHtml5Text(contentRoot);
		var contentLength = Buffer.byteLength(content);

		// 设定各项响应参数
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/html;charset=UTF-8');
		res.setHeader('Content-Length', contentLength);

		// 发送响应结果
		res.end(content);
	}

	function doItFcb() {
		res.statusCode = 404;
		res.end();
	}
}

function doIt(path, obj, scb, fcb) {
	var asyncCount;

	obj.dirList = [];
	obj.fileList = [];
	console.log(path);
	fs.readdir(path, function(err, targetList) {
		if (err) {
			console.log('[doIt]', err.toString());
			fcb();
			return;
		}

		if (targetList.length < 1) {
			scb();
			return;
		}

		asyncCount = targetList.length;

		targetList.forEach(function(target) {
			seperate(pathTool.resolve(path, target));
		});
	});

	function seperate(target) {
		fs.lstat(target, function(err, stat) {
			--asyncCount;
			if (err) {
				console.log('[seperate] ' + err.toString());
			} else {
				if (stat.isFile()) {
					obj.fileList.push({
						name: pathTool.basename(target),
						path: target
					});
				} else if (stat.isDirectory()) {
					obj.dirList.push({
						name: pathTool.basename(target),
						path: target
					});
				}
			}

			// 全部结束了
			if (asyncCount === 0) {
				scb();
			}
		});
	}
}

function sort(list) {debugger;
	return list.sort(function(a, b) {
		var la = a.name.toLowerCase(),
			lb = b.name.toLowerCase();

		if (la < lb) {
			return -1;
		} else if (la > lb) {
			return 1;
		} else {
			return 0;
		}
	});
}