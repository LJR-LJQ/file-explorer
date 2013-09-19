// [导出]
exports.serviceName = 'RemoteAccess';
exports.enable = enable;
exports.disable = disable;
exports.isEnable = isEnable;

// [模块]
var rpc = require('./lib/rpc').rpc;

// [变量]
var serverUrl = 'http://127.0.0.1/service';
var _enable = true;

// [流程]
start();

// [函数]
function enable() {
	_enable = true;
}

function disable() {
	_enable = false;
}

function isEnable() {
	return _enable;
}

function start() {
	var requesting = false;
	var hostId,
		pwd;

	// 先注册一个号
	register(function(obj) {
		if (obj.error) {
			console.log('register failed');
			console.log(obj.error);
			return;
		}

		// 记录下返回的信息
		hostId = obj.hostId;
		pwd = obj.pwd;

		console.log('register success: ' + hostId + ' / ' + pwd);

		// 开始不断的进行请求
		setInterval(function() {
			if (_enable) {
				doRequest();
			}
		}, 500);

	}, function(err) {
		console.log('register failed');
	});



	function doRequest() {
		// 防止重入
		if (requesting) return;
		requesting = true;

		receiveRequest(hostId, pwd, success, failure);

		function success(obj) {
			requesting = false;

			if (obj.error) {
				console.log('receiveRequest failed');
				console.log(obj.error);
				return;
			}

			console.log('receiveRequest success');
			console.log(obj);

			// 这里要判断一下，如果 reqId 不存在
			// 说明目前处于空闲状态，没有任务
			if (obj.reqId === undefined) {
				return;
			}

			handleRemoteRequest(obj.reqId, obj.req);
		}

		function failure(err) {
			requesting = false;

			console.log('receiveRequest failed');
		}
	}

	function handleRemoteRequest(reqId, req) {
		console.log(JSON.stringify(req));
		serviceManager.dispatch(req, cb);

		function cb(resObj) {
			sendResponse(hostId, pwd, reqId, resObj, success, failed);

			function success(obj) {
				if (obj.error) {
					console.log('sendResponse failed, ' + obj.error);
					return;
				}

				console.log('sendResponse success');
			}

			function failure() {
				console.log('sendResponse failed');
			}
		}
	}

	// # scb(obj)
	// # fcb()
	function register(scb, fcb) {
		rpc(serverUrl, 'Between.register', {}, scb, fcb);
	}

	// # scb(obj)
	// # fcb()
	function receiveRequest(hostId, pwd, scb, fcb) {
		rpc(serverUrl, 'Between.receiveRequest', {
			hostId: hostId,
			pwd: pwd
		}, scb, fcb);
	}

	// # scb(obj)
	// # fcb()
	function sendResponse(hostId, pwd, reqId, res, scb, fcb) {
		rpc(serverUrl, 'Between.sendResponse', {
			hostId: hostId,
			pwd: pwd,
			reqId: reqId,
			res: res
		}, scb, fcb);
	}
}