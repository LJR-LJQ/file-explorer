exports.serviceName = 'Router';
exports.deliver = deliver;
exports.query = query;

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
	// 如果 target 没有给出，那么就认为是本机
	// 否则按照路由表进行投递

	deliverByTarget(args, callback);

	function deliverByTarget(deliverReq, callback) {
		var target;

		// target 可以省略，为 null、undefined
		// 如果给出，则必须为字符串类型
		target = args.target;
		target = target === undefined ? '' : target;
		target = target === null ? '' : target;

		if (typeof target !== 'string') {
			callback({error: 'target must be string'});
			return;
		}

		if (isLocalTarget(target)) {
			localDelivery();
		} else {
			remoteDelivery();
		}

		function localDelivery() {
			if (!checkContent()) return;

			// 创建投递任务
			var deliveryTask = {
				type: 'local',
				status: 'start',
				result: undefined,
				error: undefined
			};

			// 加入投递表获得 id
			var id = deliveryTaskTable.add(deliveryTask);

			// 将 id 返回给客户端
			callback({id: id});

			// 执行实际的投递过程
			serviceManager.dispatch(deliverReq.content, deliverCallback);

			function deliverCallback(result) {
				deliveryTask.status = 'stop';

				// 成功和失败分开处理
				if (result.error) {
					deliveryTask.error = result.error;
				} else {
					deliveryTask.result = result;
				}
			}
		}

		function remoteDelivery() {
			if (!checkContent()) return;

			var target,
				targetUrl;

			target = deliverReq.target;

			// 创建投递任务
			var deliveryTask = {
				type: 'remote',
				status: 'start',
				result: undefined,
				error: undefined,
				target: target,		// 记录下 target
				querying: false		// 当前是否处于查询状态，用于防止查询重入
			};

			// 加入投递表获得 id
			var id = deliveryTaskTable.add(deliveryTask);

			// 将 id 返回给客户端
			callback({id: id});

			// 执行实际的投递过程

			// 根据路由表进行查询
			var targetUrl = routeTable.get(target);
			if (!targetUrl) {
				deliveryTask.status = 'stop';
				deliveryTask.error = 'unknown target';
				return;
			}

			// 以 rpc 方式进行远程调用
			rpc(targetUrl, 'Router.deliver', req, success, failure);

			function success(result) {
				deliveryTask.status = 'stop';
				deliveryTask.result = result;
			}

			function failure(err) {
				deliveryTask.status = 'stop';
				deliveryTask.error = err.error;
			}
		}

		function checkContent() {
			content = deliverReq.content;
			if (!content) {
				callback({error: 'empty content'});
				return false;
			} else {
				return true;
			}
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

	// 直接返回当前任务状态的摘要信息
	callback(summary(id, deliveryTask));

	// 激活一下远程查询功能
	remoteQuery();

	function remoteQuery() {
		var targetUrl;

		console.log('remoteQuery...');

		// 只有当投递任务属于远程类型，而且已经完成之后才会发起查询
		// 否则不做任何操作
		if (deliveryTask.type !== 'remote') {
			console.log('not remote type, return');
			return;
		}

		if (deliveryTask.status !== 'stop') {
			console.log('not stop status, return');
			return;
		}

		// 为了防止重入，如果当前已经在查询状态，则什么也不做
		if (deliveryTask.querying) {
			console.log('querying already, return');
			return;
		}

		// 进入查询状态
		deliveryTask.querying = true;

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

	function summary(id, deliveryTask) {
		var o = {
			id: id,
			status: deliveryTask.status,
			error: deliveryTask.error,
			result: deliveryTask.result
		};
		return o;
	}
}

function initRouteTable() {
	routeTable.add('miaodeli', 'http://miaodeli.com/service');
}

function isLocalTarget(target) {
	return !target || target === config.localName;
}