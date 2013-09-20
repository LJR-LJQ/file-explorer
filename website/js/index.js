var gData = {
	hostId: undefined,
	currentPath: undefined
}

function resetUI() {
	// 恢复登录进度状态
	setLoginProgress('登录中', '正在验证您的身份，请稍候');
}

function setLoginProgress(title, subtitle) {
	$('#login-progress-title').text(title);
	$('#login-progress-subtitle').text(subtitle);
}

function login() {
	var hostId,
		password;

	hostId = $('#host-id').val();
	password = $('#password').val();

	if (!hostId) {
		$('#host-id').focus();
		return;
	}

	if (!password) {
		$('#password').focus();
		return;
	}

	// 重置 UI
	resetUI();

	// 转入登录中界面
	transitionBetween('#login-container', '#login-progress-container', function() {
		// 提交登录数据
		send(hostId, {
			funcName: 'Authorization.auth',
			args: {
				password: password
			}
		}, success, failure);
	});

	function success(result) {
		console.log('success');
		console.log(result);

		// 把 hostId 记录到全局变量
		gData.hostId = hostId;

		// 更新左上角的主机编号
		$('#host-id-text').text('主机编号 ' + hostId);

		// 加载数据
		queryDir('/');

		// 转入主界面
		transitionBetween('#login-progress-container', '#file-explorer-container');
	}

	function failure(err) {
		console.log('failure');
		console.log(err);

		// 显示登录失败信息
		setLoginProgress('登录失败', '您的身份未能通过验证，请重试');
	}
}

function queryDir(path) {
	send(gData.hostId, {
		funcName: 'Directory.query',
		args: {
			dirPathAbs: path
		}
	}, success, failure);

	function success(result) {
		console.log(result);

		// 把路径记录到全局变量
		gData.currentPath = result.path;

		// 显示到界面上
		dataToDom(result);
	}

	function failure(err) {
		console.log('[queryDir] failure');
		console.log(err);
	}

	function dataToDom(data) {
		if (!data) return;

		pathDataToDom(data.path);
		dirDataToDom(data.dirList);
		fileDataToDom(data.fileList);

		function dirDataToDom(dirList) {
			var container = $('#dir-list');
			container.empty();

			if (!dirList) return;
			dirList.forEach(function(dir, i) {
				// 注意序列号从 1 开始
				container.append(dirItemDom(i + 1, dir));
			});

			function dirItemDom(i, name) {
				var li = $('<li></li>');
				var span = $('<span></span>');
				var div = $('<div></div>').text(i);
				var a = $('<a></a>')
							.text(name)
							.attr('href', 'javascript:')
							.attr('onclick', 'onClickDirItem(this);');

				span.append(div);
				li.append(span);
				li.append(a);

				return li;
			}
		}

		function fileDataToDom(fileList) {
			var container = $('#file-list');
			container.empty();

			if (!fileList) return;
			fileList.forEach(function(file, i) {
				// 注意序列号从 1 开始
				container.append(dirItemDom(i + 1, file));
			});

			function dirItemDom(i, name) {
				var li = $('<li></li>');
				var span = $('<span></span>');
				var div = $('<div></div>').text(i);
				var a = $('<a></a>')
							.text(name)
							.attr('href', 'javascript:')
							.attr('onclick', 'onClickFileItem(this);');

				span.append(div);
				li.append(span);
				li.append(a);

				return li;
			}
		}

		function pathDataToDom(path) {
			var container = $('#position-list');
			container.empty();

			container.append(pathItemDom('计算机', 'onClickComputer();'));

			path.split('/').forEach(function(pathPart) {
				if (!pathPart) return;
				container.append(pathItemDom(pathPart, 'onClickPathItem(this);'));
			});

			// 把最后一个元素设置为激活状态
			$('#position-list > li:last-child').addClass('current');

			function pathItemDom(name, onclick) {
				var li = $('<li></li>');
				var a = $('<a></a>')
							.text(name)
							.attr('href', 'javascript:')
							.attr('onclick', onclick);

				li.append(a);
				return li;
			}
		}
	}
}

