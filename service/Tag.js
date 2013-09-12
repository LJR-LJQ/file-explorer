// [导出]
exports.serviceName = 'Tag';
exports.get = get;
exports.set = set;

// [变量]
var tags = {};
var clientList = {};

// [函数]
function get(args, callback) {
	var pathname,		// 路径
		value,			// 客户端当前值
		currentValue;	// 服务端当前值

	pathname = args.pathname;
	value = args.value;

	if (!pathname) {
		callback({error: 'pathname is missing'});
		return;
	}

	currentValue = getValue(pathname);

	if (value === undefined) {
		// 立即返回当前值
		callback({value: currentValue});
	} else {
		// 可能需要延迟返回
		if (value === currentValue) {
			// 值相同，暂不返回
			// 记录下客户端请求，放入列表
			addClient(pathname, callback);
		} else {
			// 值不同，立即返回，不放入队列
			callback({value: currentValue});
		}
	}
}

function set(args, callback) {
	var pathname,	// 路径
		value,		// 要设置的新值
		oldValue;	// 服务端当前值

	pathname = args.pathname;
	value = args.value;

	if (!pathname) {
		callback({error: 'pathname is missing'});
		return;
	}

	if (typeof value !== 'string' || value === '') {
		callback({error: 'value must be string and not empty'});
		return;
	}

	oldValue = getValue(pathname);
	if (oldValue !== value) {
		setValue(pathname, value);debugger;
		// 通知队列里的客户端 tag 值已经发生了变化
		releaseClients(pathname);
	}

	// 返回设置后的值
	callback({value: getValue(pathname)});
}

function getValue(pathname) {
	return tags[pathname] || '';
}

function setValue(pathname, value) {
	tags[pathname] = value;
}

function addClient(pathname, callback) {
	if (clientList[pathname] === undefined) {
		clientList[pathname] = [];
	}

	console.log('addClient ' + clientList[pathname].length + '+1');
	clientList[pathname].push(callback);
}

function releaseClients(pathname) {
	var resList,
		value,
		callback;

	resList = clientList[pathname];
	value = getValue(pathname);
	if (resList) {
		console.log('releaseClients ' + resList.length);
		while (resList.length > 0) {
			callback = resList.pop();
			callback({value: value});
		}
	}
}