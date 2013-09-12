exports.respondPage = respondPage;

var path = require('path')
	fs = require('fs'),
	url = require('url');
var ketchup = require('ketchup-language');

function respondPage(pageName, dataObj, req, res) {
	// 根据模板生成内容返回
	var templateFile = path.resolve(__dirname, '../template', pageName);
	var content = ketchup.compile(templateFile, dataObj);
	respondHtmlText(res, content);
}

function respondHtmlText(res, text) {
	res.setHeader('ContentLength', Buffer.byteLength(text));
	res.setHeader('ContentType', 'text/html;charset=UTF-8');
	res.end(text);
}