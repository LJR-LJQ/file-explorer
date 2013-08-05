exports.loadKetchupFile = loadKetchupFile;

var fs = require('fs'),
	path = require('path');

var parseKetchup = require('parseKetchup').parseKetchup;

function loadKetchupFile(filename) {
	// 现在每次都会重新加载文件，效率比较低
	// 以后可以在这里做缓存，改善这一问题
	filename = path.resolve(__dirname, filename);
	console.log('[loadKetchupFile] ' + filename);
	return parseKetchup(fs.readFileSync(filename, {encoding: 'utf8'}));
}