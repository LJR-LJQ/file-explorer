var gData = {
	hostId: undefined,
	currentPath: undefined
}

function resetUI() {
	// 恢复登录进度状态
	setLoginProgressDom('登录中', '正在验证您的身份，请稍候');
}

/* 用户操作事件处理函数 */

function onClickLogin() {
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
		auth(hostId, password, success, failure);
	});

	function success(result) {
		console.log('success');
		console.log(result);

		// 把 hostId 和 token 记录到全局变量
		gData.hostId = hostId;
		gData.token = result.token;

		// 更新左上角的主机编号
		setHostIdDom(hostId);

		// 加载数据
		loadDir('/');

		// 加载配置信息
		loadRemoteAccessConfig();

		// 转入主界面
		transitionBetween('#login-progress-container', '#file-explorer-container');
	}

	function failure(err) {
		console.log('failure');
		console.log(err);

		// 显示登录失败信息
		setLoginProgressDom('登录失败', '您的身份未能通过验证，请重试');
	}
}

function onClickComputer() {
	loadDir('/');
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
	loadDir(path);
}

function onClickDirItem(e) {
	var dirName = $(e).text();
	loadDir(gData.currentPath + dirName + '/');
}

function onClickFileItem(e) {
	var fileName = $(e).text();
	var filePathAbs = gData.currentPath + fileName;
	loadFile(fileName, filePathAbs);
}

function onClickViewPassword(e) {
	if (e.checked) {
		$('#old-pwd, #new-pwd').attr('type', 'text');
	} else {
		$('#old-pwd, #new-pwd').attr('type', 'password');
	}
}

function onClickSavePassword() {
	var oldPwd = $('#old-pwd').val(),
		newPwd = $('#new-pwd').val();

	if (!oldPwd) {
		$('#old-pwd').focus();
		return;
	}

	if (!newPwd) {
		$('#new-pwd').focus();
		return;
	}

	changePassword(oldPwd, newPwd, success, failure);

	function success() {
		alert('修改密码成功');
	}

	function failure(err) {
		alert('修改密码失败');
		console.log(err);
	}
}

function onClickSaveRemoteAccessConfig() {
	if ($('#enable-remote-access')[0].checked) {
		enableRemoteAccess(success, failure);
	} else {
		disableRemoteAccess(success, failure);
	}

	function success() {
		alert('修改成功');
	}

	function failure() {
		alert('修改失败');
	}
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

/* 业务概念级别的函数 */

function loadDir(path) {
	queryDir(path, success, failure);

	function success(result) {
		console.log(result);

		// 把路径记录到全局变量
		gData.currentPath = result.path;

		// 显示到界面上
		setPathDom(result.path);
		setDirListDom(result.dirList);
		setFileListDom(result.fileList);
	}

	function failure(err) {
		console.log('[loadDir] failure');
		console.log(err);
	}
}

function loadFile(fileName, filePathAbs) {
	// 先清空一下当前数据
	setFileInfoDom(fileName, '', '', '', '');

	// 弹出文件对话框
	$('#file-modal').modal('show');

	// 查询文件信息
	queryFileInfo(filePathAbs, success, failure);

	function success(result) {
		setFileInfoDom(fileName, result.size, result.ctime, result.mtime, result.atime);
	}

	function failure(err) {
		console.log('[loadFile] failed');
		console.log(err);
	}
}

function loadRemoteAccessConfig() {
	isRemoteAccessEnable(function(result) {
		if (result.isEnable) {
			$('#enable-remote-access')[0].checked = true;
		} else {
			$('#disable-remote-access')[0].checked = true;
		}
	});
}

/* 用户界面切换的三个基础函数 */

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

/* DOM 写入函数 */
function setHostIdDom(hostId) {
	$('#host-id-text').text('主机编号 ' + hostId);
}

function setLoginProgressDom(title, subtitle) {
	$('#login-progress-title').text(title);
	$('#login-progress-subtitle').text(subtitle);
}

function setPathDom(path) {
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

function setDirListDom(dirList) {
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

function setFileListDom(fileList) {
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

function setFileInfoDom(fileName, fileSize, ctime, mtime, atime) {
	$('#file-name').text(fileName);
	$('#file-size').text(fileSize);
	$('#ctime').text(ctime);
	$('#mtime').text(mtime);
	$('#atime').text(atime);


	var filePathAbs = gData.currentPath + fileName;
	var tunnelUrl = '/download?hostId=' + encodeURIComponent(gData.hostId) 
					+ '&token=' + encodeURIComponent(gData.token)
					+ '&filePathAbs=' + encodeURIComponent(filePathAbs);
	$('#download-btn').attr('href', tunnelUrl);
}

/* 服务端 API 实体化函数 */
function auth(hostId, password, scb, fcb) {
	send(hostId, {
		funcName: 'Authorization.auth',
		args: {
			password: password
		}
	}, scb, fcb);
}

function changePassword(oldPwd, newPwd, scb, fcb) {
	send(gData.hostId, {
		funcName: 'Authorization.changePassword',
		args: {
			token: gData.token,
			oldPwd: oldPwd,
			newPwd: newPwd
		}
	}, scb, fcb);
}

function queryDir(path, scb, fcb) {
	authDispatch({
		funcName: 'Directory.query',
		args: {
			dirPathAbs: path
		}
	}, scb, fcb);
}

function queryFileInfo(filePathAbs, scb, fcb) {
	authDispatch({
		funcName: 'File.queryFileInfo',
		args: {
			filePathAbs: filePathAbs
		}
	}, scb, fcb);
}

function enableRemoteAccess(scb, fcb) {
	authDispatch({
		funcName: 'RemoteAccess.enable',
		args: {}
	}, scb, fcb);
}

function disableRemoteAccess(scb, fcb) {
	authDispatch({
		funcName: 'RemoteAccess.disable',
		args: {}
	}, scb, fcb);
}

function isRemoteAccessEnable(scb, fcb) {
	authDispatch({
		funcName: 'RemoteAccess.isEnable',
		args: {}
	}, scb, fcb);
}

function authDispatch(req, scb, fcb) {
	send(gData.hostId, {
		funcName: 'Authorization.dispatch',
		args: {
			token: gData.token,
			req: req
		}
	}, scb, fcb);
}

/* 网络通信的三个基础函数 */

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