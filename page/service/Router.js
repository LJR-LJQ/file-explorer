exports.serviceName = 'Router';
exports.deliver = deliver;
exports.query = query;
exports.receive = receive;

var IdTable = require('./lib/id-table'),
	KeyTable = require('./lib/key-table'),
	rpc = require('./lib/rpc').rpc;

var config = require('./config/router.json');

// 用于保存投递任务
var deliveryTaskTable = IdTable.create();
// 用于保存路由信息
var routeTable = KeyTable.create();

// 初始化一下路由表
initRouteTable();

function deliver(args, callback) {
	var deliverReq,
		target,
		content;

	deliverReq = args;
	target = args.target;
	content = args.content;

	if (!checkTarget() || !checkContent()) return;

	// 创建投递任务
	var deliveryTask = {
		result: {},
		meta: {
			id: undefined,
			target: target,
			local: isLocalTarget(target),
			finish: false,
			delivered: false,
			deliverResult: undefined,
			receiving: false
		}
	};

	// 存入投递任务表，分配 id
	var id = deliveryTaskTable.add(deliveryTask);
	deliveryTask.meta.id = id;

	// 返回基本信息给客户端
	callback(deliveryTask.meta);

	// 本地任务和远程任务分开处理
	if (deliveryTask.meta.local) {
		// 本地投递直接转交给对应的服务处理即可
		serviceManager.dispatch(deliverReq.content, localDeliverCallback);
	} else {
		// 远程投递流程稍微复杂一些
		// 首先根据路由表进行查询
		var targetUrl = routeTable.get(target);
		if (!targetUrl) {
			// 查不到对应的目标
			// 任务结束，且投递未完成
			deliveryTask.meta.finish = true;
			deliveryTask.meta.delivered = false;
			return;
		}

		// 以 rpc 方式进行远程调用
		rpc(targetUrl, 'Router.deliver', req, remoteDeliverSuccess, remoteDeliverFailure);
	}

	function localDeliverCallback(result) {
		// 任务结束，投递成功
		deliveryTask.meta.finish = true;
		deliveryTask.meta.delivered = true;
		deliveryTask.meta.result = undefined;	// 注意本地投递是没有投递结果的

		// 注意这里收到的是任务处理的总结果
		deliveryTask.result = result;
	}

	function remoteDeliverSuccess(result) {
		// 任务结束，投递成功
		// 将投递结果记录下来
		deliveryTask.meta.finish = true;
		deliveryTask.meta.delivered = true;
		deliveryTask.meta.deliverResult = result;
	}

	function remoteDeliverFailure(err) {
		// 任务结束，投递失败
		// 将投递错误信息记录下来
		deliveryTask.meta.finish = true;
		deliveryTask.meta.delivered = false;
		deliveryTask.meta.deliverResult = err;
	}

	function checkTarget() {
		// target 不能省略，而且必须为字符串
		if (typeof target !== 'string') {
			callback({error: 'target must be string'});
			return false;
		} else {
			return true;
		}
	}

	function checkContent() {
		if (!content) {
			callback({error: 'empty content'});
			return false;
		} else {
			return true;
		}
	}
}

function receive(args, callback) {
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

	// 直接返回 deliveryTask.result 即可
	callback(deliveryTask.result);

	// 激活一次接收过程
	startReceive();


	function startReceive() {
		var targetUrl;

		// 如果是远程请求类型，而且投递已经成功完成
		// 同时没有正在接收，那么发起一个新的接收过程
		if (deliveryTask.meta.local) return;
		if (!deliveryTask.meta.finish || !deliveryTask.meta.delivered) return;
		if (deliveryTask.meta.receiving) return;

		console.log('start receiving');

		// 标记为正在接收，防止重入
		deliveryTask.meta.receiving = true;

		// 通过路由表查询地址
		targetUrl = routeTable.get(deliveryTask.meta.target);
		if (!targetUrl) {
			deliveryTask.meta.receiving = false;
			console.log('targetUrl is unknown, return. target=' + deliveryTask.meta.target);
			return;
		}

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

	// 直接返回当前任务状态的元信息
	callback(deliveryTask.meta);
}

function remoteQuery() {
	var targetUrl;

	console.log('remoteQuery...');

	// 只有当投递任务属于远程类型，而且已经完成之后才会发起查询
	// 否则不做任何操作

	// 首先重新获取 targetUrl
	// 如果获取不到，那就不再继续向下执行
	targetUrl = routeTable.get(id);
	if (!targetUrl) {
		deliveryTask.querying = false;
		console.log('targetUrl is unknown, return');
		return;
	}

	console.log('targetUrl=' + targetUrl);
	console.log('sending query...');

	// 向远端发送查询请求
	rpc(targetUrl, 'Router.query', {id: id}, success, failure);

	function success(result) {
		deliveryTask.querying = false;
		console.log('query success');

		// 清空当前的一些状态属性，装入新的结果
		deliveryTask.status = result.status;
		deliveryTask.result = result.result;
		deliveryTask.error = result.error;
	}

	function failure(err) {
		deliveryTask.querying = false;
		console.log('quer failed');
	}
}

function initRouteTable() {
	routeTable.add('miaodeli', 'http://miaodeli.com/service');
}

function isLocalTarget(target) {
	return !target || target === config.localName;
}