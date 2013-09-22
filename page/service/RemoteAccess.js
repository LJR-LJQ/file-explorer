// [导出]
exports.serviceName = 'RemoteAccess';
exports.isEnable = isEnable;
exports.enable = enable;
exports.disable = disable;

// [模块]
var rpc = require('./lib/rpc').rpc;

// [变量]
//var serverUrl = 'http://127.0.0.1/service';
var serverUrl = 'http://miaodeli.com/service';

// [流程]
setTimeout(function() {
	// 如果配置中指明要启用远程访问，才会调用 start 函数
	getConfig(function(config) {
		if (config.enableRemoteAccess === true) {
			console.log('start RemoteAccess');
			start();
		} else {
			console.log('RemoteAccess is disabled');
		}
	}, function(err) {
		console.log('RemoteAccess is disabled, cause config load failed');
		console.log(JSON.stringify(err));
	})
}, 1000);

// [函数]
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
			doRequest();
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

			// 这里要判断一下，如果 reqId 不存在
			// 说明目前处于空闲状态，没有任务
			if (obj.reqId === undefined) {
				return;
			}

			console.log('receiveRequest success');
			console.log(obj);

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
			sendResponse(hostId, pwd, reqId, resObj, success, failure);

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

function isEnable(args, callback) {
	// 注意，设置会在下一次启动时才生效
	getConfig(getConfigSuccess, getConfigFailure);

	function getConfigSuccess(config) {
		if (config.enableRemoteAccess === true) {
			callback({isEnable: true});
		} else {
			callback({isEnable: false});
		}
	}

	function getConfigFailure() {
		callback({error: 'load config failed'});
	}
}

function enable(args, callback) {
	setEnable(true, callback, callback);
}

function disable(args, callback) {
	setEnable(false, callback, callback);
}

function setEnable(value, scb, fcb) {
	// 注意，设置会在下一次启动时才生效
	getConfig(getConfigSuccess, getConfigFailure);

	function getConfigSuccess(config) {
		config.enableRemoteAccess = value;
		setConfig(config, setConfigSuccess, setConfigFailure);

		function setConfigSuccess() {
			// 成功
			scb({});
		}

		function setConfigFailure() {
			fcb({error: 'save config failed'});
		}
	}

	function getConfigFailure() {
		fcb({error: 'load config failed'});
	}
}

function getConfig(scb, fcb) {
	serviceManager.dispatch({
		funcName: 'Config.getConfig',
		args: {}
	}, scb, fcb);
}

function setConfig(newConfig, scb, fcb) {
	serviceManager.dispatch({
		funcName: 'Config.setConfig',
		args: newConfig
	}, scb, fcb);
}