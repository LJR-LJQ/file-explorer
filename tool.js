var http = require('http'),
	path = require('path'),
	fs = require('fs'),
	format = require('util').format;

var url = 'http://127.0.0.1/service';
var tag = 0;

var def = {
	'/index': [
		'template/index.kl',
		'website/index.css',
		'website/main.css'
	]
}

for (var pathname in def) {
	var fileNameList = def[pathname];
	if (Array.isArray(fileNameList)) {
		fileNameList.forEach(function(fileName) {
			watchFile(fileName, pathname);
		});
	}
}

function watchFile(filename, pathname) {
	fs.watchFile(filename, {interval: 1000}, function(curr, prev) {
		console.log('update to ' + tag);
		updateTag(pathname, String(tag));
		tag += 1;
	});
}

function updateTag(pathname, value) {debugger;
	rpc(url, 'Tag.set', {
		pathname: pathname,
		value: value
	}, success, failure);

	function success(result) {
		console.log('update tag successfully');
		console.log(result.value);
		console.log('');
	}

	function failure(err) {
		console.log('update tag failed');
		console.log(JSON.stringify(err));
		debugger;
	}
}

// # scb(result)
// # fcb(err)
function rpc(url, funcName, args, scb, fcb) {
	var text,
		req;

	if (!url || !funcName || !args) return;
	text = JSON.stringify({
		funcName: funcName,
		args: args
	});

	req = http.request(url, onRespond);
	req.on('error', onError);
	req.method = 'POST';
	req.setHeader('Content-Type', 'application/json;charset=UTF-8');
	req.setHeader('Content-Length', Buffer.byteLength(text));
	req.end(text);

	function onRespond(res) {
		waitJSON(res, function(obj) {
			if (obj.error) {
				if (fcb) {
					fcb(obj);
				}
			} else if (scb) {
				scb(obj);
			}
		});

		function waitJSON(res, cb) {
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
				try {
					var bigBuffer = Buffer.concat(chunkList, totalLength);
					var text = bigBuffer.toString('utf8');
					var obj = JSON.parse(text);
					if (cb) {
						cb(obj);
					}
				} catch(err) {
					console.log('[waitJSON] ' + err.toString());
				}
			}

			function onError(err) {
				console.log('[waitJSON] ' + err.toString());
			}
		}
	}

	function onError(err) {
		if (fcb) {
			fcb(err);
		}
	}
}