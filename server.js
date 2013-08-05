var http = require('http'),
	url = require('url'),
	fs = require('fs');

var respondIndexPage = require('./respondIndexPage.js').respondIndexPage,
	respondFilePage = require('./respondFilePage.js').respondFilePage,
	respondDownloadPage = require('./respondDownloadPage.js').respondDownloadPage,
	checkLogin = require('./checkLogin.js').checkLogin;

var server = http.createServer();
server.on('request', onRequest);
server.listen(80);

function onRequest(req, res) {
	var reqUrl = url.parse(req.url, true);

	// 检查登录状态
	if (!checkLogin(reqUrl, req, res)) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic');
		res.end();
		return;
	}

	// 根据地址不同加载不同的页面
	if (reqUrl.pathname === '/') {
		redirectTo('/index', res);
	} else if (reqUrl.pathname === '/index') {
		respondIndexPage(reqUrl, req, res);
	} else if (reqUrl.pathname === '/file') {
		respondFilePage(reqUrl, req, res);
	} else if (/^\/download\//.test(reqUrl.pathname)) {
		respondDownloadPage(reqUrl, req, res);
	} else {
		respond404(reqUrl, req, res);
	}
}


function respond404(reqUrl, req, res) {
	res.statusCode = 404;
	res.end();
}

function redirectTo(newUrl, res) {
	res.statusCode = 301;
	res.setHeader('Location', newUrl);
	res.end();
}