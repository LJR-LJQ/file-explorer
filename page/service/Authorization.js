// [导出]
exports.serviceName = 'Authorization';
exports.auth = auth;
exports.dispatch = dispatch;

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
	serviceManager.dispatch({
		funcName: 'Config.getConfig',
		args: {}
	}, getConfigSuccess, getConfigFailure);

	function getConfigSuccess(config) {
		if (password === config.password) {
			// 创建一个令牌
			token = createToken();

			// 将其加入令牌表
			tokenTable.add(token, {});

			// 返回给客户端
			callback({token: token});debugger;
		} else {
			callback({error: 'password mismatch'});
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