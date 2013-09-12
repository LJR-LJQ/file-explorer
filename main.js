// [模块]
var express = require('express'),
	path = require('path'),
	url = require('url');

var pageManager = require('./page-manager.js');

var app,
	webRoot;

webRoot = path.resolve(__dirname, 'website');

app = express();
app.use(express.static(webRoot));
app.use(express.json());
pageManager.loadPages(app);	// 加载各个页面
app.listen(80);