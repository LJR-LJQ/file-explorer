exports.respondFilePage = respondFilePage;

var fs = require('fs'),
	pathTool = require('path'),
	util = require('util');

var loadKetchupFile = require('./loadKetchupFile.js').loadKetchupFile,
	toHtml5Text = require('toHtml5Text').toHtml5Text,
	fillTemplate = require('fillTemplate').fillTemplate;

var obj = {
	fileName: undefined,
	size: undefined,
	dirPath: undefined,
	filePath: undefined,
	produceGoBack: function(parentNode, node) {
		node.name = undefined;
		node.children[0].attrList[0].value = 'index?path=' + encodeURIComponent(this.dirPath);
	},
	produceFileName: function(parentNode, node) {
		// 注意这里没有进行 html 转义
		// TODO
		node.name = undefined;
		node.text += this.fileName;
	},
	produceSize: function(parentNode, node) {
		// 注意这里没有进行 html 转义
		// TODO
		node.name = undefined;
		node.text += this.size + ' Bytes';
	},
	produceDownload: function(parentNode, node) {
		var url = util.format('download/%s?path=%s', encodeURIComponent(this.fileName), encodeURIComponent(this.filePath));

		node.name = undefined;
		node.children[0].attrList[0].value = url;
	}
}

function respondFilePage(reqUrl, req, res) {
	var path = reqUrl.query['path'];
	fs.lstat(path, function(err, stat) {
		if (err || !stat.isFile()) {
			res.statusCode = 404;
			res.end();
			return;
		}

		obj.filePath = path;
		obj.dirPath = pathTool.dirname(path);
		obj.fileName = pathTool.basename(path);
		obj.size = stat.size;

		respondPage();
	});

	function respondPage() {
		// 加载模板，然后填写模板并输出为 html5 字串
		var templateRoot = loadKetchupFile('template/file.ketchup');
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
}