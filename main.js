// [模块]
var express = require('express'),
	path = require('path'),
	url = require('url');

var serviceManager = require('./service-manager.js');

var respondIndexPage = require('./respondIndexPage').respond,
	respondFsPage = require('./respondFsPage').respond,
	respondFilePage = require('./respondFilePage').respond,
	respondDirManagePage = require('./respondDirManagePage').respond,
	respondFavouritePage =require('./respondFavouritePage').respond,
	respondFavouriteEditPage = require('./respondFavouriteEditPage').respond,
	respondFavouriteEditItemPage = require('./respondFavouriteEditItemPage').respond;

var app,
	webRoot;

// 让 serviceManager 随处可用
global.serviceManager = serviceManager;

app = express();
webRoot = path.resolve(__dirname, 'website');
app.use(express.static(webRoot));
app.use(express.json());
app.get('/', redirectToIndex);
app.get('/index', respondIndexPage);
app.get('/fs', respondFsPage);
app.get('/file', respondFilePage);
app.get('/dir-manage', respondDirManagePage);
app.get('/favourite', respondFavouritePage);
app.get('/favourite-edit', respondFavouriteEditPage);
app.get('/favourite-edit-item', respondFavouriteEditItemPage);
app.post('/service', service);
app.listen(80);

function redirectToIndex(req, res) {
	res.statusCode = 301;
	res.setHeader('Location', '/index');
	res.end();
}

function service(req, res) {
	var jsonReqObj = req.body;
	if (!jsonReqObj) {
		res.statusCode = 400;
		res.end();
		return;
	}

	serviceManager.dispatch(jsonReqObj, cb, req, res);

	function cb(jsonResObj) {
		var text = JSON.stringify(jsonResObj);
		console.log('# respond');
		console.log(text);
		console.log('');
		var length = Buffer.byteLength(text, 'utf8');
		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.setHeader('Content-Length', length);
		res.end(text);
	}
}