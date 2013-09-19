// [导出]
exports.serviceName = 'Between';

// 浏览器用下面的 API 来发送请求，以及接收响应
exports.sendRequest = sendRequest;
exports.receiveResponse = receiveResponse;

// 计算机用下面的 API 来注册自身，接收请求，以及发送响应
exports.register = register;
exports.receiveRequest = receiveRequest;
exports.sendResponse = sendResponse;

// [模块]
var IdTable = require('./lib/id-table');


// [变量]
var hostTable;

// [流程]
hostTable = IdTable.create();
hostTable.idCount = 10000; // 从 10000 开始生成 ID

// [函数]

// 参数
// args
// - hostId
// - req 必须为 object 类型，且不能为 null
// 返回值
// 请求处理状态
function sendRequest(args, callback) {
	var hostId,
		req,
		host;

	// hostId 不能省略
	hostId = args.hostId;
	if (!hostId) {
		callback({error: 'hostId is missing'});
		return;
	}

	// req 必须为 object 类型且不能为 null
	req = args.req;
	if (typeof req !== 'object' || req === null) {
		callback({error: 'req must be object and not null'});
		return;
	}

	// hostId 指向的目标必须存在
	host = hostTable.get(hostId);
	if (!host) {
		callback({error: 'host not found, hostId=' + hostId});
		return;
	}

	// 在请求响应表中添加一个新的条目
	var reqId = host.reqResTable.add({
		req: args
	});

	// 返回 reqId 给客户端
	callback({
		hostId: hostId,
		reqId: reqId
	});
}

function receiveResponse(args, callback) {
	var hostId,
		reqId;

	var	host,
		reqRes;

	// hostId 不能省略
	hostId = args.hostId;
	if (!hostId) {
		callback({error: 'hostId is missing'});
		return;
	}

	// hostId 指向的目标必须存在
	host = hostTable.get(hostId);
	if (!host) {
		callback({error: 'host not found, hostId=' + hostId});
		return;
	}

	// reqId 不能省略
	reqId = args.reqId;
	if (!reqId) {
		callback({error: 'reqId is missing'});
		return;
	}

	// reqId 指向的目标必须存在（指向一个 reqRes 记录）
	reqRes = host.reqResTable.get(reqId);
	if (!reqRes) {
		callback({error: 'req not found, reqId=' + reqId});
		return;
	}

	// 返回对应的响应（如果没有响应，则值为 undefined）
	callback({
		hostId: hostId,
		reqId: reqId,
		res: reqRes.res
	});
}

function register(args, callback) {
	var host,
		hostId,
		result;

	// 创建一个新的主机信息，将其添加到主机列表中
	// 并返回主机的 hostId 和密码
	host = {
		pwd: generatePwd(),
		reqResTable: IdTable.create()
	}

	hostId = hostTable.add(host);

	result = {
		hostId: hostId,
		pwd: host.pwd
	};

	callback(result);

	function generatePwd() {
		return Math.random();
	}
}

function receiveRequest(args, callback) {
	var hostId,
		pwd;
	
	var	host,
		reqId,
		req;

	// hostId 不能省略
	hostId = args.hostId;
	if (!hostId) {
		callback({error: 'hostId is missing'});
		return;
	}

	// hostId 指向的目标必须存在
	host = hostTable.get(hostId);
	if (!host) {
		callback({error: 'host not found, hostId=' + hostId});
		return;
	}

	// pwd 不能省略（空字符串也不行）
	pwd = args.pwd;
	if (!pwd) {
		callback({error: 'pwd is missing'});
		return;
	}

	// pwd 必须匹配
	if (pwd !== host.pwd) {
		callback({error: 'pwd mismatch'});
		return;
	}

	// 找到尚未被领取的任务
	host.reqResTable.forEach(function(id, reqRes) {
		// 一个任务，如果标记了 processing 则代表已经在处理中
		if (reqRes.processing === undefined) {
			// 标记为处理中
			reqRes.processing = true;

			// 记录下来
			reqId = id;
			req = reqRes.req;

			// 终止迭代
			return false;
		}
	});

	// 如果没有待处理的请求，就返回空对象
	if (!req) {
		callback({});
		return;
	}

	// 如果有，则返回请求对象
	callback({
		hostId: hostId,
		reqId: id,
		req: req
	});
}

function sendResponse(args, callback) {
	var hostId,
		pwd,
		reqId,
		res;

	var	host,
		reqRes;

	// hostId 不能省略
	hostId = args.hostId;
	if (!hostId) {
		callback({error: 'hostId is missing'});
		return;
	}

	// hostId 指向的目标必须存在
	host = hostTable.get(hostId);
	if (!host) {
		callback({error: 'host not found, hostId=' + hostId});
		return;
	}

	// pwd 不能省略（空字符串也不行）
	pwd = args.pwd;
	if (!pwd) {
		callback({error: 'pwd is missing'});
		return;
	}

	// pwd 必须匹配
	if (pwd !== host.pwd) {
		callback({error: 'pwd mismatch'});
		return;
	}

	// res 必须为 object 类型，而且不为 null
	res = args.res;
	if (typeof res !== 'object' || res === null) {
		callback({error: 'res must be object and not null'});
		return;
	}

	// reqId 不能省略
	reqId = args.reqId;
	if (!reqId) {
		callback({error: 'reqId is missing'});
		return;
	}

	// 找到与 reqId 对应的 reqRes
	reqRes = host.reqResTable.get(reqId);
	if (!reqRes) {
		callback({error: 'reqId not found'});
		return;
	}

	// reqRes 的 processed 不能为 true（为 true 代表已经处理过了）
	if (reqRes.processed === true) {
		callback({error: 'this req has been responded, reqId=' + reqId});
		return;
	}

	reqRes.processed = true;
	reqRes.res = res;

	// 处理完毕，返回一个空对象即可
	callback({});
}