function onClickComputer() {
	queryDir('/');
}

function onClickPathItem(e) {
	var list = $('#position-list a');
	var path = '/';

	// i 从 1 开始，因为 0 是 “计算机”
	for (var i = 1; i < list.length; ++i) {
		path += $(list[i]).text() + '/';
		if (list[i] === e) break;
	}

	console.log(path);
	queryDir(path);
}

function onClickDirItem(e) {
	var dirName = $(e).text();
	queryDir(gData.currentPath + dirName + '/');
}

function onClickFileItem(e) {
	var fileName = $(e).text();
	alert(fileName);
}

function uiPlay(actionName) {
	switch(actionName) {
		case 'cancelLogin':
			cancelLogin();
			break;
		case 'logout':
			logout();
			break;
		case 'logoutSuccess':
			logoutSuccess();
			break;
		case 'config':
			config();
			break;
		case 'backFromConfig':
			backFromConfig();
			break;
	}

	function cancelLogin() {
		transitionBetween('#login-progress-container', '#login-container');
	}

	function logout() {
		transitionBetween('#file-explorer-container', '#logout-container');
	}

	function logoutSuccess() {
		transitionBetween('#logout-container', '#login-container');
	}

	function config() {
		transitionBetween('#file-explorer-center-container', '#config-container');
	}

	function backFromConfig() {
		transitionBetween('#config-container', '#file-explorer-center-container');
	}
}

function transitionBetween(fromSelector, toSelector, scb) {
	hideUI(fromSelector, function() {
		showUI(toSelector, scb);
	});
}

function hideUI(selector, scb) {
	$(selector).addClass('anim-hide');
	setTimeout(function() {
		$(selector).addClass('none');
		safeCall(scb, []);
	}, 1250);
}

function showUI(selector, scb) {
	$(selector).removeClass('none');
	setTimeout(function() {
		$(selector).removeClass('anim-hide');
		safeCall(scb, []);
	}, 0);
}

// 一体化的发送请求/接收响应功能
function send(hostId, req, scb, fcb) {
	sendRequest(hostId, req, success, failure);

	function success(obj) {
		// 请求发送成功后，要记录下 reqId，然后轮询获得结果
		var reqId = obj.reqId;
		
		var requesting = false,
			finished = false;

		var vi = setInterval(function() {
			if (requesting || finished) return;
			requesting = true;

			// 接收请求
			receiveResponse(hostId, reqId, receiveResSuccess, receiveResFailure);
		}, 100)

		function receiveResSuccess(obj) {
			requesting = false;

			// 如果 res 不存在，说明结果还没有出现
			// 继续发出请求
			if (!obj.res) return;

			// 结果已经出现，不再继续
			clearInterval(vi);
			finished = true;

			// 注意如果服务端返回的 res 带有 error 的话
			// 还是要调用 fcb
			if (obj.res.error) {
				safeCall(fcb, [obj.res]);
			} else {
				safeCall(scb, [obj.res]);
			}
		}

		function receiveResFailure(err) {
			// 出现错误，不再继续
			clearInterval(vi);
			requesting = false;
			finished = true;

			safeCall(fcb, [err]);
		}
	}

	function failure(err) {
		safeCall(fcb, [err]);
	}
}

// 基本的发送请求功能
function sendRequest(hostId, req, scb, fcb) {
	rpc('Between.sendRequest', {
		hostId: hostId,
		req: req
	}, scb, fcb);
}

// 基本的接受响应功能
function receiveResponse(hostId, reqId, scb, fcb) {
	rpc('Between.receiveResponse', {
		hostId: hostId,
		reqId: reqId
	}, scb, fcb);
}

function safeCall(cb, args, _this) {
	if (typeof cb === 'function') {
		try {
			cb.apply(_this, args);
		} catch(err) {
			console.log('[safeCall] ' + err.toString());
		}
	}
}