exports.serviceName = 'Authorization';
exports.auth = auth;
exports.dispatch = dispatch;

function auth(args, callback) {
	var password,
		token;

	password = args.password;
	if (password === 'test') {
		token = 'this-is-token';
		callback({token: token});
	} else {
		callback({error: 'password is wrong'});
	}
}

function dispatch(args, callback) {
	var token,
		req;

	token = args.token;
	if (token !== 'this-is-token') {
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