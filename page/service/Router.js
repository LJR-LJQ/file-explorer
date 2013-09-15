exports.serviceName = 'Router';
exports.deliver = deliver;
exports.query = query;

var IdTable = require('./lib/id-table'),
	KeyTable = require('./lib/key-table'),
	rpc = require('./lib/rpc').rpc;

var idCount = 0;
// 用于保存投递任务
var deliveryTaskTable = IdTable.create();
// 用于保存路由信息
var routeTable = KeyTable.create();

// 初始化一下路由表
initRouteTable();

function deliver(args, callback, _rawReq, _rawRes) {
	// 如果 target 没有给出，那么就认为是本机
	// 否则按照路由表进行投递

	var target,
		content;

	target = args.target;

	content = args.content;
	if (!content) {
		callback({error: 'empty content'});
		return;
	}

	// 创建一个任务返回给客户端
	var id = deliveryTaskTable.add({});
	callback({
		id: id
	});

	if (!target) {
		localDelivery(content, localCallback, _rawReq, _rawRes);
	} else {
		// 注意这里不要拆开请求
		remoteDelivery(target, args, localCallback);
	}

	function localCallback(result) {
		deliveryTaskTable.set(id, {
			result: result
		});
	}
}

function query(args, callback) {
	var id,
		deliveryTask;

	id = args.id;
	if (!id) {
		callback({error: 'id is missing'});
		return;
	}

	deliveryTask = deliveryTaskTable.get(id);
	if (!deliveryTask) {
		callback({error: 'deliveryTask not found, id=' + id});
		return;
	}

	deliveryTask.id = id;

	// 返回 deliveryTask
	callback(deliveryTask);
}

function initRouteTable() {
	routeTable.add('miaodeli', 'miaodeli.com');
}

function remoteDelivery(target, req, callback) {
	// 根据路由表进行查询
	var host = routeTable.get(target);
	if (!host) {
		callback({error: 'unknown target'});
		return;
	}

	// 进行远程投递
	var targetUrl = 'http://' + host + '/service';

	rpc(targetUrl, 'Router.deliver', req, localCallback, localCallback);

	function localCallback(o) {
		console.log('rpc result here');
		
		callback(o);
	}
}

function localDelivery(req, callback, _rawReq, _rawRes) {
	// 直接交由本地 serviceManager 去分发
	serviceManager.dispatch(req, callback, _rawReq, _rawRes);
}