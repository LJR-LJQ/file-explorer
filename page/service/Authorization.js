// [导出]
exports.serviceName = 'Authorization';
exports.auth = auth;
exports.dispatch = dispatch;
exports.changePassword = changePassword;

// [模块]
var KeyTable = require('./lib/key-table');

// [变量]
var tokenTable = KeyTable.create();

// [函数]

function auth(args, callback) {
	var password,
		token;

	password = args.password;

	// 密码必须为字符串类型，且不能为空字符串
	if (typeof password !== 'string' || password === '') {
		callback({error: 'password must be string and not empty'});
		return;
	}

	// 为了进行密码校验，需要先查询到当前的密码
	getConfig(getConfigSuccess, getConfigFailure);

	function getConfigSuccess(config) {
		if (password === config.password) {
			// 创建一个令牌
			token = createToken();

			// 将其加入令牌表
			tokenTable.add(token, {});

			// 返回给客户端
			callback({token: token});
		} else {
			callback({error: 'password mismatch'});
		}
	}

	function getConfigFailure(err) {
		callback({error: 'get config failed'});
	}
}

function changePassword(args, callback) {
	var token,
		oldPwd,
		newPwd;

	token = args.token;
	oldPwd = args.oldPwd;
	newPwd = args.newPwd;

	// 基本的参数验证

	if (typeof token !== 'string' || token === '') {
		callback({error: 'token must be string and not empty'});
		return;
	}

	if (typeof oldPwd !== 'string' || oldPwd === '') {
		callback({error: 'oldPwd must be string and not empty'});
		return;
	}

	if (typeof newPwd !== 'string' || newPwd === '') {
		callback({error: 'newPwd must be string and not empty'});
		return;
	}

	// token 必须有效
	if (!tokenTable.exists(token)) {
		callback({error: 'invalid token'});
		return;
	}

	// 验证密码是否匹配
	// 需要从配置中查到当前密码，然后比较
	getConfig(getConfigSuccess, getConfigFailure);

	function getConfigSuccess(config) {
		if (oldPwd === config.password) {
			// 密码正确，可以修改密码
			config.password = newPwd;
			// 保存密码
			setConfig(config, setConfigSuccess, setConfigFailure);
		} else {
			callback({error: 'password mismatch'});
		}

		function setConfigSuccess() {
			// 修改密码成功
			callback({});
		}

		function setConfigFailure(err) {
			// 保存修改后的密码失败
			// 但是此时内存中已经是新密码了
			callback(err);
		}
	}

	function getConfigFailure(err) {
		callback({error: 'get config failed'});
	}

}

function dispatch(args, callback) {
	var token,
		req;

	token = args.token;

	// 令牌必须为字符串，而且不能是空串
	if (typeof token !== 'string' || token === '') {
		callback({error: 'token must be string and not empty'});
		return;
	}

	// 验证该令牌是否存在于令牌表中
	if (!tokenTable.exists(token)) {
		callback({error: 'invalid token'});
		return;
	}

	req = args.req;
	if (typeof req !== 'object' || req === null) {
		callback({error: 'req must be object and not null'});
		return;
	}

	// 把请求交给服务管理器去分发
	serviceManager.dispatch(req, callback);
}

function createToken() {
	var token;
	do {
		token = Math.random().toString();
	} while (tokenTable.get(token) !== undefined);
	return token;
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