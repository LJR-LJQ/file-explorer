exports.rpc = rpc;

var http = require('http');


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
			if (scb) {
				scb(obj);
			}
		}, fcb);

		// # scb(obj)
		// # fcb(err)
		function waitJSON(res, scb, fcb) {
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
					if (scb) {
						scb(obj);
					}
				} catch(err) {
					console.log('[waitJSON] ' + err.toString());
					if (fcb) {
						fcb({error: err.toString()});
					}
				}
			}

			function onError(err) {
				console.log('[waitJSON] ' + err.toString());
				if (fcb) {
					fcb({error: err.toString()});
				}
			}
		}
	}

	function onError(err) {
		if (fcb) {
			fcb({error: err.toString()});
		}
	}
}