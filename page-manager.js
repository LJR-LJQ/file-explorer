exports.loadPages = loadPages;

var index = require('./page/index');

function loadPages(app) {
	var fs = require('fs'),
		path = require('path');

	var dir,
		fileList,
		pageList;

	// 读取文件列表
	dir = path.resolve(__dirname, 'page');
	try {
		fileList = fs.readdirSync(dir);
	} catch(err) {
		console.log('[loadPages] ' + err.toString());
		return;
	}

	// 逐个加载文件
	pageList = [];
	fileList.forEach(function(file) {
		// 只加载以 .js 结尾的文件
		if (!/.js$/.test(file)) return;

		try {
			pageList.push({
				filename: file,
				obj: require(path.resolve(dir, file))
			});
		} catch(err) {
			console.log('[loadPages]');
			console.log('load page failed: ' + file);
			console.log(err.toString());
			return;
		}
	});

	// 安装每一个页面
	pageList.forEach(function(page) {
		setupPage(page);
	});

	// [函数]
	function setupPage(page) {
		var pageFileName,
			pageObj;

		pageObj = page.obj;
		pageFileName = page.filename;

		if (typeof pageObj.def !== 'object' || pageObj.def === null) {
			console.log('setup page failed: def is missing');
			console.log(path.basename(pageFileName));
			return;
		}

		if (typeof pageObj.respond !== 'function') {
			console.log('setup page failed: respond is missing');
			console.log(path.basename(pageFileName));
			return;
		}

		console.log('setup page: ' + pageFileName);
		
		for (var method in pageObj.def) {
			var urlList = pageObj.def[method];
			if (!Array.isArray(urlList)) continue;

			urlList.forEach(function(url) {
				console.log(method + ': ' + url);
				try {
					app[method](url, pageObj.respond);
				} catch(err) {
					console.log(err.toString());
				}
			});
		}
		console.log('success');
	}
}