var http = require('http'),
	path = require('path'),
	fs = require('fs'),
	format = require('util').format;

var tag = 0;

watchFile('template/index.kl', '/index');
watchFile('website/main.css', '/index');

function watchFile(filename, pathname) {
	fs.watchFile(filename, {interval: 1000}, function(curr, prev) {
		console.log('update to ' + tag);
		updateTag(pathname, tag);
		tag += 1;
	});
}

function updateTag(pathname, tag) {
	var url = 'http://127.0.0.1/tag?action=set&pathname=%s&value=%s';
	url = format(url, encodeURIComponent(pathname), encodeURIComponent(tag));
	console.log(url + '\n');
	var req = http.request(url, onRespond);
	req.on('error', onError);
	req.end();

	function onRespond(res) {
		waitString(res, function(text) {
			console.log('server respond:');
			console.log(text);
		});

		function waitString(res, cb) {
			var chunkList = [],
				totalLength = 0;

			res.on('data', onData);
			res.on('end', onEnd);
			res.on('error', onError);

			function onData(chunk) {
				chunkList.push(chunk);
				totalLength += chunk.length;
			}

			function onEnd() {
				var bigBuffer = Buffer.concat(chunkList, totalLength);
				cb(bigBuffer.toString('utf8'));
			}

			function onError(err) {
				console.log('[waitString] ' + err.toString());
			}
		}
	}

	function onError(error) {
		console.log('[updateTag] ' + error.toString());
	}
}