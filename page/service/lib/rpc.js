exports.rpc = rpc;

var http = require('http');


// # scb(result)
// # fcb(err)
function rpc(url, funcName, args, scb, fcb) {debugger;
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

	function onRespond(res) {debugger;
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

			function onEnd() {debugger;
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

	function onError(err) {debugger;
		if (fcb) {
			fcb(err);
		}
	}
}