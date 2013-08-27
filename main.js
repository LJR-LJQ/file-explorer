var express = require('express'),
	path = require('path'),
	url = require('url');

var respondTag = require('./respondTag').respondTag,
	respondIndexPage = require('./respondIndexPage').respond,
	respondFsPage = require('./respondFsPage').respond,
	respondFilePage = require('./respondFilePage').respond,
	respondDirManagePage = require('./respondDirManagePage').respond,
	respondFavouritePage =require('./respondFavouritePage').respond,
	respondFavouriteEditPage = require('./respondFavouriteEditPage').respond,
	respondFavouriteEditItemPage = require('./respondFavouriteEditItemPage').respond;

var app = express();

var webRoot = path.resolve(__dirname, 'website');
app.use(express.static(webRoot));
app.get('/', redirectToIndex);
app.get('/index', respondIndexPage);
app.get('/fs', respondFsPage);
app.get('/file', respondFilePage);
app.get('/dir-manage', respondDirManagePage);
app.get('/favourite', respondFavouritePage);
app.get('/favourite-edit', respondFavouriteEditPage);
app.get('/favourite-edit-item', respondFavouriteEditItemPage);
app.get('/tag', respondTag);
app.listen(80);

function redirectToIndex(req, res) {
	res.statusCode = 301;
	res.setHeader('Location', '/index');
	res.end();
}